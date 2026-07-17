import React from 'react';

import { FlightControlPanel } from '@/panels/FlightControlPanel/FlightControlPanel';
import { TimeDatePicker } from '@/panels/TimeDatePicker/TimeDatePicker';
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
import { ActionTriggerGUIComponent } from '@/widgets/preset/ActionTrigger';
import { FadeGUIComponent } from '@/widgets/preset/Fade';
import { FlyToGUIComponent } from '@/widgets/preset/FlyTo';
import { FocusComponent } from '@/widgets/preset/Focus';
import { MultiGUIComponent } from '@/widgets/preset/Multi';
import { PageGUIComponent } from '@/widgets/preset/Page';
import { ScriptGUIComponent } from '@/widgets/preset/Script';
import { SessionPlaybackGUIComponent } from '@/widgets/preset/SessionPlayback';
import { SetNavGUIComponent } from '@/widgets/preset/SetNavigation';
import { SetTimeComponent } from '@/widgets/preset/SetTime';
import { BoolGUIComponent } from '@/widgets/property/Boolean';
import { NumberGUIComponent } from '@/widgets/property/Number';
import { TriggerGUIComponent } from '@/widgets/property/Trigger';
import { ImageGUIComponent } from '@/widgets/static/Image';
import { RichTextGUIComponent } from '@/widgets/static/RichText/RichText';
import { TitleGUIComponent } from '@/widgets/static/Title';
import { VideoGUIComponent } from '@/widgets/static/Video';
interface ComponentContentProps {
  component: Component;
}

export const ComponentContent: React.FC<ComponentContentProps> = ({ component }) => {
  switch (component?.type) {
    case 'title':
      return <TitleGUIComponent component={component as TitleComponent} />;
    case 'video':
      return <VideoGUIComponent component={component as VideoComponent} />;
    case 'image':
      return <ImageGUIComponent component={component as ImageComponent} />;
    case 'richtext':
      return <RichTextGUIComponent component={component as RichTextComponent} />;
    case 'timepanel':
      return <TimeDatePicker />;
    case 'settime':
      return <SetTimeComponent component={component as SetTimeType} />;
    case 'navpanel':
      return <FlightControlPanel />;
    case 'sessionplayback':
      return (
        <SessionPlaybackGUIComponent component={component as SessionPlaybackComponent} />
      );
    case 'setnavstate':
      return <SetNavGUIComponent component={component as SetNavComponent} />;
    case 'flyto':
      return <FlyToGUIComponent component={component as FlyToComponent} />;
    case 'fade':
      return <FadeGUIComponent component={component as FadeComponent} />;
    case 'setfocus':
      return <FocusComponent component={component as SetFocusComponent} />;
    case 'boolean':
      return <BoolGUIComponent component={component as BooleanComponent} />;
    case 'number':
      return <NumberGUIComponent component={component as NumberComponent} />;
    case 'trigger':
      return <TriggerGUIComponent component={component as TriggerComponent} />;
    case 'multi':
      return <MultiGUIComponent component={component as MultiComponent} />;
    case 'page':
      return <PageGUIComponent component={component as PageComponent} />;
    case 'action':
      return (
        <ActionTriggerGUIComponent component={component as ActionTriggerComponent} />
      );
    case 'script':
      return <ScriptGUIComponent component={component as ScriptComponent} />;
    default:
      return <div>{getCopy('DraggableComponent', 'unknown_component_type')}</div>;
  }
};
