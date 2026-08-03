import { FlightControlPanel } from '@/editor/canvas/panels/FlightControlPanel/FlightControlPanel';
import { TimeDatePicker } from '@/editor/canvas/panels/TimeDatePicker/TimeDatePicker';
import { ActionTriggerWidget } from '@/editor/canvas/widgets/preset/ActionTriggerWidget';
import { FadeWidget } from '@/editor/canvas/widgets/preset/FadeWidget';
import { FlyToWidget } from '@/editor/canvas/widgets/preset/FlyToWidget';
import { FocusWidget } from '@/editor/canvas/widgets/preset/FocusWidget';
import { MultiWidget } from '@/editor/canvas/widgets/preset/MultiWidget';
import { PageWidget } from '@/editor/canvas/widgets/preset/PageWidget';
import { ScriptWidget } from '@/editor/canvas/widgets/preset/ScriptWidget';
import { SessionPlaybackWidget } from '@/editor/canvas/widgets/preset/SessionPlaybackWidget';
import { SetNavigationWidget } from '@/editor/canvas/widgets/preset/SetNavigationWidget';
import { SetTimeWidget } from '@/editor/canvas/widgets/preset/SetTimeWidget';
import { BooleanWidget } from '@/editor/canvas/widgets/property/BooleanWidget';
import { NumberWidget } from '@/editor/canvas/widgets/property/NumberWidget';
import { TriggerWidget } from '@/editor/canvas/widgets/property/TriggerWidget';
import { ImageWidget } from '@/editor/canvas/widgets/static/ImageWidget';
import { RichTextWidget } from '@/editor/canvas/widgets/static/RichTextWidget';
import { TitleWidget } from '@/editor/canvas/widgets/static/TitleWidget';
import { VideoWidget } from '@/editor/canvas/widgets/static/VideoWidget';
import {
  BooleanComponent,
  Component,
  FadeComponent,
  FlyToComponent,
  ImageComponent,
  MultiComponent,
  NumberComponent,
  PageComponent,
  RichTextComponent,
  SessionPlaybackComponent,
  SetFocusComponent,
  SetNavComponent,
  SetTimeComponent as SetTimeType,
  TitleComponent,
  TriggerComponent,
  VideoComponent
} from '@/store';
import { ActionTriggerComponent, ScriptComponent } from '@/types/components';
import { getCopy } from '@/utils/copyHelpers';
interface Props {
  component: Component;
}

export function ComponentContent({ component }: Props) {
  switch (component?.type) {
    case 'title':
      return <TitleWidget component={component as TitleComponent} />;
    case 'video':
      return <VideoWidget component={component as VideoComponent} />;
    case 'image':
      return <ImageWidget component={component as ImageComponent} />;
    case 'richtext':
      return <RichTextWidget component={component as RichTextComponent} />;
    case 'timepanel':
      return <TimeDatePicker />;
    case 'settime':
      return <SetTimeWidget component={component as SetTimeType} />;
    case 'navpanel':
      return <FlightControlPanel />;
    case 'sessionplayback':
      return <SessionPlaybackWidget component={component as SessionPlaybackComponent} />;
    case 'setnavstate':
      return <SetNavigationWidget component={component as SetNavComponent} />;
    case 'flyto':
      return <FlyToWidget component={component as FlyToComponent} />;
    case 'fade':
      return <FadeWidget component={component as FadeComponent} />;
    case 'setfocus':
      return <FocusWidget component={component as SetFocusComponent} />;
    case 'boolean':
      return <BooleanWidget component={component as BooleanComponent} />;
    case 'number':
      return <NumberWidget component={component as NumberComponent} />;
    case 'trigger':
      return <TriggerWidget component={component as TriggerComponent} />;
    case 'multi':
      return <MultiWidget component={component as MultiComponent} />;
    case 'page':
      return <PageWidget component={component as PageComponent} />;
    case 'action':
      return <ActionTriggerWidget component={component as ActionTriggerComponent} />;
    case 'script':
      return <ScriptWidget component={component as ScriptComponent} />;
    default:
      return <div>{getCopy('DraggableComponent', 'unknown_component_type')}</div>;
  }
}
