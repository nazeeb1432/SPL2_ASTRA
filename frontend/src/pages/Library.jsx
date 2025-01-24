// pages/LibraryPage.jsx
import { useState } from "react";
import LibraryTopbar from "../components/LibraryTopbar";
import LibraryList from "../components/LibraryList";

const LibraryPage = () => {
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");

  // Example Data
  const items = [
    { id: 1, title: "Document1.pdf", size: "2MB", uploadedAt: "Jan 5" },
    { id: 2, title: "Photo.png", size: "1MB", uploadedAt: "Jan 10" },
    { id: 3, title: "Audio.mp3", size: "5MB", uploadedAt: "Jan 12" },
  ];

  // Filter items based on search query
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen p-8 bg-gray-50">
      {/* Top Bar with Search & View Toggle */}
      <LibraryTopbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* List of Files/Folders */}
      <LibraryList items={filteredItems} viewMode={viewMode} />
    </div>
  );
};

export default LibraryPage;
