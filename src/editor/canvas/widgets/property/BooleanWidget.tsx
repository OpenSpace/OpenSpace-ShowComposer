import { useOpenSpaceApi } from '@/api/hooks';
import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { componentActions } from '@/editor/componentActions';
import { useProperty } from '@/hooks/properties';
import { BooleanComponent } from '@/store';

interface Props {
  component: BooleanComponent;
}

function BooleanWidget({ component }: Props) {
  const luaApi = useOpenSpaceApi();
  const [value] = useProperty('BoolProperty', component.property);
  // Disabled when disconnected or the property does not exist.
  const disabled = !luaApi || value === undefined;

  // Reflect the property state on the card outline: on (green), off (red),
  // unknown/disconnected (grey)
  const outlineColor =
    value === true
      ? 'var(--mantine-color-green-6)'
      : value === false
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
      onClick={componentActions.boolean(component)}
    >
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { BooleanWidget };
