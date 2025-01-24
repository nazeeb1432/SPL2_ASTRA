import { useState } from "react";
import { FiUpload } from "react-icons/fi";
import api from "../utils/api";
import { useNavigate } from "react-router-dom"; 

const UploadSection = ( { userEmail }) => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const uploadedFile= event.target.files[0];
    setFile(uploadedFile);

    if(!uploadedFile) return;

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("user_id", userEmail);

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const documentId = response.data.document_id;

      navigate(`/document/${documentId}`);
    }

    catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload file. Please try again.");      
    }
  };

  return (
    <main className="flex-1 bg-gray-50 p-8 overflow-auto">
      <h1 className="text-2xl font-semibold mb-6">Upload Your Content</h1>
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-20 bg-white text-gray-500 cursor-pointer hover:bg-gray-100"
      >
        <FiUpload className="text-3xl mb-2" />
        <span>Drag & Drop files here or click to browse</span>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {file && (
        <div className="mt-4 p-4 bg-white border rounded-md">
          <p className="text-sm text-gray-700">
            File Selected: <strong>{file.name}</strong>
          </p>
        </div>
      )}
    </main>
  );
};

export default UploadSection;
