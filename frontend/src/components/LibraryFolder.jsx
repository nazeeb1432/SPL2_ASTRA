import { useState, useRef } from "react";
import { FiMoreVertical } from "react-icons/fi";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";

const LibraryFolder = ({ folder, renameFolder, deleteFolder, refreshLibrary, openFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { email } = useAuthContext();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !email) return;

    console.log(`📤 Uploading file: ${file.name} to folder: ${folder.folder_id}`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", email);
    formData.append("folder_id", folder.folder_id);

    try {
      await api.post("http://localhost:8000/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload successful");
      if (typeof refreshLibrary === "function") {
        refreshLibrary();
      }
    } catch (error) {
      console.error("❌ Upload Error:", error.response?.data || error);
    }
  };

  return (
    <div className="relative bg-gray-200 p-4 rounded-lg flex flex-col items-center border">
      <div className="text-4xl mb-2 cursor-pointer" onClick={() => openFolder(folder.folder_id)}>
        📁
      </div>
      <span className="font-semibold">{folder.folder_name}</span>

      <button className="absolute top-2 right-2" onClick={() => setMenuOpen(!menuOpen)}>
        <FiMoreVertical />
      </button>

      {menuOpen && (
        <div className="absolute top-8 right-2 bg-white border rounded shadow-md p-2 w-32">
          <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => renameFolder(folder.folder_id)}>
            Rename
          </button>
          <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => deleteFolder(folder.folder_id)}>
            Delete
          </button>
          <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>
            Add File
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        </div>
      )}
    </div>
  );
};

export default LibraryFolder;