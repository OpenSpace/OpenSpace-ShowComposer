export {
  LuAlignJustify as AlignJustifyIcon,
  LuAnchor as AnchorIcon,
  LuArrowUpFromDot as ArrowUpFromDotIcon,
  LuBookOpenCheck as BookOpenCheckIcon,
  LuCheck as CheckIcon,
  LuChevronDown as ChevronDownIcon,
  LuChevronLeft as ChevronLeftIcon,
  LuChevronRight as ChevronRightIcon,
  LuChevronsUpDown as ChevronsUpDownIcon,
  LuChevronUp as ChevronUpIcon,
  LuCircleCheck as CircleCheckIcon,
  LuCircleHelp as CircleHelpIcon,
  LuCircle as CircleIcon,
  LuCirclePlay as CirclePlayIcon,
  LuCircleX as CircleXIcon,
  LuClock as ClockIcon,
  LuCode as CodeIcon,
  LuCompass as CompassIcon,
  LuCopy as CopyIcon,
  LuPencil as EditIcon,
  LuEllipsisVertical as EllipsisVerticalIcon,
  LuFastForward as FastForwardIcon,
  LuGlobe as GlobeIcon,
  LuGripHorizontal as GripHorizontalIcon,
  LuGripVertical as GripVerticalIcon,
  LuGroup as GroupIcon,
  LuHash as HashIcon,
  LuHistory as HistoryIcon,
  LuImage as ImageIcon,
  LuInfo as InfoIcon,
  LuLayoutGrid as LayoutGridIcon,
  LuLetterText as LetterTextIcon,
  LuLink as LinkIcon,
  LuLock as LockIcon,
  LuLockOpen as LockOpenIcon,
  LuMessageSquareWarning as MessageSquareWarningIcon,
  LuMinus as MinusIcon,
  LuMoon as MoonIcon,
  LuPause as PauseIcon,
  LuPin as PinIcon,
  LuPinOff as PinOffIcon,
  LuPlane as PlaneIcon,
  LuPlay as PlayIcon,
  LuPlus as PlusIcon,
  LuTvMinimalPlay as PresentIcon,
  LuRadio as RadioIcon,
  LuRedo as RedoIcon,
  LuRefreshCcwDot as RefreshCcwDotIcon,
  LuRewind as RewindIcon,
  LuRotate3D as Rotate3dIcon,
  LuSearch as SearchIcon,
  LuSettings as SettingsIcon,
  LuSquare as SquareIcon,
  LuSun as SunIcon,
  LuSunMoon as SunMoonIcon,
  LuTelescope as TelescopeIcon,
  LuToggleRight as ToggleRightIcon,
  LuTrash2 as TrashIcon,
  LuUndo as UndoIcon,
  LuUnlink as UnlinkIcon,
  LuUpload as UploadIcon,
  LuVideo as VideoIcon,
  LuView as ViewIcon,
  LuX as XIcon,
  LuZoomIn as ZoomInIcon,
  LuZoomOut as ZoomOutIcon
} from 'react-icons/lu';

// Custom icons - nothing in react-icons library matched them
export function RowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    >
      <rect x={'2'} y={'8'} width={'8'} height={'8'} />
      <rect x={'14'} y={'8'} width={'8'} height={'8'} />
    </svg>
  );
}

export function ColumnIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={'2'}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
    >
      <rect x={'8'} y={'2'} width={'8'} height={'8'} />
      <rect x={'8'} y={'14'} width={'8'} height={'8'} />
    </svg>
  );
}
