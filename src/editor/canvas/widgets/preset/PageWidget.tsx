import { useEffect } from 'react';

import ComponentContainer from '@/components/ComponentContainer';
import DisplayLabel from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { useBoundStore } from '@/store/boundStore';
import { PageComponent } from '@/types/components';

interface Props {
  component: PageComponent;
  shouldRender?: boolean;
}

function PageWidget({ component, shouldRender = true }: Props) {
  const updateComponent = useBoundStore((state) => state.updateComponent);
  const goToPage = useBoundStore((state) => state.goToPage);

  useEffect(() => {
    updateComponent(component.id, {
      triggerAction: () => {
        goToPage(component.page - 1);
      }
    });
  }, [component.page]);

  if (!shouldRender) {
    return null;
  }

  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
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

export { PageWidget };
