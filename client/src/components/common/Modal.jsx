import { useEffect } from 'react';

const Modal = ({
  open,
  title,
  onClose,
  children,
  widthClass = 'max-w-4xl',
  noPadding = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${widthClass} my-auto flex flex-col max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate mr-3">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none p-1 transition rounded hover:bg-gray-100"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto ${noPadding ? 'p-0' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;