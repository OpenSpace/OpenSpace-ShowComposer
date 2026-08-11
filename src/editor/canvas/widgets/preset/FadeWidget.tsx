import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { StatusBarControlled } from '@/components/StatusBarControlled';
import { componentActions } from '@/editor/componentActions';
import { useProperty } from '@/hooks/properties';
import { FadeComponent } from '@/store';

interface Props {
  component: FadeComponent;
}

function FadeWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  const [opacity] = useProperty('FloatProperty', component.property);
  const [fadeValue] = useProperty(
    'FloatProperty',
    component?.property?.replace('.Opacity', '.Fade') ?? ''
  );
  // Disabled when disconnected or the opacity property does not exist.
  const disabled = !luaApi || opacity === undefined;

  // Reflect the value of fade on the card outline: faded in (green),
  // faded out (red), transitioning/disconnected (grey)
  const outlineColor =
    fadeValue === 1
      ? 'var(--mantine-color-green-6)'
      : fadeValue === 0
        ? 'var(--mantine-color-red-6)'
        : 'var(--mantine-color-gray-5)';

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      disabled={disabled}
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
        outline: `4px solid ${outlineColor}`,
        outlineOffset: '2px',
        transition: 'outline-color 300ms'
      }}
      onClick={componentActions.fade(component)}
    >
      {fadeValue !== undefined ? (
        <StatusBarControlled progress={fadeValue} debounceDuration={0} />
      ) : null}
      {component.gui_name || component.gui_description ? (
        <DisplayLabel>
          {component.gui_name}
          <Information content={component.gui_description} />
        </DisplayLabel>
      ) : null}
    </ComponentContainer>
  );
}

export { FadeWidget };
