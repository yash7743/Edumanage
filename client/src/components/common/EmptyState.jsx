const EmptyState = ({ title = 'Nothing here yet', message = '', action = null }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-2xl">📭</div>
    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    {message && <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
