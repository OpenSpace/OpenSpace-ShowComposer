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
import { ComponentType } from '@/store';
import { getCopy } from '@/utils/copyHelpers';

export type ComponentTypeData = {
  type: ComponentType;
  name: string;
  icon: JSX.Element;
};

// The palette of component types the user can add, grouped as they appear in the
// sidebar. Shared with the component modal, which resolves a type's icon from here.
export function getComponentTypes() {
  const presetComponentTypes: Array<ComponentTypeData> = [
    { type: 'multi', name: getCopy('Main', 'multi'), icon: <GroupIcon size={20} /> },
    {
      type: 'setfocus',
      name: getCopy('Main', 'setfocus'),
      icon: <TelescopeIcon size={20} />
    },
    { type: 'fade', name: getCopy('Main', 'fade'), icon: <SunMoonIcon size={20} /> },
    { type: 'flyto', name: getCopy('Main', 'flyto'), icon: <PlaneIcon size={20} /> },
    {
      type: 'settime',
      name: getCopy('Main', 'settime'),
      icon: <HistoryIcon size={20} />
    },
    {
      type: 'setnavstate',
      name: getCopy('Main', 'setnav'),
      icon: <CompassIcon size={20} />
    },
    {
      type: 'sessionplayback',
      name: getCopy('Main', 'playback'),
      icon: <VideoIcon size={20} />
    },
    {
      type: 'action',
      name: getCopy('Main', 'action'),
      icon: <CirclePlayIcon size={20} />
    },
    {
      type: 'page',
      name: getCopy('Main', 'page'),
      icon: <BookOpenCheckIcon size={20} />
    },
    { type: 'script', name: getCopy('Main', 'script'), icon: <CodeIcon size={20} /> }
  ];

  const propertyComponentTypes: Array<ComponentTypeData> = [
    { type: 'number', name: getCopy('Main', 'number'), icon: <HashIcon size={20} /> },
    {
      type: 'boolean',
      name: getCopy('Main', 'boolean'),
      icon: <ToggleRightIcon size={20} />
    },
    {
      type: 'trigger',
      name: getCopy('Main', 'trigger'),
      icon: <CirclePlayIcon size={20} />
    }
  ];

  const staticComponentTypes: Array<ComponentTypeData> = [
    {
      type: 'richtext',
      name: getCopy('Main', 'richtext'),
      icon: <AlignJustifyIcon size={20} />
    },
    { type: 'title', name: getCopy('Main', 'title'), icon: <LetterTextIcon size={20} /> },
    { type: 'video', name: getCopy('Main', 'video'), icon: <VideoIcon size={20} /> },
    { type: 'image', name: getCopy('Main', 'image'), icon: <ImageIcon size={20} /> }
  ];

  const allComponentTypes = [
    ...presetComponentTypes,
    ...propertyComponentTypes,
    ...staticComponentTypes
  ];

  return {
    presetComponentTypes,
    propertyComponentTypes,
    staticComponentTypes,
    allComponentTypes
  };
}
