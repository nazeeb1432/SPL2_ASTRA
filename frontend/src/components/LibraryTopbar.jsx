import { FiSearch } from "react-icons/fi";

const LibraryTopbar = () => (
  <div className="flex items-center justify-between mb-4 border-b pb-2 flex-wrap">
    <h1 className="text-xl font-semibold">Welcome to the Content Library</h1>
    <div className="relative w-full md:w-auto mt-2 md:mt-0">
      <input
        type="text"
        placeholder="Search in Library"
        className="p-2 pl-8 bg-gray-200 rounded w-full md:w-64 border"
      />
      <FiSearch className="absolute top-3 left-2 text-gray-500" />
    </div>
  </div>
);

export default LibraryTopbar;