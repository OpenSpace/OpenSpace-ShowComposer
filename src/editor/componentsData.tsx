import { Dispatch, SetStateAction } from 'react';

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
// The setter a modal receives (mirrors ComponentModal's useState setter)
type SetComponentData = Dispatch<SetStateAction<Partial<Component>>>;

// Keys available in the `main` i18next namespace - the label source for the sidebar + modal title
type MainKey = keyof Resources['en']['main'];

type ComponentDescriptor<K extends ComponentType> = {
  type: K;
  nameKey: MainKey; // i18next key in the `main` namespace
  group: 'preset' | 'property' | 'static';
  renderIcon: (size?: number) => JSX.Element;
  isMultiOption: boolean;
  renderWidget: (c: ComponentFor[K]) => JSX.Element;
  // c can be null: in create mode the modal is opened before a component exists.
  renderModal?: (c: ComponentFor[K] | null, set: SetComponentData) => JSX.Element;
};

// One table to rule them all: the sidebar, the multi-option picker, widgets and modals are all derived from this table.
export const componentsData: { [K in ComponentType]?: ComponentDescriptor<K> } = {
  multi: {
    type: 'multi',
    nameKey: 'multi',
    group: 'preset',
    renderIcon: (s = 20) => <GroupIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <MultiWidget component={c} />,
    renderModal: (c, set) => <MultiModal component={c} handleComponentData={set} />
  },
  setfocus: {
    type: 'setfocus',
    nameKey: 'set-focus',
    group: 'preset',
    renderIcon: (s = 20) => <TelescopeIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <FocusWidget component={c} />,
    renderModal: (c, set) => <FocusModal component={c} handleComponentData={set} />
  },
  fade: {
    type: 'fade',
    nameKey: 'fade',
    group: 'preset',
    renderIcon: (s = 20) => <SunMoonIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <FadeWidget component={c} />,
    renderModal: (c, set) => <FadeModal component={c} handleComponentData={set} />
  },
  flyto: {
    type: 'flyto',
    nameKey: 'fly-to',
    group: 'preset',
    renderIcon: (s = 20) => <PlaneIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <FlyToWidget component={c} />,
    renderModal: (c, set) => <FlyToModal component={c} handleComponentData={set} />
  },
  settime: {
    type: 'settime',
    nameKey: 'set-time',
    group: 'preset',
    renderIcon: (s = 20) => <HistoryIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <SetTimeWidget component={c} />,
    renderModal: (c, set) => <SetTimeModal component={c} handleComponentData={set} />
  },
  setnavstate: {
    type: 'setnavstate',
    nameKey: 'set-nav',
    group: 'preset',
    renderIcon: (s = 20) => <CompassIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <SetNavigationWidget component={c} />,
    renderModal: (c, set) => <SetNavModal component={c} handleComponentData={set} />
  },
  sessionplayback: {
    type: 'sessionplayback',
    nameKey: 'playback',
    group: 'preset',
    renderIcon: (s = 20) => <VideoIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <SessionPlaybackWidget component={c} />,
    renderModal: (c, set) => (
      <SessionPlaybackModal component={c} handleComponentData={set} />
    )
  },
  action: {
    type: 'action',
    nameKey: 'action',
    group: 'preset',
    renderIcon: (s = 20) => <CirclePlayIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <ActionTriggerWidget component={c} />,
    renderModal: (c, set) => (
      <ActionTriggerModal component={c} handleComponentData={set} />
    )
  },
  page: {
    type: 'page',
    nameKey: 'page',
    group: 'preset',
    renderIcon: (s = 20) => <BookOpenCheckIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <PageWidget component={c} />,
    renderModal: (c, set) => <PageModal component={c} handleComponentData={set} />
  },
  script: {
    type: 'script',
    nameKey: 'script',
    group: 'preset',
    renderIcon: (s = 20) => <CodeIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <ScriptWidget component={c} />,
    renderModal: (c, set) => <ScriptModal component={c} handleComponentData={set} />
  },
  number: {
    type: 'number',
    nameKey: 'number',
    group: 'property',
    renderIcon: (s = 20) => <HashIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <NumberWidget component={c} />,
    renderModal: (c, set) => <NumberModal component={c} handleComponentData={set} />
  },
  boolean: {
    type: 'boolean',
    nameKey: 'boolean',
    group: 'property',
    renderIcon: (s = 20) => <ToggleRightIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <BooleanWidget component={c} />,
    renderModal: (c, set) => <BoolModal component={c} handleComponentData={set} />
  },
  trigger: {
    type: 'trigger',
    nameKey: 'trigger',
    group: 'property',
    renderIcon: (s = 20) => <CirclePlayIcon size={s} />,
    isMultiOption: true,
    renderWidget: (c) => <TriggerWidget component={c} />,
    renderModal: (c, set) => <TriggerModal component={c} handleComponentData={set} />
  },
  richtext: {
    type: 'richtext',
    nameKey: 'rich-text',
    group: 'static',
    renderIcon: (s = 20) => <AlignJustifyIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <RichTextWidget component={c} />,
    renderModal: (c, set) => <RichTextModal component={c} handleComponentData={set} />
  },
  title: {
    type: 'title',
    nameKey: 'title',
    group: 'static',
    renderIcon: (s = 20) => <LetterTextIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <TitleWidget component={c} />,
    renderModal: (c, set) => <TitleModal component={c} handleComponentData={set} />
  },
  video: {
    type: 'video',
    nameKey: 'video',
    group: 'static',
    renderIcon: (s = 20) => <VideoIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <VideoWidget component={c} />,
    renderModal: (c, set) => <VideoModal component={c} handleComponentData={set} />
  },
  image: {
    type: 'image',
    nameKey: 'image',
    group: 'static',
    renderIcon: (s = 20) => <ImageIcon size={s} />,
    isMultiOption: false,
    renderWidget: (c) => <ImageWidget component={c} />,
    renderModal: (c, set) => <ImageModal component={c} handleComponentData={set} />
  }
};

// A flat list of the table's entries for the sidebar palette + multi-option picker. Order follows
// the table's insertion order (preset, then property, then static).
// TODO: once the ComponentTypes are only the components and not the panels, this should be simplified
export const componentPalette = Object.values(componentsData).filter(
  (d) => d !== undefined
);

// Helper function to render a widget. It is necessary as we need to cast the component prop to the
// correct type for the widget.
export function renderComponentWidget(component: Component): JSX.Element | null {
  const render = componentsData[component.type]?.renderWidget as
    | ((c: Component) => JSX.Element)
    | undefined;
  return render ? render(component) : null;
}

// Helper function to render a modal. It is necessary as we need to cast the component prop to the
// correct type for the modal, and the modal is typed to accept a null component (for "create" mode as opposed to "edit" mode).
export function renderComponentModal(
  type: ComponentType | '',
  component: Component | null,
  set: SetComponentData
): JSX.Element | null {
  if (!type) {
    return null;
  }
  const render = componentsData[type]?.renderModal as
    | ((c: Component | null, set: SetComponentData) => JSX.Element)
    | undefined;
  return render ? render(component, set) : null;
}
