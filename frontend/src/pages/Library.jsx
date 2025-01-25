import { useState, useEffect } from "react";
import LibraryTopbar from "../components/LibraryTopbar";
import LibraryList from "../components/LibraryList";
import LibrarySidebar from "../components/LibrarySidebar";
import LibraryFolder from "../components/LibraryFolder";
import UploadSection from "../components/UploadSection";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";

const LibraryPage = () => {
  const { email } = useAuthContext();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
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
        console.error("❌ Error fetching folders:", error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const endpoint = currentFolder ? `/folders/${currentFolder}/documents` : `/documents/${email}`;
        const response = await api.get(endpoint);
        setDocuments(response.data.documents);
      } catch (error) {
        console.error("❌ Error fetching documents:", error);
      }
    };

    fetchFolders();
    fetchDocuments();
  }, [email, currentFolder, uploadTrigger]);

  const refreshLibrary = async () => {
    try {
      const endpoint = currentFolder ? `/folders/${currentFolder}/documents` : `/documents/${email}`;
      const response = await api.get(endpoint);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("❌ Error refreshing documents:", error);
    }
  };

  const openFolder = (folderId) => {
    console.log(`📂 Opening folder: ${folderId}`);
    setCurrentFolder(folderId);
  };

  const goBackToMainLibrary = () => {
    setCurrentFolder(null);
  };

  const handleFileUpload = (file) => {
    setUploadedFile({ file, folderId: currentFolder });
    setUploadTrigger((prev) => prev + 1);
  };

  const currentFolderName = folders.find(folder => folder.folder_id === currentFolder)?.folder_name || "Folder";

  // ✅ Open modal for creating or renaming a folder
  const handleFolderAction = (type, folderId = null, folderName = "") => {
    setFolderAction({ isOpen: true, type, folderId, folderName });
  };

  // ✅ Create or rename folder based on modal input
  const handleFolderSubmit = async () => {
    if (!folderAction.folderName.trim()) return;

    if (folderAction.type === "create") {
      console.log(`📂 Creating folder: ${folderAction.folderName}`);
      const tempFolder = {
        folder_id: Date.now(),
        folder_name: folderAction.folderName,
      };

      // ✅ Add folder instantly to the UI before API response
      setFolders(prevFolders => [...prevFolders, tempFolder]);

      try {
        const response = await api.post("/folders/create", { user_id: email, folder_name: folderAction.folderName });

        // ✅ Replace temporary folder with actual folder from API
        setFolders(prevFolders =>
          prevFolders.map(folder =>
            folder.folder_id === tempFolder.folder_id ? response.data.folder : folder
          )
        );

        console.log("✅ Folder created successfully:", response.data.folder);
      } catch (error) {
        console.error("❌ Error creating folder:", error);

        // ❌ Remove the temporary folder if API request fails
        setFolders(prevFolders => prevFolders.filter(folder => folder.folder_id !== tempFolder.folder_id));
      }
    } else if (folderAction.type === "rename") {
      console.log(`✏️ Renaming folder ID ${folderAction.folderId} to "${folderAction.folderName}"`);

      try {
        await api.put(`/folders/rename/${folderAction.folderId}`, { folder_name: folderAction.folderName });

        // ✅ Update the UI instantly
        setFolders(prevFolders =>
          prevFolders.map(folder =>
            folder.folder_id === folderAction.folderId ? { ...folder, folder_name: folderAction.folderName } : folder
          )
        );
      } catch (error) {
        console.error("❌ Error renaming folder:", error);
      }
    }

    setFolderAction({ isOpen: false, type: "", folderId: null, folderName: "" });
  };

  const deleteFolder = async (folderId) => {
    console.log(`🗑 Deleting folder with ID: ${folderId}`);

    try {
      await api.delete(`/folders/delete/${folderId}`);
      console.log("✅ Folder deleted successfully");

      // ✅ Instantly update the UI
      setFolders(prevFolders => prevFolders.filter(folder => folder.folder_id !== folderId));

    } catch (error) {
      console.error("❌ Error deleting folder:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <LibrarySidebar createFolder={() => handleFolderAction("create")} refreshLibrary={refreshLibrary} onFileUpload={handleFileUpload} />

      <div className="flex flex-col flex-1 p-8">

        {!currentFolder ? (
          <LibraryTopbar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
        ) : (
          <div className="flex justify-between items-center mb-6 px-4">
            <h2 className="text-2xl font-bold">{currentFolderName}</h2>
            <button 
              onClick={goBackToMainLibrary} 
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md"
            >
              Go Back
            </button>
          </div>
        )}

        {!currentFolder && (
          <div className="grid grid-cols-4 gap-4">
            {folders.map(folder => (
              <LibraryFolder
                key={folder.folder_id}
                folder={folder}
                renameFolder={() => handleFolderAction("rename", folder.folder_id, folder.folder_name)}
                deleteFolder={() => deleteFolder(folder.folder_id)}
                openFolder={openFolder}
              />
            ))}
          </div>
        )}

        {documents.length > 0 ? (
          <LibraryList items={documents} refreshLibrary={refreshLibrary} currentFolder={currentFolder} uploadedFile={uploadedFile} />
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-gray-500 text-lg">No Documents Found</p>
          </div>
        )}
      </div>

      {/* ✅ Folder Action Modal */}
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