import { useState, useEffect } from "react";
import LibraryTopbar from "../components/LibraryTopbar";
import LibrarySidebar from "../components/LibrarySidebar";
import LibraryFolder from "../components/LibraryFolder";
import LibraryDocument from "../components/LibraryDocument"; // Import the new component
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";

const LibraryPage = () => {
  const { email: contextEmail } = useAuthContext();
  const email = contextEmail || Cookies.get("email");
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [folderAction, setFolderAction] = useState({ isOpen: false, type: "", folderId: null, folderName: "" });

  useEffect(() => {
    if (!email) return;

    const fetchFolders = async () => {
      try {
        const response = await api.get(`/folders/${email}`);
        setFolders(response.data.folders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const endpoint = currentFolder
          ? `/folders/${currentFolder}/documents` // Fetch documents for the current folder
          : `/documents/${email}?folder_id=null`; // Fetch only root folder documents
        const response = await api.get(endpoint);
        setDocuments(response.data.documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
  
    fetchFolders();
    fetchDocuments();
  }, [email, currentFolder, uploadTrigger]);

  const refreshLibrary = async () => {
    try {
      const foldersResponse = await api.get(`/folders/${email}`);
      setFolders(foldersResponse.data.folders);

      const docsEndpoint = `/documents/${email}`;
      const docsResponse = await api.get(docsEndpoint);
      setDocuments(docsResponse.data.documents);
      console.log("Library refreshed");
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  const openFolder = (folderId) => {
    console.log(`Opening folder: ${folderId}`);
    setCurrentFolder(folderId);
  };

  const goBackToMainLibrary = () => {
    setCurrentFolder(null);
  };

  const handleFileUpload = (fileData) => {
    setUploadedFile({
      ...fileData,
      user_id: email
    });
    setUploadTrigger(prev => prev + 1); // Increment uploadTrigger to trigger re-fetch
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await api.delete(`/documents/delete/${documentId}`);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.document_id !== documentId));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const currentFolderName = folders.find(folder => folder.folder_id === currentFolder)?.folder_name || "Folder";

  const handleFolderAction = (type, folderId = null, folderName = "") => {
    setFolderAction({ isOpen: true, type, folderId, folderName });
  };

  const handleFolderSubmit = async (folderName) => {
    if (!folderName.trim()) return;

    const tempFolder = {
      folder_id: Date.now(),
      folder_name: folderName.trim(),
    };

    setFolders(prev => [...prev, tempFolder]);

    try {
      const response = await api.post("/folders/create", {
        user_id: email,
        folder_name: folderName.trim()
      });

      setFolders(prev => prev.map(folder =>
        folder.folder_id === tempFolder.folder_id ? response.data.folder : folder
      ));
    } catch (error) {
      console.error("Error creating folder:", error);
      setFolders(prev => prev.filter(folder => folder.folder_id !== tempFolder.folder_id));
    }
  };

  const deleteFolder = async (folderId) => {
    console.log(`Deleting folder with ID: ${folderId}`);

    try {
      await api.delete(`/folders/delete/${folderId}`);
      console.log("Folder deleted successfully");

      setFolders(prevFolders => prevFolders.filter(folder => folder.folder_id !== folderId));
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <LibrarySidebar
        createFolder={handleFolderSubmit}
        refreshLibrary={refreshLibrary}
        onFileUpload={handleFileUpload}
        currentFolder={currentFolder}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <LibraryTopbar/>

        <div className="flex-1 overflow-y-auto p-6">
  {!currentFolder ? (
    <div>
      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <LibraryFolder
                key={folder.folder_id}
                folder={folder}
                renameFolder={() => handleFolderAction("rename", folder.folder_id, folder.folder_name)}
                deleteFolder={() => deleteFolder(folder.folder_id)}
                openFolder={openFolder}
                refreshLibrary={refreshLibrary}
              />
            ))}
          </div>
        </div>
      )}

      {/* Documents Section (Root Folder Files) */}
      {documents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents
              .filter((doc) => doc.folder_id === null) // Only show root folder files
              .map((document) => (
                <LibraryDocument
                  key={document.document_id}
                  document={document}
                  handleDeleteDocument={handleDeleteDocument}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty State for No Folders and No Root Folder Files */}
      {folders.length === 0 && documents.filter((doc) => doc.folder_id === null).length === 0 && (
        <div className="flex justify-center items-center h-40vh"> 
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-medium">No documents found</p>
            <p className="mt-1 text-sm">Upload your first file or create a new folder</p>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="mb-6">
      {/* Back Button and Current Folder Name */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          onClick={goBackToMainLibrary}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Library</span>
        </button>
        <div className="w-10"></div>
      </div>

      {/* Documents in the Current Folder */}
      {documents.filter((doc) => doc.folder_id === currentFolder).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents
            .filter((doc) => doc.folder_id === currentFolder) // Only show files in the current folder
            .map((document) => (
              <LibraryDocument
                key={document.document_id}
                document={document}
                handleDeleteDocument={handleDeleteDocument}
              />
            ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-medium">No documents found</p>
            <p className="mt-1 text-sm">Upload your first file or create a new folder</p>
          </div>
        </div>
      )}
    </div>
  )}
</div>

      </div>

      {folderAction.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-5 rounded-md shadow-md">
            <h2 className="text-lg font-bold">{folderAction.type === "create" ? "Create New Folder" : "Rename Folder"}</h2>
            <input
              type="text"
              className="border p-2 w-full mt-2"
              placeholder="Folder Name"
              value={folderAction.folderName}
              onChange={(e) => setFolderAction(prev => ({ ...prev, folderName: e.target.value }))}
            />
            <div className="flex justify-end mt-4">
              <button onClick={handleFolderSubmit} className="px-4 py-2 bg-blue-500 text-white rounded ml-2">
                {folderAction.type === "create" ? "Create" : "Rename"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;