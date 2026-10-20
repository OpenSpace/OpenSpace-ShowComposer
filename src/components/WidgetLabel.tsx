import { Text } from '@mantine/core';

import { DisplayLabel } from '@/components/DisplayLabel';
import { Information } from '@/components/Information';
import { zIndex } from '@/editor/canvas/zIndex';

interface Props {
  name: string;
  description: string;
}

/**
 * The name of a widget, with an info popover for its description. Renders nothing if
 * the widget has neither a name nor a description.
 */
export function WidgetLabel({ name, description }: Props) {
  if (!name && !description) {
    return null;
  }

  return (
    <DisplayLabel mx={'auto'} pos={'relative'} style={{ zIndex: zIndex.widgetLabel }}>
      <Text inherit>{name}</Text>
      <Information content={description} />
    </DisplayLabel>
  );
}
