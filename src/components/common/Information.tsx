import { ReactNode } from 'react';
import { FiInfo } from 'react-icons/fi'; // Using FiInfo as the info icon

const Information = ({ content }: { content: ReactNode | string }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div className="group">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
          <FiInfo className="text-lg" />
        </div>
        <div className="absolute left-full top-full mb-3 hidden min-w-[160px] rounded-md bg-gray-800 p-2 text-white opacity-0 group-hover:block group-hover:opacity-100">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Information;
