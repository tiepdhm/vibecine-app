const LoadingSpinner = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
        <p className="text-gray-600 text-lg">Loading, please wait...</p>
      </div>
    );
  }

export default LoadingSpinner;
  