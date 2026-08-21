import { useEffect } from 'react';
import Loader from './Loader';

const DocViewerModal = ({ open, title, docUrl, loading, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) onClose();
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
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 truncate mr-4">
            <span className="text-base font-semibold text-gray-900 truncate">
              {title || 'Document Viewer'}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {docUrl && (
              <a
                href={docUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-md transition flex items-center gap-1 shadow-sm"
              >
                <span>Open in New Tab</span>
                <span>↗</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none p-1 transition rounded hover:bg-gray-200"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 w-full bg-slate-900/5 relative overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="text-center">
              <Loader />
              <p className="text-xs text-gray-500 mt-2 font-medium">Preparing document viewer...</p>
            </div>
          ) : docUrl ? (
            <object
              data={`${docUrl}#toolbar=1&navpanes=0`}
              type="application/pdf"
              className="w-full h-full border-0"
            >
              <iframe
                src={`${docUrl}#toolbar=1&navpanes=0`}
                title={title || 'Document Preview'}
                className="w-full h-full border-0"
              />
            </object>
          ) : (
            <div className="text-center text-sm text-gray-500">
              Unable to load document preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocViewerModal;