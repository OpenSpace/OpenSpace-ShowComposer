import { ComponentContainer } from '@/components/ComponentContainer';
import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { componentActions } from '@/editor/componentActions';
import { PageComponent } from '@/types/components';

interface Props {
  component: PageComponent;
}

function PageWidget({ component }: Props) {
  return (
    <ComponentContainer
      backgroundImage={component.backgroundImage}
      backgroundColor={component.color}
      onClick={componentActions.page(component)}
    >
      <DisplayLabel>
        {component.gui_name}
        <Information content={component.gui_description} />
      </DisplayLabel>
    </ComponentContainer>
  );
}

export { PageWidget };
