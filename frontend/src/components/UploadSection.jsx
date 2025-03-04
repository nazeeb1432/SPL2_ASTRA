import { useState } from "react";
import { FiUpload, FiFile, FiAlertCircle } from "react-icons/fi";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const UploadSection = ({ userEmail }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    setFile(null);
    setError(null);

    // Client-side validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(uploadedFile?.type)) {
      setError("Unsupported file type - please upload PDF or image files");
      return;
    }

    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("user_id", userEmail);

    try {
      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/document/${response.data.document_id}`);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload file. Please try again.");
      setFile(null);
    }
  };

  return (
    <main className="flex-1 bg-gray-50 p-8 overflow-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-500 text-sm">Supported formats: PDF, PNG, JPG</p>
        </div>

        {/* File upload area remains unchanged */}
        <label
          htmlFor="file-upload"
          className="group relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 bg-white hover:border-blue-500 transition-colors cursor-pointer"
        >
          <div className="text-center space-y-3">
            <FiUpload className="text-3xl text-blue-500 mx-auto group-hover:text-blue-600" />
            <div>
              <p className="font-medium text-gray-700">Drag and drop files</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>

        {/* Only changed part: Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-md flex items-center gap-2">
            <FiAlertCircle className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Original file display remains unchanged */}
        {file && !error && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100 shadow-xs flex items-center gap-3">
            <FiFile className="text-gray-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">Uploading...</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default UploadSection;