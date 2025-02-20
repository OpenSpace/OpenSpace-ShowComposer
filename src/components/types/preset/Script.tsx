import { useOpenSpaceApiStore, ConnectionState } from '@/store';
import { getCopy } from '@/utils/copyHelpers';
import { useEffect, useState } from 'react';
import { sendLuaScript } from '@/utils/triggerHelpers';
import Information from '@/components/common/Information';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ButtonLabel from '@/components/common/ButtonLabel';
import ComponentContainer from '@/components/common/ComponentContainer';
import ToggleComponent from '@/components/common/Toggle';
import { useBoundStore } from '@/store/boundStore';
import { ComponentBaseColors, ScriptComponent } from '@/store/ComponentTypes';
import CodeEditor from '@uiw/react-textarea-code-editor';
import BackgroundHolder from '@/components/common/BackgroundHolder';

interface ScriptGUIProps {
  component: ScriptComponent;
  shouldRender?: boolean;
}
const ScriptGUIComponent: React.FC<ScriptGUIProps> = ({
  component,
  shouldRender = true,
}) => {
  const luaApi = useOpenSpaceApiStore((state) => state.luaApi);

  const updateComponent = useBoundStore((state) => state.updateComponent);
  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          sendLuaScript(component.script);
        },
        isDisabled: false,
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true,
      });
    }
  }, [component.id, component.script, luaApi]);

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
          <div className="flex flex-row gap-2">
            {component.gui_name}
            <Information content={component.gui_description} />
          </div>
        </ButtonLabel>
      ) : null}
    </ComponentContainer>
  );
};

interface ScriptModalProps {
  component: ScriptComponent | null;
  handleComponentData: (data: Partial<ScriptComponent>) => void;
  //   isOpen: boolean;
}
const ScriptModal: React.FC<ScriptModalProps> = ({
  component,
  handleComponentData,
  //   isOpen,
}) => {
  const connectionState = useOpenSpaceApiStore(
    (state) => state.connectionState,
  );
  const [script, setScript] = useState<string>(component?.script || '');
  const [gui_name, setGuiName] = useState<string>(component?.gui_name || '');
  const [lockName, setLockName] = useState<boolean>(
    component?.lockName || false,
  );
  const [gui_description, setGuiDescription] = useState<string>(
    component?.gui_description || '',
  );
  const [backgroundImage, setBackgroundImage] = useState<string>(
    component?.backgroundImage || '',
  );
  const [color, setColor] = useState<string>(
    component?.color || ComponentBaseColors.fade,
  );

  useEffect(() => {
    handleComponentData({
      script,
      backgroundImage,
      lockName,
      gui_name,
      gui_description,
      color,
    });
  }, [
    script,
    backgroundImage,
    gui_name,
    gui_description,
    lockName,
    color,
    handleComponentData,
  ]);

  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="col-span-4 grid gap-2">
            <Label htmlFor="gioname">{getCopy('Script', 'script')}</Label>
            <CodeEditor
              value={script}
              language="lua"
              placeholder="Please enter Lua code."
              onChange={(evn: React.ChangeEvent<HTMLTextAreaElement>) =>
                setScript(evn.target.value)
              }
              padding={15}
              style={{
                // backgroundColor: '#f5f55',
                fontFamily:
                  'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          </div>
          <div className="col-span-3 grid grid-cols-3  gap-2 ">
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="gioname">
                {getCopy('Fade', 'component_name')}
              </Label>
              <Input
                id="guiname"
                placeholder="Name of Component"
                type="text"
                value={gui_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGuiName(e.target.value)
                }
              />
            </div>
            <div className="col-span-1 mt-6 grid gap-2">
              <ToggleComponent
                label="Lock Name"
                value={lockName}
                setValue={setLockName}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <BackgroundHolder
            color={color}
            setColor={setColor}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
          <div className="grid gap-2">
            <Label htmlFor="description">
              {getCopy('Fade', 'gui_description')}
            </Label>
            <Textarea
              className="w-full"
              id="description"
              value={gui_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setGuiDescription(e.target.value)
              }
              placeholder="Type your message here."
            />
          </div>
        </div>
      </div>
    </>
  );
};
export { ScriptModal, ScriptGUIComponent };
