import { useState, useRef } from "react";
import { FiMoreVertical, FiFolder } from "react-icons/fi";
import api from "../utils/api";

const LibraryFolder = ({ folder, renameFolder, deleteFolder, refreshLibrary, openFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", folder.user_id);
    formData.append("folder_id", folder.folder_id);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      refreshLibrary();
    } catch (error) {
      console.error("Upload Error:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-4 relative">
      <button
        onClick={() => openFolder(folder.folder_id)}
        className="w-full flex flex-col items-center"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
          <FiFolder className="text-blue-500 w-8 h-8" />
        </div>
        <h3 className="font-medium text-gray-800 text-center truncate w-full">{folder.folder_name}</h3>
      </button>

      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiMoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
            <button
              onClick={() => {
                renameFolder();
                setMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              Rename
            </button>
            <button
              onClick={() => {
                fileInputRef.current.click();
                setMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              Add File
            </button>
            <button
              onClick={() => {
                deleteFolder();
                setMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
    </div>
  );
};

export default LibraryFolder;