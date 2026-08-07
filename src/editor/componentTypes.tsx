import { useTranslation } from 'react-i18next';

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

export type ComponentTypeData = {
  type: ComponentType;
  name: string;
  icon: JSX.Element;
};

// The palette of component types the user can add, grouped as they appear in the
// sidebar. Shared with the component modal, which resolves a type's icon from here.
export function useComponentTypes() {
  const { t } = useTranslation('main');

  const presetComponentTypes: Array<ComponentTypeData> = [
    { type: 'multi', name: t('multi'), icon: <GroupIcon size={20} /> },
    {
      type: 'setfocus',
      name: t('set-focus'),
      icon: <TelescopeIcon size={20} />
    },
    { type: 'fade', name: t('fade'), icon: <SunMoonIcon size={20} /> },
    { type: 'flyto', name: t('fly-to'), icon: <PlaneIcon size={20} /> },
    {
      type: 'settime',
      name: t('set-time'),
      icon: <HistoryIcon size={20} />
    },
    {
      type: 'setnavstate',
      name: t('set-nav'),
      icon: <CompassIcon size={20} />
    },
    {
      type: 'sessionplayback',
      name: t('playback'),
      icon: <VideoIcon size={20} />
    },
    {
      type: 'action',
      name: t('action'),
      icon: <CirclePlayIcon size={20} />
    },
    {
      type: 'page',
      name: t('page'),
      icon: <BookOpenCheckIcon size={20} />
    },
    { type: 'script', name: t('script'), icon: <CodeIcon size={20} /> }
  ];

  const propertyComponentTypes: Array<ComponentTypeData> = [
    { type: 'number', name: t('number'), icon: <HashIcon size={20} /> },
    {
      type: 'boolean',
      name: t('boolean'),
      icon: <ToggleRightIcon size={20} />
    },
    {
      type: 'trigger',
      name: t('trigger'),
      icon: <CirclePlayIcon size={20} />
    }
  ];

  const staticComponentTypes: Array<ComponentTypeData> = [
    {
      type: 'richtext',
      name: t('rich-text'),
      icon: <AlignJustifyIcon size={20} />
    },
    { type: 'title', name: t('title'), icon: <LetterTextIcon size={20} /> },
    { type: 'video', name: t('video'), icon: <VideoIcon size={20} /> },
    { type: 'image', name: t('image'), icon: <ImageIcon size={20} /> }
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
