import { Center, Pagination as MantinePagination } from '@mantine/core';

interface PaginationProps {
  currentIndex: number;
  length: number;
  setIndex: (index: number) => void;
}

// The rest of the app is 0-indexed (currentIndex / setIndex), while Mantine's
// Pagination is 1-based so we need to add/subtract 1 when passing values to it
function Pagination({ currentIndex, length, setIndex }: PaginationProps) {
  return (
    <Center
      pos={'absolute'}
      bottom={0}
      left={0}
      w={'100%'}
      mb={24}
      style={{ zIndex: 49, pointerEvents: 'none' }}
    >
      <MantinePagination
        total={length}
        value={currentIndex + 1}
        onChange={(page) => setIndex(page - 1)}
        style={{ pointerEvents: 'auto' }}
      />
    </Center>
  );
}

export default Pagination;
