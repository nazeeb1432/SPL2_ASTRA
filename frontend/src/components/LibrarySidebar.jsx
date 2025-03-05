import { useState, useRef, useEffect } from "react";
import { AiOutlinePlus, AiOutlineAudio, AiOutlineFileAdd, AiOutlineFolderAdd } from "react-icons/ai";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";

const LibrarySidebar = ({ createFolder, refreshLibrary, onFileUpload, currentFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { email: contextEmail } = useAuthContext();
  const email = contextEmail || Cookies.get("email");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      !buttonRef.current.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file || !email) return;

  console.log(`Uploading file: ${file.name} for user: ${email} in folder: ${currentFolder || "Library"}`);

  onFileUpload({ file, folderId: currentFolder });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", email);
  if (currentFolder) formData.append("folder_id", currentFolder);

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

    console.log("Upload successful");
    setIsUploading(false);
    setUploadProgress(0);
    refreshLibrary(); // Ensure this is called to refresh the UI
  } catch (error) {
    console.error("Upload Error:", error);
    setIsUploading(false);
    setUploadProgress(0);
  }

  setMenuOpen(false);
};
 

  const handleCreateFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (folderName && folderName.trim()) {
      createFolder(folderName.trim());
    }
    setMenuOpen(false);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4 relative">
      <div className="space-y-4">
        <button
          ref={buttonRef}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg
                    hover:bg-blue-700 transition-colors font-medium text-sm"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <AiOutlinePlus className="w-5 h-5" />
          New
        </button>

        <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm">
          <AiOutlineAudio className="w-5 h-5 text-purple-600" />
          Audiobooks
        </button>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute top-16 left-4 bg-white border border-gray-200 rounded-lg shadow-xl py-2 w-56 z-50"
        >
          <button
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3"
            onClick={() => fileInputRef.current.click()}
          >
            <AiOutlineFileAdd className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Upload File</p>
              <p className="text-xs text-gray-500">PDF, DOCX, TXT</p>
            </div>
          </button>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3"
            onClick={handleCreateFolder}
          >
            <AiOutlineFolderAdd className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">New Folder</p>
              <p className="text-xs text-gray-500">Organize your files</p>
            </div>
          </button>
        </div>
      )}

      {isUploading && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarySidebar;