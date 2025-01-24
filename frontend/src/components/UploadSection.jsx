import { useState } from "react";
import { FiUpload } from "react-icons/fi";

const UploadSection = () => {
  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <main className="flex-1 bg-gray-50 p-8 overflow-auto">
      <h1 className="text-2xl font-semibold mb-4">Upload Your Content</h1>

      {/* Upload Section */}
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-white text-gray-500 cursor-pointer hover:bg-gray-100"
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
