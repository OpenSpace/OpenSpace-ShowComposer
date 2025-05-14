import React from 'react';

import {
  Pagination as PaginationContainer,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

interface PaginationProps {
  currentIndex: number;
  length: number;
  setIndex: (index: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentIndex, length, setIndex }) => {
  // const handleKeyPress = (event: KeyboardEvent) => {
  //   if (event.key === 'ArrowLeft' && currentIndex > 0) {
  //     setIndex(currentIndex - 1);
  //   } else if (event.key === 'ArrowRight' && currentIndex < length - 1) {
  //     setIndex(currentIndex + 1);
  //   }
  // };

  const visiblePages = () => {
    const pages = [];
    if (length <= 4) {
      // If 4 or fewer pages, show all
      for (let i = 0; i < length; i++) {
        pages.push(i);
      }
    } else {
      // If more than 4 pages
      if (currentIndex <= 2) {
        // Current index is among the first 3 pages
        for (let i = 0; i < 3; i++) {
          pages.push(i);
        }
        // pages.push('ellipsis');
      } else if (currentIndex > 2 && currentIndex < length - 2) {
        // Current index is in the middle, show previous ellipsis, current, next, and end ellipsis
        // pages.push('prevEllipsis');
        pages.push(currentIndex - 1);
        pages.push(currentIndex);
        pages.push(currentIndex + 1);
        // pages.push('ellipsis');
      } else {
        // Current index is among the last 3 pages
        // pages.push('prevEllipsis');
        for (let i = length - 3; i < length; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  return (
    <div
      className={'absolute bottom-0 left-0  mb-6 flex w-full items-center justify-center'}
    >
      <PaginationContainer>
        <PaginationContent className={'z-[49]'}>
          <PaginationItem>
            <PaginationPrevious
              className={`${
                currentIndex > 0 ? 'pointer-events-all' : 'pointer-events-none opacity-0'
              } cursor-pointer`}
              onClick={() => setIndex(currentIndex - 1)}
            />
          </PaginationItem>
          {length > 4 && currentIndex > 2 && <PaginationEllipsis />}
          {
            //array of length length
            visiblePages().map((index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  className={'cursor-pointer'}
                  isActive={currentIndex === index}
                  onClick={() => setIndex(index)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))
          }
          {length > 4 && currentIndex < length - 2 && <PaginationEllipsis />}
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
