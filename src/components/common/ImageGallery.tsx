import React, { useState } from 'react';
import { Button } from '../ui/button';
interface GalleryProps {
  images: Array<string>;
  onSelectImage: (imageUrl: string) => void;
}

const ImageGallery: React.FC<GalleryProps> = ({ images, onSelectImage }) => {
  // State for modal visibility, pagination, and selected image
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust based on your preference
  const totalPages = Math.ceil(images.length / itemsPerPage);

  // Function to toggle modal visibility
  function toggleModal() {
    setModalVisible(!modalVisible);
  }

  // Function to change page
  function goToPage(pageNumber: number) {
    setCurrentPage(pageNumber);
  }

  // Function to select an image (similar to handleSelectImage)
  function selectImage(imageUrl: string) {
    onSelectImage(imageUrl);
    // Implement selection logic here
  }

  // Calculate the images to display on the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const imagesToDisplay = images.slice(startIndex, endIndex);

  // Modal component with pagination and image selection
  return (
    <>
      <Button
        onClick={toggleModal}
        // className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Open Gallery
      </Button>
      {modalVisible && (
        <div
          className="fixed inset-0 flex h-full w-full  items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50"
          id="modal"
        >
          {' '}
          {/* Modal overlay */}
          <div className="relative mx-auto flex w-[500px] w-auto flex-col items-center justify-center rounded-md border bg-white p-5 shadow-lg">
            {' '}
            {/* Modal content */}
            <div className="flex w-auto flex-wrap gap-2  ">
              {imagesToDisplay.map((image, index) => (
                <img
                  key={index}
                  className="h-24 w-24 cursor-pointer object-cover" // Tailwind classes for width, height, object-fit, and cursor
                  src={`/uploads/${image}`}
                  alt="Gallery Image"
                  onClick={() => selectImage(`/uploads/${image}`)}
                />
              ))}
            </div>
            <div className="pagination mt-4 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className="rounded bg-blue-500 px-3 py-1 font-bold text-white hover:bg-blue-700"
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={toggleModal}
              className="mt-4 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
