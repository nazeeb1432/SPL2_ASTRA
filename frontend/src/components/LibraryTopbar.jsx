// components/LibraryTopbar.jsx
import { FiGrid, FiList } from "react-icons/fi";

const LibraryTopbar = ({ searchQuery, setSearchQuery, viewMode, setViewMode }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search in library..."
        className="w-1/3 p-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-200"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* View Mode Toggle */}
      <button
        onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md"
      >
        {viewMode === "list" ? <FiGrid /> : <FiList />}
        <span>{viewMode === "list" ? "Grid" : "List"} View</span>
      </button>
    </div>
  );
};

export default LibraryTopbar;