import { useEffect, useState } from 'react';
import { InputLabel } from '@mantine/core';
import { useShallow } from 'zustand/react/shallow';

import { useOpenSpaceApi } from '@/api/hooks';
import BackgroundHolder from '@/components/common/BackgroundHolder';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import { Information } from '@/components/common/Information';
import ToggleComponent from '@/components/common/Toggle';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProperty, useSubscribeToProperty } from '@/hooks/properties';
import { usePropertyStore } from '@/store';
import {
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAnchorKey
} from '@/store/apiStore';
import { useBoundStore } from '@/store/boundStore';
import { SetFocusComponent } from '@/types/components';
import { ComponentBaseColors } from '@/types/components';
import { formatName, getStringBetween } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';

interface FocusGUIProps {
  component: SetFocusComponent;
  shouldRender?: boolean;
}
const FocusComponent: React.FC<FocusGUIProps> = ({ component, shouldRender = true }) => {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  // Reading Renderable.Enabled lets us check whether the scene node exists.
  const [enabledValue] = useProperty(
    'BoolProperty',
    `Scene.${component.property}.Renderable.Enabled`
  );

  useSubscribeToProperty(NavigationAnchorKey);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          luaApi.setPropertyValueSingle(RetargetAnchorKey, null);
          luaApi.setPropertyValueSingle(NavigationAnchorKey, component.property);
          luaApi.setPropertyValueSingle(NavigationAimKey, '');
        },
        isDisabled: enabledValue === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [component.id, component.property, luaApi, enabledValue]);

  if (!shouldRender) return null;

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      {component.gui_name || component.gui_description ? (
        <ButtonLabel>
          <div className={'flex flex-row gap-2'}>
            {component.gui_name}
            {/* {CurrentAnchor?.value && (
              <p>{`Current Anchor: ${CurrentAnchor?.value}`}</p>
            )} */}
            <Information content={component.gui_description} />
          </div>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  );
};

interface FocusModalProps {
  component: SetFocusComponent | null;
  handleComponentData: (data: Partial<SetFocusComponent>) => void;
  //   isOpen: boolean;
}
const FocusModal: React.FC<FocusModalProps> = ({
  component,
  handleComponentData
  //   isOpen,
}) => {
  const properties = usePropertyStore(useShallow((state) => state.properties));
  const [property, setProperty] = useState<string>(component?.property || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.setfocus
  );

  const [, , currentAnchorMeta] = useProperty('StringProperty', NavigationAnchorKey);

  const handlePropertyChange = (property: string) => {
    setProperty(property);
    if (!lockName) {
      setGuiName(`Focus on ${property}`);
      setGuiDescription(`Focus on ${property}. ${currentAnchorMeta?.description}`);
    }
  };

  useEffect(() => {
    handleComponentData({
      property,
      backgroundImage,
      lockName,
      gui_name,
      gui_description,
      color
    });
  }, [
    property,
    backgroundImage,
    gui_name,
    gui_description,
    lockName,
    color,
    handleComponentData
  ]);
  const sortedKeys: Record<string, string> = Object.keys(properties)
    .filter((a) => a.includes('.Renderable'))
    .sort((a, b) => {
      const periodCountA = (a.match(/\./g) || []).length;
      const periodCountB = (b.match(/\./g) || []).length;
      if (periodCountA !== periodCountB) {
        return periodCountA - periodCountB;
      }
      return a.localeCompare(b);
    })
    .reduce((acc: Record<string, string>, key) => {
      const newValue = getStringBetween(key, 'Scene.', '.Renderable');
      acc[formatName(newValue)] = newValue;
      return acc;
    }, {});
  return (
    <>
      <div className={'grid grid-cols-1 gap-4'}>
        <div className={'grid grid-cols-1 gap-4'}>
          <div className={'grid gap-2'}>
            <div className={'text-sm font-medium text-black'}>
              {getCopy('Focus', 'property')}
            </div>
            <VirtualizedCombobox
              options={Object.keys(sortedKeys)}
              selectOption={(v: string) => handlePropertyChange(sortedKeys[v])}
              selectedOption={
                (Object.keys(sortedKeys).find((key) => key === property) as string) || ''
              }
              searchPlaceholder={'Search the Scene...'}
            />
          </div>
        </div>
        <div className={'grid grid-cols-4 gap-4'}>
          <div className={'col-span-3 grid gap-2'}>
            <InputLabel htmlFor={'gioname'}>
              {getCopy('Focus', 'component_name')}
            </InputLabel>
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
          <div className={'cols-span-1 mt-6 grid gap-2'}>
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
            <InputLabel htmlFor={'description'}>
              {getCopy('Focus', 'gui_description')}
            </InputLabel>
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
export { FocusComponent, FocusModal };
