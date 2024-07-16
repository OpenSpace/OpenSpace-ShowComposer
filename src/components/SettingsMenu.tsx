import { useComponentStore } from '@/store';
import { useState } from 'react';

const SettingsMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const addPage = useComponentStore((state) => state.addPage);
  const currentPage = useComponentStore((state) => state.currentPage);
  const deletePage = useComponentStore((state) => state.deletePage);
  return (
    <div className="relative">
      <button
        className="fixed right-8 top-8 z-40 origin-center transform rounded-full bg-black bg-opacity-30  p-4 text-white shadow-md transition-transform duration-300"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          // "X" icon for when the menu is open
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // 3 dots icon for when the menu is closed
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d="M12 4h.01M12 12h.01M12 20h.01"
            />
          </svg>
        )}
      </button>

      {/* Menu Tray */}
      <div
        className={`fixed right-20 top-20 z-40 w-48 origin-top-right transform rounded-lg bg-white shadow-lg transition-all ${
          isMenuOpen
            ? 'pointer-events-all opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Menu content */}
        <ul className="py-1">
          <li onClick={addPage} className="px-4 py-2 hover:bg-gray-100">
            Create New Page
          </li>
          <li
            onClick={() => deletePage(currentPage)}
            className="px-4 py-2 hover:bg-gray-100"
          >
            Delete Page
          </li>
          {/* <li className="px-4 py-2 hover:bg-gray-100">Menu Item 2</li>
          <li className="px-4 py-2 hover:bg-gray-100">Menu Item 3</li> */}
        </ul>
      </div>
    </div>
  );
};

export default SettingsMenu;
