import { useState, useRef } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";

const LibrarySidebar = ({ createFolder, refreshLibrary, onFileUpload, currentFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { email } = useAuthContext();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !email) return;

    console.log(`📤 Uploading file: ${file.name} for user: ${email} in folder: ${currentFolder || "Library"}`);

    onFileUpload({ file, folderId: currentFolder }); // ✅ Ensure correct folder ID assignment

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", email);
    if (currentFolder) formData.append("folder_id", currentFolder); // ✅ Attach folder ID if inside a folder

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await api.post("http://localhost:8000/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log("✅ Upload successful");
      setIsUploading(false);
      setUploadProgress(0);
      refreshLibrary(); // ✅ Refresh the document list after successful upload
    } catch (error) {
      console.error("❌ Upload Error:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }

    setMenuOpen(false);
  };

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col border-r border-gray-300 hidden md:flex">
      <button className="flex justify-center items-center gap-2 p-2 bg-blue-500 text-white rounded mb-4" onClick={() => setMenuOpen(!menuOpen)}>
        <AiOutlinePlus /> New
      </button>

      {menuOpen && (
        <div className="absolute top-10 left-0 bg-white border rounded shadow-md p-2 w-32">
          <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>
            Upload File
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={() => createFolder()}>
          New Folder
          </button>

        </div>
      )}

      {isUploading && (
        <div className="mt-4 p-3 bg-gray-200 text-center rounded-md">
          <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
          <div className="w-full bg-gray-300 rounded h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      <button className="p-2 rounded bg-gray-200 mb-2">My Library</button>
      <button className="p-2 rounded bg-gray-200">Trash</button>
    </div>
  );
};

export default LibrarySidebar;