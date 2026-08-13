const Modal = ({ open, title, onClose, children, widthClass = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-xl shadow-lg w-full ${widthClass} p-6 my-8`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
