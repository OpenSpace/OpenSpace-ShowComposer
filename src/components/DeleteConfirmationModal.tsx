// DeleteConfirmationModal.tsx
import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-1/3 min-w-[300px] rounded bg-white p-4 shadow-lg">
        <h2 className="mb-4 text-xl">Confirm Deletion</h2>
        <p>{message}</p>
        <div className="mt-4 flex justify-end">
          <button
            className="mr-2 rounded bg-gray-500 p-2 text-white"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-red-500 p-2 text-white"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
