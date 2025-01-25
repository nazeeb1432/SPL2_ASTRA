import { useState, useRef } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";  

const LibrarySidebar = ({ createFolder, refreshLibrary }) => {  
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { email } = useAuthContext();  

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !email) return;

    console.log(`📤 Uploading file: ${file.name} for user: ${email}`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", email);

    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload successful");

      // ✅ Ensure refreshLibrary exists before calling it
      if (typeof refreshLibrary === "function") {
        refreshLibrary();
      } else {
        console.error("❌ refreshLibrary is not a function!");
      }
    } catch (error) {
      console.error("❌ Upload Error:", error.response?.data || error);
    }

    setMenuOpen(false);
  };

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col border-r border-gray-300 hidden md:flex">
      <div className="relative">
        <button
          className="flex items-center gap-2 p-2 bg-blue-500 text-white rounded mb-4"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <AiOutlinePlus /> New
        </button>

        {menuOpen && (
          <div className="absolute top-10 left-0 bg-white border rounded shadow-md p-2 w-32">
            <button
              className="block w-full text-left p-2 hover:bg-gray-100"
              onClick={() => fileInputRef.current.click()}
            >
              Upload File
            </button>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button className="block w-full text-left p-2 hover:bg-gray-100" onClick={createFolder}>
              New Folder
            </button>
          </div>
        )}
      </div>
      <button className="p-2 rounded bg-gray-200 mb-2">My Library</button>
      <button className="p-2 rounded bg-gray-200">Trash</button>
    </div>
  );
};

export default LibrarySidebar;