export {
  LuAnchor as AnchorIcon,
  LuArrowUpFromDot as ArrowUpFromDotIcon,
  LuCheck as CheckIcon,
  LuChevronDown as ChevronDownIcon,
  LuChevronsUpDown as ChevronsUpDownIcon,
  LuChevronUp as ChevronUpIcon,
  LuCircle as CircleIcon,
  LuClock as ClockIcon,
  LuCopy as CopyIcon,
  LuPencil as EditIcon,
  LuEllipsisVertical as EllipsisVerticalIcon,
  LuFastForward as FastForwardIcon,
  LuGlobe as GlobeIcon,
  LuGripHorizontal as GripHorizontalIcon,
  LuImage as ImageIcon,
  LuLayoutGrid as LayoutGridIcon,
  LuLink as LinkIcon,
  LuLock as LockIcon,
  LuLockOpen as LockOpenIcon,
  LuMinus as MinusIcon,
  LuPause as PauseIcon,
  LuPin as PinIcon,
  LuPinOff as PinOffIcon,
  LuPlay as PlayIcon,
  LuPlus as PlusIcon,
  LuTvMinimalPlay as PresentIcon,
  LuRedo as RedoIcon,
  LuRefreshCcwDot as RefreshCcwDotIcon,
  LuRewind as RewindIcon,
  LuRotate3D as Rotate3dIcon,
  LuSearch as SearchIcon,
  LuSettings as SettingsIcon,
  LuSquare as SquareIcon,
  LuTelescope as TelescopeIcon,
  LuTrash2 as TrashIcon,
  LuUndo as UndoIcon,
  LuUnlink as UnlinkIcon,
  LuUpload as UploadIcon,
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
