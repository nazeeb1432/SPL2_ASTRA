import { useState, useEffect } from "react";
import LibrarySidebar from "../components/LibrarySidebar";
import LibraryFolder from "../components/LibraryFolder";
import LibraryDocument from "../components/LibraryDocument";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";
import { FiLogOut, FiArrowLeft, FiFolder, FiFile } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const LibraryPage = () => {
  const { email: contextEmail, logout } = useAuthContext();
  const navigate = useNavigate();
  const email = contextEmail || Cookies.get("email");
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [folderAction, setFolderAction] = useState({ isOpen: false, type: "", folderId: null, folderName: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          ? `/folders/${currentFolder}/documents` 
          : `/documents/${email}?folder_id=null`;
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
    setUploadTrigger(prev => prev + 1);
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
    try {
      await api.delete(`/folders/delete/${folderId}`);
      setFolders(prevFolders => prevFolders.filter(folder => folder.folder_id !== folderId));
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderNoDocumentsFound = () => (
    <div className="flex justify-center items-center h-[calc(100vh-200px)]">
      <div className="text-center text-gray-500">
        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-6 text-xl font-medium">No documents found</p>
        <p className="mt-2 text-sm text-gray-400">Upload your first file or create a new folder</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hide on small screens by default */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block transition-all duration-300 ease-in-out z-20`}>
        <LibrarySidebar
          createFolder={handleFolderSubmit}
          refreshLibrary={refreshLibrary}
          onFileUpload={handleFileUpload}
          currentFolder={currentFolder}
        />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Custom header with logout */}
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center">
            {/* Hamburger menu for mobile */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
    
            <h1 className="text-2xl font-bold text-blue-700">
              {currentFolder ? currentFolderName : "My Library"}
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-100 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 
                    transition-colors font-medium"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!currentFolder ? (
            <div>
              {/* Folders Section */}
              {folders.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <FiFolder className="text-blue-500 mr-2 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-800">Folders</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              {documents.filter(doc => doc.folder_id === null).length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <FiFile className="text-green-500 mr-2 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-800">Files</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents
                      .filter((doc) => doc.folder_id === null)
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
                renderNoDocumentsFound()
              )}
            </div>
          ) : (
            <div className="mb-6">
              {/* Back Button and Current Folder Name */}
              <div className="flex items-center justify-between mb-10">
                <button
                  onClick={goBackToMainLibrary}
                  className="flex items-center gap-2 font-bold bg-blue-600 text-white hover:bg-blue-700
                           transition-colors px-4 py-2 rounded-lg shadow-sm"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Library</span>
                </button>
              </div>

              {/* Documents in the Current Folder */}
              {documents.filter((doc) => doc.folder_id === currentFolder).length > 0 ? (
                <div>
                  <div className="flex items-center mb-4">
                    <FiFile className="text-green-500 mr-2 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-800">Files in {currentFolderName}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents
                      .filter((doc) => doc.folder_id === currentFolder)
                      .map((document) => (
                        <LibraryDocument
                          key={document.document_id}
                          document={document}
                          handleDeleteDocument={handleDeleteDocument}
                        />
                      ))}
                  </div>
                </div>
              ) : (
                renderNoDocumentsFound()
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for folder actions */}
      {folderAction.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {folderAction.type === "create" ? "Create New Folder" : "Rename Folder"}
            </h2>
            <input
              type="text"
              className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Folder Name"
              value={folderAction.folderName}
              onChange={(e) => setFolderAction(prev => ({ ...prev, folderName: e.target.value }))}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setFolderAction({ isOpen: false, type: "", folderId: null, folderName: "" })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleFolderSubmit(folderAction.folderName);
                  setFolderAction({ isOpen: false, type: "", folderId: null, folderName: "" });
                }} 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
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