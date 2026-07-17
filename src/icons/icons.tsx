// Central re-export of the icons used across the app, following WebGui's convention
// of semantic aliases sourced from react-icons. We use the Lucide set (`react-icons/lu`)
// so the glyphs match the icons the app used before the migration off `lucide-react`.
// Grows as components are ported; `lucide-react` is removed once no imports remain.
export {
  LuArrowUpFromDot as ArrowUpFromDotIcon,
  LuCheck as CheckIcon,
  LuChevronDown as ChevronDownIcon,
  LuChevronsUpDown as ChevronsUpDownIcon,
  LuChevronUp as ChevronUpIcon,
  LuCircle as CircleIcon,
  LuClock as ClockIcon,
  LuFastForward as FastForwardIcon,
  LuGlobe as GlobeIcon,
  LuImage as ImageIcon,
  LuPause as PauseIcon,
  LuPlay as PlayIcon,
  LuRefreshCcwDot as RefreshCcwDotIcon,
  LuRewind as RewindIcon,
  LuRotate3D as Rotate3dIcon,
  LuSearch as SearchIcon,
  LuSquare as SquareIcon,
  LuTelescope as TelescopeIcon,
  LuUpload as UploadIcon,
  LuZoomIn as ZoomInIcon
} from 'react-icons/lu';
