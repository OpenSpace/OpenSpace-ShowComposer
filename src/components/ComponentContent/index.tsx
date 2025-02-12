import React from 'react';
import {
  Component,
  TitleComponent,
  SetTimeComponent as SetTimeType,
  FadeComponent,
  FlyToComponent,
  SetFocusComponent,
  BooleanComponent,
  TriggerComponent,
  NumberComponent,
  VideoComponent,
  RichTextComponent,
  MultiComponent,
  ImageComponent,
  PageComponent,
  SessionPlaybackComponent,
  SetNavComponent,
} from '@/store';

import { TitleGUIComponent } from '../types/static/Title';
import TimeDatePicker from '../types/static/TimeDatePicker';
import { SetTimeComponent } from '../types/preset/SetTime';
import FlightControlPanel from '../types/static/FlightControlPanel';
import { FlyToGUIComponent } from '../types/preset/FlyTo';
import { FadeGUIComponent } from '../types/preset/Fade';
import { FocusComponent } from '../types/preset/Focus';
import { BoolGUIComponent } from '../types/property/Boolean';
import { TriggerGUIComponent } from '../types/property/Trigger';
import { NumberGUIComponent } from '../types/property/Number';
import { VideoGUIComponent } from '../types/static/Video';
import { RichTextGUIComponent } from '../types/static/RichText';
import { MultiGUIComponent } from '../types/preset/Multi';
import { ImageGUIComponent } from '../types/static/Image';
import { SessionPlaybackGUIComponent } from '../types/preset/SessionPlayback';
import { SetNavGUIComponent } from '../types/preset/SetNavigation';
import { PageGUIComponent } from '../types/preset/Page';
import { getCopy } from '@/utils/copyHelpers';
import { ActionTriggerGUIComponent } from '../types/preset/ActionTrigger';
import {
  ActionTriggerComponent,
  ScriptComponent,
} from '@/store/ComponentTypes';
import { ScriptGUIComponent } from '../types/preset/Script';
interface ComponentContentProps {
  component: Component;
}

export const ComponentContent: React.FC<ComponentContentProps> = ({
  component,
}) => {
  switch (component?.type) {
    case 'title':
      return <TitleGUIComponent component={component as TitleComponent} />;
    case 'video':
      return <VideoGUIComponent component={component as VideoComponent} />;
    case 'image':
      return <ImageGUIComponent component={component as ImageComponent} />;
    case 'richtext':
      return (
        <RichTextGUIComponent component={component as RichTextComponent} />
      );
    case 'timepanel':
      return <TimeDatePicker />;
    case 'settime':
      return <SetTimeComponent component={component as SetTimeType} />;
    case 'navpanel':
      return <FlightControlPanel />;
    case 'sessionplayback':
      return (
        <SessionPlaybackGUIComponent
          component={component as SessionPlaybackComponent}
        />
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
        <ActionTriggerGUIComponent
          component={component as ActionTriggerComponent}
        />
      );
    case 'script':
      return <ScriptGUIComponent component={component as ScriptComponent} />;
    default:
      return (
        <div>{getCopy('DraggableComponent', 'unknown_component_type')}</div>
      );
  }
};
