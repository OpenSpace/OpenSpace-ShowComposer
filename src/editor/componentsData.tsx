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
import { ActionTriggerModal } from '@/editor/sidebar/modals/preset/ActionTriggerModal';
import { FadeModal } from '@/editor/sidebar/modals/preset/FadeModal';
import { FlyToModal } from '@/editor/sidebar/modals/preset/FlyToModal';
import { FocusModal } from '@/editor/sidebar/modals/preset/FocusModal';
import { MultiModal } from '@/editor/sidebar/modals/preset/MultiModal';
import { PageModal } from '@/editor/sidebar/modals/preset/PageModal';
import { ScriptModal } from '@/editor/sidebar/modals/preset/ScriptModal';
import { SessionPlaybackModal } from '@/editor/sidebar/modals/preset/SessionPlaybackModal';
import { SetNavModal } from '@/editor/sidebar/modals/preset/SetNavigationModal';
import { SetTimeModal } from '@/editor/sidebar/modals/preset/SetTimeModal';
import { BoolModal } from '@/editor/sidebar/modals/property/BooleanModal';
import { NumberModal } from '@/editor/sidebar/modals/property/NumberModal';
import { TriggerModal } from '@/editor/sidebar/modals/property/TriggerModal';
import { ComponentModalChildProps } from '@/editor/sidebar/modals/saveComponent';
import { ImageModal } from '@/editor/sidebar/modals/static/ImageModal';
import { RichTextModal } from '@/editor/sidebar/modals/static/RichText/RichTextModal';
import { TitleModal } from '@/editor/sidebar/modals/static/TitleModal';
import { VideoModal } from '@/editor/sidebar/modals/static/VideoModal';
import {
  AlignJustifyIcon,
  BookOpenCheckIcon,
  CirclePlayIcon,
  CodeIcon,
  CompassIcon,
  GroupIcon,
  HashIcon,
  HistoryIcon,
  ImageIcon,
  LetterTextIcon,
  PlaneIcon,
  SunMoonIcon,
  TelescopeIcon,
  ToggleRightIcon,
  VideoIcon
} from '@/icons/icons';
import { Resources } from '@/localization/resources';
import { Component, ComponentFor, ComponentType } from '@/types/components';

// Keys available in the `main` i18next namespace - the label source for the sidebar + modal title
type MainKey = keyof Resources['en']['main'];

type ComponentDescriptor<K extends ComponentType> = {
  type: K;
  nameKey: MainKey; // i18next key in the `main` namespace
  group: 'preset' | 'property' | 'static';
  renderIcon: (size?: number) => JSX.Element;
  isMultiOption: boolean;
  renderWidget: (c: ComponentFor[K]) => JSX.Element;
  renderModal?: (props: ComponentModalChildProps<K>) => JSX.Element;
};

export const componentsData: { [K in ComponentType]?: ComponentDescriptor<K> } = {
  multi: {
    type: 'multi',
    nameKey: 'multi',
    group: 'preset',
    renderIcon: (s = 20) => <GroupIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <MultiWidget component={c} />,
    renderModal: (props) => <MultiModal {...props} />
  },
  setfocus: {
    type: 'setfocus',
    nameKey: 'set-focus',
    group: 'preset',
    renderIcon: (s = 20) => <TelescopeIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <FocusWidget component={c} />,
    renderModal: (props) => <FocusModal {...props} />
  },
  fade: {
    type: 'fade',
    nameKey: 'fade',
    group: 'preset',
    renderIcon: (s = 20) => <SunMoonIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <FadeWidget component={c} />,
    renderModal: (props) => <FadeModal {...props} />
  },
  flyto: {
    type: 'flyto',
    nameKey: 'fly-to',
    group: 'preset',
    renderIcon: (s = 20) => <PlaneIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <FlyToWidget component={c} />,
    renderModal: (props) => <FlyToModal {...props} />
  },
  settime: {
    type: 'settime',
    nameKey: 'set-time',
    group: 'preset',
    renderIcon: (s = 20) => <HistoryIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <SetTimeWidget component={c} />,
    renderModal: (props) => <SetTimeModal {...props} />
  },
  setnavstate: {
    type: 'setnavstate',
    nameKey: 'set-nav',
    group: 'preset',
    renderIcon: (s = 20) => <CompassIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <SetNavigationWidget component={c} />,
    renderModal: (props) => <SetNavModal {...props} />
  },
  sessionplayback: {
    type: 'sessionplayback',
    nameKey: 'playback',
    group: 'preset',
    renderIcon: (s = 20) => <VideoIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <SessionPlaybackWidget component={c} />,
    renderModal: (props) => <SessionPlaybackModal {...props} />
  },
  action: {
    type: 'action',
    nameKey: 'action',
    group: 'preset',
    renderIcon: (s = 20) => <CirclePlayIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <ActionTriggerWidget component={c} />,
    renderModal: (props) => <ActionTriggerModal {...props} />
  },
  page: {
    type: 'page',
    nameKey: 'page',
    group: 'preset',
    renderIcon: (s = 20) => <BookOpenCheckIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <PageWidget component={c} />,
    renderModal: (props) => <PageModal {...props} />
  },
  script: {
    type: 'script',
    nameKey: 'script',
    group: 'preset',
    renderIcon: (s = 20) => <CodeIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <ScriptWidget component={c} />,
    renderModal: (props) => <ScriptModal {...props} />
  },
  number: {
    type: 'number',
    nameKey: 'number',
    group: 'property',
    renderIcon: (s = 20) => <HashIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <NumberWidget component={c} />,
    renderModal: (props) => <NumberModal {...props} />
  },
  boolean: {
    type: 'boolean',
    nameKey: 'boolean',
    group: 'property',
    renderIcon: (s = 20) => <ToggleRightIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <BooleanWidget component={c} />,
    renderModal: (props) => <BoolModal {...props} />
  },
  trigger: {
    type: 'trigger',
    nameKey: 'trigger',
    group: 'property',
    renderIcon: (s = 20) => <CirclePlayIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <TriggerWidget component={c} />,
    renderModal: (props) => <TriggerModal {...props} />
  },
  richtext: {
    type: 'richtext',
    nameKey: 'rich-text',
    group: 'static',
    renderIcon: (s = 20) => <AlignJustifyIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <RichTextWidget component={c} />,
    renderModal: (props) => <RichTextModal {...props} />
  },
  title: {
    type: 'title',
    nameKey: 'title',
    group: 'static',
    renderIcon: (s = 20) => <LetterTextIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <TitleWidget component={c} />,
    renderModal: (props) => <TitleModal {...props} />
  },
  video: {
    type: 'video',
    nameKey: 'video',
    group: 'static',
    renderIcon: (s = 20) => <VideoIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <VideoWidget component={c} />,
    renderModal: (props) => <VideoModal {...props} />
  },
  image: {
    type: 'image',
    nameKey: 'image',
    group: 'static',
    renderIcon: (s = 20) => <ImageIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <ImageWidget component={c} />,
    renderModal: (props) => <ImageModal {...props} />
  }
};

export const componentPalette = Object.values(componentsData).filter(
  (d) => d !== undefined
);

export function renderComponentWidget(component: Component): JSX.Element | null {
  const render = componentsData[component.type]?.renderWidget as
    | ((c: Component) => JSX.Element)
    | undefined;
  return render ? render(component) : null;
}

export function renderComponentModal(
  type: ComponentType | '',
  props: ComponentModalChildProps
): JSX.Element | null {
  if (!type) {
    return null;
  }
  const render = componentsData[type]?.renderModal as
    | ((props: ComponentModalChildProps) => JSX.Element)
    | undefined;
  return render ? render(props) : null;
}
