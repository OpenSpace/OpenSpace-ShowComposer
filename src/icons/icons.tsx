// Central re-export of the icons used across the app, following WebGui's convention
// of semantic aliases sourced from react-icons. We use the Lucide set (`react-icons/lu`)
// so the glyphs match the icons the app used before the migration off `lucide-react`.
// Grows as components are ported; `lucide-react` is removed once no imports remain.
export { LuImage as ImageIcon, LuUpload as UploadIcon } from 'react-icons/lu';
