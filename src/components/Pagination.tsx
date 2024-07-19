import React, { useEffect } from 'react';

import {
  Pagination as PaginationContainer,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
    <div className="absolute bottom-0 left-0 z-[99] mb-6 flex w-full items-center justify-center">
      <PaginationContainer>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={`${
                currentIndex > 0
                  ? 'pointer-events-all'
                  : 'pointer-events-none opacity-0'
              } cursor-pointer`}
              onClick={() => setIndex(currentIndex - 1)}
            />
          </PaginationItem>
          {
            //array of length length
            Array.from({ length }, (_, i) => i).map((index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  className="cursor-pointer"
                  isActive={currentIndex === index}
                  onClick={() => setIndex(index)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          }
          <PaginationItem>
            <PaginationNext
              className={`${
                currentIndex < length - 1
                  ? 'pointer-events-all'
                  : 'pointer-events-none opacity-0'
              } cursor-pointer`}
              onClick={() => setIndex(currentIndex + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationContainer>
    </div>
  );
};

export default Pagination;
