import { cn } from '@/lib/utils';
import { getCopy } from '@/utils/copyHelpers';

import { Label } from '../ui/label';

import ColorPickerComponent from './ColorPickerComponent';
import Image from './Image';
import ImageUpload from './ImageUpload';

interface BackgroundHolderProps {
  color: string;
  setColor: (color: string) => void;
  backgroundImage: string;
  setBackgroundImage: (image: string) => void;
  componentId?: string;
}

const BackgroundHolder: React.FC<BackgroundHolderProps> = ({
  color,
  setColor,
  backgroundImage,
  setBackgroundImage
}) => {
  return (
    <div className={'grid grid-cols-1 gap-4'}>
      <div className={'grid grid-cols-2 gap-4'}>
        <div className={'flex flex-col gap-4'}>
          <Label htmlFor={'background_color'}>Background Color</Label>
          <div className={'flex flex-row  items-center gap-2'}>
            <ColorPickerComponent color={color} setColor={setColor} />
          </div>
        </div>
        <div className={'grid grid-cols-1 gap-4'}>
          <Label htmlFor={'background_image'}>
            {getCopy('Focus', 'background_image')}
          </Label>
          <Image
            className={cn(
              backgroundImage.length > 0
                ? 'h-32 w-32 object-cover'
                : 'h-16 w-16  object-cover'
            )}
            src={backgroundImage || ''}
            alt={'Loaded'}
          />
        </div>
        <div className={'col-span-2 grid gap-2'}>
          <ImageUpload value={backgroundImage} onChange={(v) => setBackgroundImage(v)} />
        </div>
      </div>
    </div>
  );
};

export default BackgroundHolder;
