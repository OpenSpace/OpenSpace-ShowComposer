import React, { useState, useCallback, useEffect } from 'react';
import { useComponentStore } from '@/store';
import ImageGallery from './ImageGallery';
import Image from './Image';
interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const setAsyncPreSubmitOperation = useComponentStore(
    (state) => state.setAsyncPreSubmitOperation,
  );
  const [image, setImage] = useState<string | null>(value);
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

  const toggleGallery = () => setGalleryVisible(!galleryVisible);
  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setImage(e.target.value); // Directly set the image to the entered URL
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile: File | null = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setImage(imageUrl);
      setFile(selectedFile);
    }
  };

  useEffect(() => {
    if (file) {
      console.log('SETTING ASYNC OPERATION');
      setAsyncPreSubmitOperation(async () => await saveImageToServer());
    }
  }, [file]);

  const saveImageToServer = useCallback(async () => {
    if (file === null) {
      console.log('IS FILE NULL?');
      return;
    }
    const formData = new FormData();
    formData.append('image', file); // Append the file

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData, // Send formData
      // Don't set Content-Type header, let the browser set it
    });

    if (response.ok) {
      let data = await response.json();
      console.log('SAVING FILEAPTH');
      onChange(data.filePath);
      console.log(data);
      console.log('Image saved successfully');
    } else {
      console.error('Failed to save image');
    }
  }, [file]);

  return (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-medium text-black">Background Image</div>

        <div className="flex flex-row items-center justify-center gap-2">
          <input
            type="text"
            placeholder="Or enter image URL"
            className="relative w-full rounded border p-2"
            value={value}
            onChange={handleURLChange}
          />
          {/* {image && ( */}
          <Image
            //   width="10"
            className="h-24 w-24 cursor-pointer object-cover" // Tailwind classes for width, height, object-fit, and cursor
            src={image ? image : 'https://via.placeholder.com/150'}
            fallbackSrc="https://via.placeholder.com/150"
            alt="Loaded"
          />
          {/* )} */}
        </div>
      </div>
      <div className="flex flex-row items-center justify-end gap-2">
        <ImageGallery
          images={galleryImages}
          onSelectImage={handleSelectImage}
        />
        or
        <div className={`flex items-center `}>
          <label className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-slate-900 px-3 px-4 py-2 text-sm font-medium text-slate-50 ring-offset-white transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:ring-offset-slate-950 dark:hover:bg-slate-50/90 dark:focus-visible:ring-slate-300">
            Upload New Image
            <input
              type="file"
              className="hidden"
              onChange={handleImageChange}
              // {...props}
            />
          </label>
        </div>
        {/* <input type="file" onChange={handleImageChange} /> */}
        {/* {file && <button onClick={saveImageToServer}>Save Image</button>} */}
      </div>
      {/* {image && <img width="100" src={image} alt="Loaded" />} */}
      {/* </div> */}
    </>
  );
};

export default ImageUpload;
