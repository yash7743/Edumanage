const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
