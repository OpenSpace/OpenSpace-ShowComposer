import React, { useEffect } from 'react';
import IconButton from '@/components/inputs/IconButton'; // Adjust the import path according to your project structure
// import { ReactComponent as LeftArrowIcon } from './icons/left-arrow.svg'; // Adjust the import path
// import { ReactComponent as RightArrowIcon } from './icons/right-arrow.svg'; // Adjust the import path
import { MdOutlineArrowForwardIos as LeftArrowIcon } from 'react-icons/md';
import { MdOutlineArrowBackIos as RightArrowIcon } from 'react-icons/md';

interface PaginationProps {
  currentIndex: number;
  length: number;
  setIndex: (index: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentIndex,
  length,
  setIndex,
}) => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      setIndex(currentIndex - 1);
    } else if (event.key === 'ArrowRight' && currentIndex < length - 1) {
      setIndex(currentIndex + 1);
    }
  };

  // Add event listener when component mounts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex, length]); // Dependencies array ensures effect runs when currentIndex or length changes
  return (
    <div className="absolute bottom-0 left-0 flex w-full items-center justify-center space-x-4 bg-black bg-opacity-85 text-lg text-white">
      <IconButton
        className={`${
          currentIndex > 0
            ? 'pointer-events-all'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIndex(currentIndex - 1)}
        icon={RightArrowIcon}
        aria-label="Previous page"
      />
      <span>
        {currentIndex + 1} / {length}
      </span>
      <IconButton
        className={`${
          currentIndex < length - 1
            ? 'pointer-events-all'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIndex(currentIndex + 1)}
        icon={LeftArrowIcon}
        aria-label="Next page"
      />
    </div>
  );
};

export default Pagination;
