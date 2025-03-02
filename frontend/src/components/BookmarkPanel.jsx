import { useState, useEffect } from "react";
import api from "../utils/api";

const BookmarkPanel = ({ documentId, onNavigate }) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [newBookmark, setNewBookmark] = useState({ page_number: 1, description: "" });

    useEffect(() => {
        fetchBookmarks();
    }, [documentId]);

    const fetchBookmarks = async () => {
        const response = await api.get(`api/bookmarks/${documentId}`);
        setBookmarks(response.data);
    };

    const handleSaveBookmark = async () => {
        await api.post("api/bookmarks/", { ...newBookmark, document_id: documentId });
        setNewBookmark({ page_number: 1, description: "" });
        fetchBookmarks();
    };

    const handleDeleteBookmark = async (bookmarkId) => {
        await api.delete(`api/bookmarks/${bookmarkId}`);
        fetchBookmarks();
    };

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Bookmarks</h2>
            <div className="space-y-4">
                <input
                    type="number"
                    placeholder="Page Number"
                    value={newBookmark.page_number}
                    onChange={(e) => setNewBookmark({ ...newBookmark, page_number: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <textarea
                    placeholder="Description"
                    value={newBookmark.description}
                    onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={2}
                />
                <button
                    onClick={handleSaveBookmark}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    Save Bookmark
                </button>
            </div>
            <div className="mt-4 space-y-2">
                {bookmarks.map((bookmark) => (
                    <div
                        key={bookmark.bookmark_id}
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => onNavigate(bookmark.page_number)}
                    >
                        <h3 className="font-bold">Page {bookmark.page_number}</h3>
                        <p className="text-sm text-gray-500">{bookmark.description}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBookmark(bookmark.bookmark_id);
                            }}
                            className="text-red-600 hover:text-red-800"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookmarkPanel;