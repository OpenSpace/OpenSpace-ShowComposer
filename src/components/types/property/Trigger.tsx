import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import BackgroundHolder from '@/components/common/BackgroundHolder';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import Information from '@/components/common/Information';
import ToggleComponent from '@/components/common/Toggle';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ConnectionState,
  TriggerComponent,
  useOpenSpaceApiStore,
  usePropertyStore
} from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/types/components';
import { AnyProperty } from '@/types/Property/property';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';
import { triggerTrigger } from '@/utils/triggerHelpers';

interface TriggerGUIProps {
  component: TriggerComponent;
  shouldRender?: boolean;
}
const TriggerGUIComponent: React.FC<TriggerGUIProps> = ({
  component,
  shouldRender = true
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const subscribeToProperty = usePropertyStore((state) => state.subscribeToProperty);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty
  );
  const property = usePropertyStore((state) => state.properties[component.property]);
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    // console.log('Subscribing to property', component.property);
    subscribeToProperty(component.property, 500);
    return () => {
      unsubscribeFromProperty(component.property);
    };
  }, [component.property, connectionState, subscribeToProperty, unsubscribeFromProperty]);

  useEffect(() => {
    if (luaApi) {
      // console.log('Registering trigger action');
      updateComponent(component.id, {
        triggerAction: () => {
          triggerTrigger(component.property);
        },
        isDisabled: property ? false : true
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, property]);

  return shouldRender ? (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => component.triggerAction?.()}
    >
      <ButtonLabel>
        <>
          {component.gui_name}
          <Information content={component.gui_description} />
        </>
      </ButtonLabel>
    </ComponentContainer>
  ) : null;
};

interface TriggerModalProps {
  component: TriggerComponent | null;
  handleComponentData: (data: Partial<TriggerComponent>) => void;
}

const TriggerModal: React.FC<TriggerModalProps> = ({
  component,
  handleComponentData
}) => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.trigger
  );

  useEffect(() => {
    const propertyData = usePropertyStore.getState().properties[property] as AnyProperty;
    if (!propertyData || lockName) return;
    setGuiName(formatName(propertyData.uri));
    setGuiDescription(propertyData.metaData.description);
  }, [property]);

  useEffect(() => {
    handleComponentData({
      property,
      gui_name,
      gui_description,
      lockName,
      backgroundImage,
      color
    });
  }, [
    property,
    gui_name,
    gui_description,
    lockName,
    backgroundImage,
    color,
    handleComponentData
  ]);
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);
  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => properties[a].metaData?.type === 'TriggerProperty')
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;
      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }
      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = formatName(key);
      acc[newValue] = key;
      return acc;
    }, {});
  return (
    <>
      <div className={'grid grid-cols-1 gap-4'}>
        <div className={'grid grid-cols-1 gap-4'}>
          <div className={'grid gap-2'}>
            <div className={'text-sm font-medium text-black'}>
              {getCopy('Trigger', 'property')}
            </div>
            <VirtualizedCombobox
              options={Object.keys(sortedKeys)}
              selectOption={(v: string) => setProperty(sortedKeys[v])}
              selectedOption={
                Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
              }
              searchPlaceholder={'Search the Scene...'}
            />
          </div>
        </div>
        <div className={'grid grid-cols-4 gap-2'}>
          <div className={'col-span-3 grid gap-2'}>
            <Label htmlFor={'gioname'}>{getCopy('Trigger', 'component_name')}</Label>
            <Input
              id={'guiname'}
              placeholder={'Name of Component'}
              type={'text'}
              value={gui_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGuiName(e.target.value)
              }
            />
          </div>
          <div className={'col-span-1 mt-6 grid gap-2'}>
            <ToggleComponent
              label={'Lock Name'}
              value={lockName}
              setValue={setLockName}
            />
          </div>
        </div>
        <div className={'grid grid-cols-1 gap-4'}>
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className={'grid gap-2'}>
            <Label htmlFor={'description'}>{getCopy('Trigger', 'gui_description')}</Label>
            <Textarea
              className={'w-full'}
              id={'description'}
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder={'Type your message here.'}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export { TriggerGUIComponent, TriggerModal };
