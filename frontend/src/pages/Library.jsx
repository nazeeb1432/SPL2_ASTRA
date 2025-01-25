import { useState, useEffect } from "react";
import LibraryTopbar from "../components/LibraryTopbar";
import LibraryList from "../components/LibraryList";
import LibrarySidebar from "../components/LibrarySidebar";
import LibraryFolder from "../components/LibraryFolder";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";

const LibraryPage = () => {
  const { email } = useAuthContext();
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]); // Store user documents

  useEffect(() => {
    if (!email) {
      console.error("❌ User email is undefined");
      return;
    }

    const fetchFolders = async () => {
      try {
        console.log(`📂 Fetching folders for user: ${email}`);
        const response = await api.get(`/folders/${email}`);
        setFolders(response.data.folders);
      } catch (error) {
        console.error("❌ Error fetching folders:", error);
      }
    };

    const fetchDocuments = async () => {
      try {
        console.log(`📄 Fetching documents for user: ${email}`);
        const response = await api.get(`/documents/${email}`);
        setDocuments(response.data.documents);
      } catch (error) {
        console.error("❌ Error fetching documents:", error);
      }
    };

    fetchFolders();
    fetchDocuments();
  }, [email]);

  // ✅ Function to refresh library after file upload
  const refreshLibrary = async () => {
    try {
      console.log("🔄 Refreshing document list...");
      const response = await api.get(`/documents/${email}`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("❌ Error refreshing documents:", error);
    }
  };

  // ✅ Folder creation
  const createFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    const tempFolder = {
      folder_id: Date.now(), 
      folder_name: folderName,
    };

    setFolders((prevFolders) => [...prevFolders, tempFolder]);

    try {
      const response = await api.post(
        "/folders/create",
        { user_id: email, folder_name: folderName },
        { headers: { "Content-Type": "application/json" } }
      );

      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.folder_id === tempFolder.folder_id ? response.data.folder : folder
        )
      );

      console.log("✅ New Folder Created:", response.data.folder);
    } catch (error) {
      console.error("❌ Error creating folder:", error.response?.data || error);

      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.folder_id !== tempFolder.folder_id)
      );
    }
  };

  // ✅ Folder renaming
  const renameFolder = async (folderId) => {
    const newName = prompt("Enter new folder name:");
    if (!newName) return;

    try {
      await api.put(
        `/folders/rename/${folderId}`,
        { folder_name: newName },
        { headers: { "Content-Type": "application/json" } }
      );

      setFolders((prevFolders) =>
        prevFolders.map(folder =>
          folder.folder_id === folderId ? { ...folder, folder_name: newName } : folder
        )
      );
    } catch (error) {
      console.error("❌ Error renaming folder:", error.response?.data || error);
    }
  };

  // ✅ Folder deletion
  const deleteFolder = async (folderId) => {
    if (!window.confirm("Are you sure you want to delete this folder?")) return;

    try {
      await api.delete(`/folders/delete/${folderId}`);
      setFolders((prevFolders) =>
        prevFolders.filter(folder => folder.folder_id !== folderId)
      );
    } catch (error) {
      console.error("❌ Error deleting folder:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <LibrarySidebar createFolder={createFolder} refreshLibrary={refreshLibrary} />
      <div className="flex flex-col flex-1 p-8">
        <LibraryTopbar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        <div className="grid grid-cols-4 gap-4">
          {folders.map(folder => (
            <LibraryFolder 
              key={folder.folder_id} 
              folder={folder} 
              renameFolder={renameFolder} 
              deleteFolder={deleteFolder} 
            />
          ))}
        </div>
        <LibraryList items={documents} viewMode={viewMode} />
      </div>
    </div>
  );
};

export default LibraryPage;
