import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

const LibraryFolder = ({ folder, renameFolder, deleteFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative bg-gray-200 p-4 rounded-lg flex flex-col items-center border">
      <div className="text-4xl mb-2">📁</div>
      <span>{folder.folder_name}</span>
      
      {/* Three-dot menu button */}
      <button className="absolute top-2 right-2" onClick={() => setMenuOpen(!menuOpen)}>
        <FiMoreVertical />
      </button>
      
      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute top-8 right-2 bg-white border rounded shadow-md p-2 w-24">
          <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => { setMenuOpen(false); renameFolder(folder.folder_id); }}>
            Rename
          </button>
          <button className="block w-full text-left p-2 hover:bg-gray-100 text-red-500" onClick={() => { setMenuOpen(false); deleteFolder(folder.folder_id); }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryFolder;
