import React, { useState, useCallback, useEffect } from 'react';
import { getCopy } from '@/utils/copyHelpers';
import ImageGallery from './ImageGallery';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useBoundStore } from '@/store/boundStore';
import { fetchGalleryImages, uploadImage } from '@/utils/saveProject';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  componentId?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const setAsyncPreSubmitOperation = useBoundStore(
    (state) => state.setAsyncPreSubmitOperation,
  );
  const [image, setImage] = useState<string>(value || '');
  const [file, setFile] = useState<File | null>(null); // State to hold the file object
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        const images = await fetchGalleryImages();
        setGalleryImages(images);
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }
    };
    loadGalleryImages();
  }, []);
  const handleSelectImage = (imagePath: string) => {
    onChange(imagePath);
    setImage(imagePath);
    setGalleryVisible(false); // Optionally close the gallery
  };
  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setImage(e.target.value); // Directly set the image to the entered URL
  };
  const onCloseGallery = () => {
    setGalleryVisible(false);
  };
  useEffect(() => {
    if (file) {
      console.log('SETTING ASYNC OPERATION');
      setAsyncPreSubmitOperation(async () => await saveImageToServer());
    }
  }, [file]);
  const saveImageToServer = useCallback(async () => {
    console.log('SAVEING IMAGE TO SEVER');
    if (file === null) {
      return;
    }
    try {
      const filePath = await uploadImage(file);
      onChange(filePath);
      console.log('Image saved successfully');
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  }, [file]);
  return (
    <>
      <div className="grid gap-4">
        <Label>{getCopy('ImageUpload', 'set_image_url')}</Label>
        <div className="grid grid-cols-7 gap-2">
          <div className="col-span-4">
            <Input
              type="text"
              placeholder="Set Image URL"
              className="relative w-full rounded border p-2"
              value={value}
              onChange={handleURLChange}
            />
          </div>
          <div className="col-span-1 flex-1 flex-row items-center justify-center text-center text-2xl text-slate-900 dark:text-slate-200">
            {getCopy('ImageUpload', 'or')}
          </div>
          <Button
            className="col-span-2"
            onClick={() => setGalleryVisible(true)}
          >
            {getCopy('ImageUpload', 'select_image')}
          </Button>
          {galleryVisible && (
            <ImageGallery
              images={galleryImages}
              selectedImage={image || ''}
              handleClose={onCloseGallery}
              onSelectImage={handleSelectImage}
              setUploadFile={setFile}
            />
          )}
        </div>
      </div>
    </>
  );
};
export default ImageUpload;
