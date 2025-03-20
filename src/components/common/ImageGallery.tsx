import React, { useEffect, useState } from 'react';
import { getCopy } from '@/utils/copyHelpers';
import { Upload } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components//ui/card';
import Image from '@/components/common/Image';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import Pagination from '../Pagination';
import { useRef } from 'react';
import { useBoundStore } from '@/store/boundStore';
interface GalleryProps {
  images: Array<string>;
  selectedImage: string;
  onSelectImage: (imageUrl: string) => void;
  handleClose: () => void;
  setUploadFile: (file: File | null) => void;
}
const ImageGallery: React.FC<GalleryProps> = ({
  images,
  selectedImage: initialImage,
  onSelectImage,
  handleClose,
  setUploadFile,
}) => {
  // State for modal visibility, pagination, and selected image
  // const [modalVisible, setModalVisible] = useState(false);
  const resetAsyncPreSubmitOperation = useBoundStore(
    (state) => state.resetAsyncPreSubmitOperation,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6; // Adjust based on your preference
  const totalPages = Math.ceil(images.length / itemsPerPage);
  const [selectedImage, setSelectedImage] = useState(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setSelectedImage(initialImage);
  }, [initialImage]);
  const handleButtonClick = () => {
    if (fileInputRef?.current)
      (fileInputRef.current as HTMLInputElement).click();
  };
  // Function to toggle modal visibility
  // function toggleModal() {
  //   setModalVisible(!modalVisible);
  // }

  // Function to change page
  function goToPage(pageNumber: number) {
    setCurrentPage(pageNumber);
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile: File | null = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setSelectedImage(imageUrl);
      setUploadFile(selectedFile);
    }
  };

  // Calculate the images to display on the current page
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const imagesToDisplay = images.slice(startIndex, endIndex);
  console.log('imagesToDisplay', imagesToDisplay);
  // Modal component with pagination and image selection
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Card className="w-[510px] bg-white">
          <CardHeader>
            <CardTitle>{getCopy('ImageGallery', 'image_gallery')}</CardTitle>
            <CardDescription>
              {getCopy('ImageGallery', 'choose_an_image')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="grid grid-rows-1 gap-2">
                  <Label>{getCopy('ImageGallery', 'seleted_image:')}</Label>
                  <Image
                    alt="Selected image"
                    className="aspect-square w-full rounded-md border border-dashed  border-black object-cover"
                    height="150"
                    src={selectedImage || initialImage}
                    width="150"
                  />
                </div>
                <div />
                <div className="grid grid-rows-1 gap-2">
                  <Label>{getCopy('ImageGallery', 'upload_new_image:')}</Label>
                  <button
                    onClick={handleButtonClick}
                    className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed hover:border-black"
                  >
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      // {...props}
                    />
                    <Upload className="text-muted-foreground h-8 w-8" />
                    <span className="sr-only">
                      {getCopy('ImageGallery', 'upload')}
                    </span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {imagesToDisplay.map((image, _index) => (
                  <button key={image} onClick={() => setSelectedImage(image)}>
                    <Image
                      alt="Uploaded image"
                      className="aspect-square w-full rounded-md object-cover"
                      height="60"
                      src={image}
                      width="60"
                    />
                  </button>
                ))}
                {Array.from(
                  {
                    length: itemsPerPage - imagesToDisplay.length,
                  },
                  (_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="aspect-square w-full rounded-md border-[1.5px] border-dashed border-black/40 bg-white object-cover"
                    ></div>
                  ),
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetAsyncPreSubmitOperation();
                handleClose();
              }}
            >
              {getCopy('ImageGallery', 'cancel')}
            </Button>

            <Button
              disabled={!(selectedImage.length > 0)}
              onClick={() => {
                onSelectImage(selectedImage);
                handleClose();
              }}
            >
              {getCopy('ImageGallery', 'add_image')}
            </Button>
          </CardFooter>
          <div className="relative flex h-24 w-full items-center justify-center ">
            <Pagination
              currentIndex={currentPage}
              length={totalPages}
              setIndex={goToPage}
            />
          </div>
        </Card>
      </div>
    </>
  );
};
export default ImageGallery;
