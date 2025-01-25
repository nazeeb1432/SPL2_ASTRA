import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";

const LibraryList = ({ currentFolder, refreshLibrary, uploadedFile }) => {
  const { email } = useAuthContext();
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState([]); // Track files being uploaded

  useEffect(() => {
    if (!email) {
      console.error("❌ userEmail is undefined in LibraryList.jsx");
      return;
    }

    const fetchDocuments = async () => {
      try {
        const endpoint = currentFolder ? `/folders/${currentFolder}/documents` : `/documents/${email}`;
        console.log(`📤 Fetching documents from ${endpoint}`);
        const response = await api.get(endpoint);
        console.log("✅ Documents Fetched:", response.data);
        setDocuments(response.data.documents);
      } catch (error) {
        console.error("❌ Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [email, currentFolder]);

  // 🔥 Show progress during upload
  useEffect(() => {
    if (uploadedFile) {
      const tempId = Date.now();
      const tempDoc = {
        document_id: tempId,
        title: uploadedFile.name,
        file_path: "Uploading...",
        isUploading: true,
        progress: 0, // Start with 0% progress
      };

      setUploadingDocs(prev => [...prev, tempDoc]);

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("user_id", email);
      if (currentFolder) formData.append("folder_id", currentFolder);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8000/documents/upload", true);
      xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

      // Update progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          setUploadingDocs(prev =>
            prev.map(doc =>
              doc.document_id === tempId ? { ...doc, progress: percentComplete } : doc
            )
          );
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadingDocs(prev => prev.filter(doc => doc.document_id !== tempId));

          const uploadedDoc = {
            document_id: response.document_id,
            title: uploadedFile.name,
            file_path: response.file_path,
            folder_id: currentFolder, // ✅ Ensure it is assigned to the correct folder
            isUploading: false,
          };

          setDocuments(prevDocs => [uploadedDoc, ...prevDocs]);
          refreshLibrary();
        } else {
          console.error("❌ Upload Error:", xhr.responseText);
          setUploadingDocs(prev => prev.filter(doc => doc.document_id !== tempId));
        }
      };

      xhr.onerror = () => {
        console.error("❌ Network Error during upload");
        setUploadingDocs(prev => prev.filter(doc => doc.document_id !== tempId));
      };

      xhr.send(formData);
    }
  }, [uploadedFile]);

  const handleDeleteDocument = async (documentId) => {
    console.log(`🗑 Deleting document with ID: ${documentId}`);

    try {
      await api.delete(`http://localhost:8000/documents/delete/${documentId}`);
      console.log("✅ Document deleted successfully");

      // ✅ Instantly update the UI
      setDocuments(prevDocs => prevDocs.filter(doc => doc.document_id !== documentId));

    } catch (error) {
      console.error("❌ Error deleting document:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      {documents.length > 0 || uploadingDocs.length > 0 ? (
        [...uploadingDocs, ...documents]
          .filter(doc => currentFolder ? doc.folder_id === currentFolder : doc.folder_id === null) // ✅ Show only correct files
          .map((doc) => (
            <div key={doc.document_id} className="p-5 bg-white border rounded-lg shadow-lg">
              <h3 className="font-semibold">
                {doc.isUploading ? `${doc.title} (${doc.progress}%)` : doc.title}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {doc.isUploading ? "Processing file, please wait..." : doc.file_path}
              </p>
              <div className="flex justify-between items-center mt-3">
                {doc.isUploading ? (
                  <div className="relative w-12 h-12">
                    <svg className="absolute top-0 left-0 w-full h-full">
                      <circle
                        className="text-gray-200"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth="4"
                        cx="24"
                        cy="24"
                        r="20"
                      />
                      <circle
                        className="text-blue-500"
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth="4"
                        strokeDasharray="125.6"
                        strokeDashoffset={125.6 - (doc.progress / 100) * 125.6}
                        cx="24"
                        cy="24"
                        r="20"
                        style={{ transition: "stroke-dashoffset 0.2s ease-in-out" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
                      {doc.progress}%
                    </span>
                  </div>
                ) : (
                  <>
                    <Link to={`/document/${doc.document_id}`} className="px-3 py-2 bg-blue-500 text-white rounded">
                      Read
                    </Link>
                    <button
                      onClick={() => handleDeleteDocument(doc.document_id)}
                      className="px-3 py-2 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
      ) : (
        <p className="text-gray-600 text-center col-span-full">No documents found.</p>
      )}
    </div>
  );
};

export default LibraryList;