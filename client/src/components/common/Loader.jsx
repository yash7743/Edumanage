const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default Loader;
