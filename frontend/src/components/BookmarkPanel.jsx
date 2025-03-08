import { useState, useEffect } from "react";
import { FaBookmark, FaTrash, FaQuoteRight, FaInfoCircle } from "react-icons/fa";
import api from "../utils/api";

const BookmarkPanel = ({ documentId, onBookmarkClick, onClose }) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        fetchBookmarks();
    }, [documentId]);

    const fetchBookmarks = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/api/bookmarks/${documentId}`);
            setBookmarks(response.data);
        } catch (error) {
            console.error("Error fetching bookmarks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (bookmarkId, e) => {
        e.stopPropagation(); // Prevent triggering the parent onClick
        try {
            await api.delete(`/api/bookmarks/${bookmarkId}`);
            // Refresh bookmarks after deletion
            fetchBookmarks();
        } catch (error) {
            console.error("Error deleting bookmark:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Bookmarks</h2>
                <div className="flex items-center">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        title="How to create bookmarks"
                    >
                        <FaInfoCircle size={18} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bookmarking Guide/Tutorial */}
            {showGuide && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                    <h3 className="font-medium text-blue-800 flex items-center mb-2">
                        <FaInfoCircle className="mr-2" />
                        How to create bookmarks
                    </h3>
                    <ol className="list-decimal ml-5 text-blue-700 space-y-1">
                        <li>Select text in the document that you want to bookmark</li>
                        <li>Click the "Add Bookmark" button that appears</li>
                        <li>Your bookmark will appear in this panel</li>
                    </ol>
                    <p className="mt-2 text-blue-600 italic">
                        Bookmarks help you quickly find important points in the document later.
                    </p>
                </div>
            )}

            {bookmarks.length === 0 ? (
                <div className="text-center text-gray-500 py-8 px-4 bg-gray-50 rounded-lg border border-gray-100">
                    <FaBookmark className="mx-auto mb-2 text-gray-400" size={24} />
                    <p className="mb-2">No bookmarks added yet</p>
                    <p className="text-sm">
                        Select text in the document and click "Add Bookmark" to save important points.
                    </p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {bookmarks.map((bookmark) => (
                        <li 
                            key={bookmark.bookmark_id}
                            onClick={() => onBookmarkClick(bookmark)}
                            className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors group"
                        >
                            <div className="flex-shrink-0 text-blue-500 mt-1 group-hover:text-blue-600">
                                <FaQuoteRight />
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                        Page {bookmark.page_number}
                                    </span>
                                    <button 
                                        onClick={(e) => handleDelete(bookmark.bookmark_id, e)}
                                        className="text-red-400 hover:text-red-600 ml-2 opacity-70 group-hover:opacity-100"
                                        aria-label="Delete bookmark"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3 group-hover:text-gray-800">
                                    {bookmark.description}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BookmarkPanel;