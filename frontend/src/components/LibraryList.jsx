import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";

const LibraryList = ({ currentFolder, refreshLibrary, uploadedFile }) => {
  const { email: contextEmail } = useAuthContext();
  const email = contextEmail || Cookies.get("email");
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState([]);

  useEffect(() => {
    if (!email) {
      console.error("userEmail is undefined in LibraryList.jsx");
      return;
    }

    const fetchDocuments = async () => {
      try {
        const endpoint = currentFolder ? `/folders/${currentFolder}/documents` : `/documents/${email}`;
        const response = await api.get(endpoint);
        setDocuments(response.data.documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [email, currentFolder]);

  useEffect(() => {
    if (uploadedFile) {
      const tempId = Date.now();
      const tempDoc = {
        document_id: tempId,
        title: uploadedFile.name,
        file_path: "Uploading...",
        isUploading: true,
        progress: 0,
      };

      setUploadingDocs((prev) => [...prev, tempDoc]);

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("user_id", email);
      if (currentFolder) formData.append("folder_id", currentFolder);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8000/documents/upload", true);
      xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          setUploadingDocs((prev) =>
            prev.map((doc) =>
              doc.document_id === tempId ? { ...doc, progress: percentComplete } : doc
            )
          );
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadingDocs((prev) => prev.filter((doc) => doc.document_id !== tempId));

          const uploadedDoc = {
            document_id: response.document_id,
            title: uploadedFile.name,
            file_path: response.file_path,
            folder_id: currentFolder,
            isUploading: false,
          };

          setDocuments((prevDocs) => [uploadedDoc, ...prevDocs]);
          refreshLibrary();
        } else {
          console.error("Upload Error:", xhr.responseText);
          setUploadingDocs((prev) => prev.filter((doc) => doc.document_id !== tempId));
        }
      };

      xhr.onerror = () => {
        console.error("Network Error during upload");
        setUploadingDocs((prev) => prev.filter((doc) => doc.document_id !== tempId));
      };

      xhr.send(formData);
    }
  }, [uploadedFile]);

  const handleDeleteDocument = async (documentId) => {
    try {
      await api.delete(`http://localhost:8000/documents/delete/${documentId}`);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.document_id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {documents.length > 0 || uploadingDocs.length > 0 ? (
        [...uploadingDocs, ...documents]
          .filter((doc) => (currentFolder ? doc.folder_id === currentFolder : doc.folder_id === null))
          .map((doc) => (
            <div
              key={doc.document_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-100"
            >
              <h3 className="font-semibold text-lg truncate mb-2">
                {doc.isUploading ? `${doc.title} (${doc.progress}%)` : doc.title}
              </h3>
              <p className="text-sm text-gray-500 truncate mb-4">
                {doc.isUploading ? "Uploading..." : doc.file_path}
              </p>
              <div className="mt-4 flex justify-between items-center">
                {doc.isUploading ? (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${doc.progress}%` }}
                    />
                  </div>
                ) : (
                  <>
                    <Link
                      to={`/document/${doc.document_id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteDocument(doc.document_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
      ) : (
        <div className="col-span-full text-center text-gray-500">
          <p className="text-lg">No documents found.</p>
          <p className="text-sm">Upload a file to get started.</p>
        </div>
      )}
    </div>
  );
};

export default LibraryList;