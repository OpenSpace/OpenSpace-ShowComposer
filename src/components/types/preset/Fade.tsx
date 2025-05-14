import { useEffect, useMemo, useState } from 'react';
import { capitalize } from 'lodash';
import { useShallow } from 'zustand/react/shallow';

import BackgroundHolder from '@/components/common/BackgroundHolder';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import Information from '@/components/common/Information';
import SelectableDropdown from '@/components/common/SelectableDropdown';
import ToggleComponent from '@/components/common/Toggle';
import { VirtualizedCombobox } from '@/components/common/VirtualizedCombobox';
import StatusBarControlled from '@/components/StatusBarControlled';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ConnectionState,
  FadeComponent,
  useOpenSpaceApiStore,
  usePropertyStore} from '@/store';
import { Toggle } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors } from '@/store/ComponentTypes';
// import { EnginePropertyVisibilityKey } from '@/store/apiStore';
import { formatName } from '@/utils/apiHelpers';
import { getCopy } from '@/utils/copyHelpers';
import { triggerFade } from '@/utils/triggerHelpers';

interface FadeGUIProps {
  component: FadeComponent;
  shouldRender?: boolean;
}
const FadeGUIComponent: React.FC<FadeGUIProps> = ({ component, shouldRender = true }) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const subscribeToProperty = usePropertyStore((state) => state.subscribeToProperty);
  const unsubscribeFromProperty = usePropertyStore(
    (state) => state.unsubscribeFromProperty
  );
  const property = usePropertyStore((state) => {
    return state.properties[component.property];
  });
  const fadeProperty = usePropertyStore((state) => {
    const uri = component?.property?.replace('.Opacity', '.Fade');
    return uri ? state.properties[uri] : 0;
  });

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    console.log('Subscribing to property', component.property);
    const uri = component?.property?.replace('.Opacity', '.Fade');
    if (!uri) return;
    subscribeToProperty(component.property.replace('.Opacity', '.Fade'), 0);
    return () => {
      unsubscribeFromProperty(component.property.replace('.Opacity', '.Fade'));
    };
  }, [component.property, connectionState, subscribeToProperty, unsubscribeFromProperty]);
  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerFade(component.property, component.intDuration, component.action);
        },
        isDisabled: property ? false : true
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.id,
    component.action,
    component.intDuration,
    component.action,
    component.property,
    property,
    luaApi
  ]);
  return shouldRender ? (
    <ComponentContainer
      className={`${
        property
          ? property?.value == 1
            ? 'outline-green-500'
            : property?.value == 0
              ? 'outline-red-500'
              : 'outline-grey-500'
          : '!outline-none !outline-0'
      }
      outline outline-4 outline-offset-2 transition-[outline-color] duration-300`}
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)' // Adjust height to account for outline width and offset
        // opacity: property ? 1.0 : 0.15,
      }}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      {fadeProperty ? (
        <StatusBarControlled progress={fadeProperty?.value} debounceDuration={0} />
      ) : null}
      {component.gui_name || component.gui_description ? (
        <ButtonLabel>
          <div className={"flex flex-row gap-2"}>
            {component.gui_name}
            <Information content={component.gui_description} />
          </div>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  ) : null;
};

interface FadeModalProps {
  component: FadeComponent | null;
  handleComponentData: (data: Partial<FadeComponent>) => void;
  //   isOpen: boolean;
}
const FadeModal: React.FC<FadeModalProps> = ({
  component,
  handleComponentData
  //   isOpen,
}) => {
  const connectionState = useOpenSpaceApiStore((state) => state.connectionState);
  const properties = usePropertyStore(
    useShallow((state) =>
      Object.keys(state.properties)
        .filter((a) => a.endsWith('.Opacity'))
        .reduce((acc: Record<string, any>, key: string) => {
          acc[key] = state.properties[key];
          return acc;
        }, {})
    )
  );
  // const properties = usePropertyStore((state) => state.properties);

  // const Visibility = usePropertyStore(
  //   (state) => state.properties[EnginePropertyVisibilityKey],
  // );
  const [property, setProperty] = useState<string>(component?.property || '');
  const [intDuration, setIntDuration] = useState<number>(component?.intDuration || 1);
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(component?.lockName || false);
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || ''
  );
  const [action, setAction] = useState<string>(component?.action || 'toggle');
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || ''
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.fade
  );

  const handlePropertyChange = (property: string) => {
    setProperty(property);
    if (!lockName) {
      setGuiName(
        `${formatName(
          property.replace(/Scene.|.Renderable|.Opacity/g, '').replace(/\./g, ' > ')
        )} ${capitalize(action)}`
      );
      setGuiDescription(
        `${property.trim()} ${action === 'toggle' ? 'in and out' : action}`
      );
    }
  };

  const handleActionChange = (action: string) => {
    setAction(action);
    if (!lockName) {
      setGuiName(
        `${formatName(
          property.replace(/Scene.|.Renderable|.Opacity/g, '').replace(/\./g, ' > ')
        )} ${capitalize(action)}`
      );
      setGuiDescription(
        `${property.trim()} ${action === 'toggle' ? 'in and out' : action}`
      );
    }
  };

  useEffect(() => {
    handleComponentData({
      property,
      intDuration,
      action: action as Toggle,
      backgroundImage,
      lockName,
      gui_name,
      gui_description,
      color
    });
  }, [
    property,
    intDuration,
    action,
    backgroundImage,
    gui_name,
    gui_description,
    lockName,
    color,
    handleComponentData
  ]);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);

  const sortedKeys: Record<string, string> = useMemo(
    () =>
      Object.keys(properties)
        // .filter((a) => a.endsWith('.Fade') && !a.endsWith('.Appearance.Fade'))
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
        }, {}),
    [properties]
  );
  return (
    <>
      <div className={"grid grid-cols-1 gap-4"}>
        <div className={"grid grid-cols-1 gap-4"}>
          <div className={"grid gap-2"}>
            <div className={"text-sm font-medium text-black"}>
              {getCopy('Fade', 'property')}
            </div>
            <VirtualizedCombobox
              options={Object.keys(sortedKeys)}
              selectOption={(v: string) => handlePropertyChange(sortedKeys[v])}
              selectedOption={
                Object.keys(sortedKeys).find((key) => sortedKeys[key] === property) || ''
              }
              searchPlaceholder={"Search the Scene..."}
            />
          </div>
        </div>
        <div className={"grid grid-cols-2 gap-4"}>
          <div className={"grid gap-2"}>
            <Label>{getCopy('Fade', 'action_type')}</Label>
            <SelectableDropdown
              options={['toggle', 'on', 'off']}
              selected={action}
              setSelected={handleActionChange}
            />
          </div>

          <div className={"grid gap-2"}>
            <Label htmlFor={"duration"}>{getCopy('Fade', 'fade_duration')}</Label>
            <Input
              id={"duration"}
              placeholder={"Duration to Fade"}
              type={"number"}
              min={0}
              max={20}
              step={0.1}
              // className=""
              value={intDuration}
              onChange={(e) => setIntDuration(parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className={"grid grid-cols-4 "}>
          <div className={"col-span-3 grid grid-cols-3 gap-4"}>
            <div className={"col-span-2 grid gap-2"}>
              <Label htmlFor={"gioname"}>{getCopy('Fade', 'component_name')}</Label>
              <Input
                id={"guiname"}
                placeholder={"Name of Component"}
                type={"text"}
                value={gui_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGuiName(e.target.value)
                }
              />
            </div>
            <div className={"col-span-1 mt-6 grid gap-2"}>
              <ToggleComponent
                label={"Lock Name"}
                value={lockName}
                setValue={setLockName}
              />
            </div>
          </div>
        </div>
        <div className={"grid grid-cols-1 gap-4"}>
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className={"grid gap-2"}>
            <Label htmlFor={"description"}>{getCopy('Fade', 'gui_description')}</Label>
            <Textarea
              className={"w-full"}
              id={"description"}
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder={"Type your message here."}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export { FadeGUIComponent,FadeModal };
