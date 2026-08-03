import { useEffect } from 'react';

import { useOpenSpaceApi } from '@/api/hooks';
import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { useProperty } from '@/hooks/properties';
import { BooleanComponent } from '@/store';
import { useBoundStore } from '@/store/boundStore';
import { triggerBool } from '@/utils/triggerHelpers';

interface Props {
  component: BooleanComponent;
  shouldRender?: boolean;
}

function BooleanWidget({ component, shouldRender = true }: Props) {
  const luaApi = useOpenSpaceApi();
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const [value] = useProperty('BoolProperty', component.property);

  useEffect(() => {
    if (luaApi) {
      updateComponent(component.id, {
        triggerAction: () => {
          triggerBool(component.property, component.action);
        },
        isDisabled: value === undefined
      });
    } else {
      updateComponent(component.id, {
        isDisabled: true
      });
    }
  }, [
    component.id,
    component.action,
    component.property,
    value,
    luaApi,
    updateComponent
  ]);

  if (!shouldRender) {
    return null;
  }

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
      style={{
        top: '4px',
        left: '4px',
        width: 'calc(100% - 8px)', // Adjust width to account for outline width and offset
        height: 'calc(100% - 8px)', // Adjust height to account for outline width and offset
        outline: `4px solid ${outlineColor}`,
        outlineOffset: '2px',
        transition: 'outline-color 300ms'
      }}
      onClick={() => {
        component.triggerAction?.();
      }}
    >
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { BooleanWidget };
