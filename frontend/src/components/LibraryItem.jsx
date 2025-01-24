// components/LibraryItem.jsx
const LibraryItem = ({ data, viewMode }) => {
    return (
      <div
        className={`p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800
          ${viewMode === "grid" ? "text-center" : "flex items-center space-x-4"}
        `}
      >
        {/* Thumbnail (Could be a folder or file icon) */}
        <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white">
          📂
        </div>
  
        {/* File Details */}
        <div className={viewMode === "grid" ? "mt-2" : "flex-grow"}>
          <h3 className="font-semibold">{data.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{data.size} • {data.uploadedAt}</p>
        </div>
  
        {/* Open Button */}
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md">
          Open
        </button>
      </div>
    );
  };
  
  export default LibraryItem;
  