import React, { useState, useCallback, useEffect } from 'react';
import { useComponentStore } from '@/store';
import ImageGallery from './ImageGallery';
import Image from './Image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { set } from 'lodash';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const setAsyncPreSubmitOperation = useComponentStore(
    (state) => state.setAsyncPreSubmitOperation,
  );
  const [image, setImage] = useState<string>(value || '');
  const [file, setFile] = useState<File | null>(null); // State to hold the file object
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    fetch('/uploads')
      .then((response) => response.json())
      .then((data) => setGalleryImages(data.images))
      .catch((error) => console.error('Error fetching gallery images:', error));
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
    setAsyncPreSubmitOperation(() => {});
    setGalleryVisible(false);
  };
  useEffect(() => {
    if (file) {
      console.log('SETTING ASYNC OPERATION');
      setAsyncPreSubmitOperation(async () => await saveImageToServer());
    }
  }, [file]);

  const saveImageToServer = useCallback(async () => {
    if (file === null) {
      return;
    }
    const formData = new FormData();
    formData.append('image', file); // Append the file

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData, // Send formData
    });

    if (response.ok) {
      let data = await response.json();
      onChange(data.filePath);
      console.log(data);
      console.log('Image saved successfully');
    } else {
      console.error('Failed to save image');
    }
  }, [file]);

  return (
    <>
      <div className="grid gap-2">
        <div className="flex items-center justify-center p-4">
          <Image
            className={
              image.length > 0
                ? 'h-32 w-32 object-cover'
                : 'h-12 w-12  object-cover'
            }
            src={image || ''}
            alt="Loaded"
          />
        </div>
        <Label>Set Image Url </Label>

        <div className="flex flex-row ">
          <div className="w-[33%] ">
            <Input
              type="text"
              placeholder="Set Image URL"
              className="relative w-full rounded border p-2"
              value={value}
              onChange={handleURLChange}
            />
          </div>
          <div className="flex-1 flex-row items-center justify-center text-center text-2xl text-slate-900">
            or
          </div>
          <Button className="flex-1" onClick={() => setGalleryVisible(true)}>
            Select Image
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
