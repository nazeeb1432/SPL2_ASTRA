import { useState, useEffect } from "react";
import api from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotesPanel = ({ documentId, onClose, noteToEdit, onSave }) => {
    const [newNote, setNewNote] = useState({ title: "", content: "", page: 1 });
    const [isEditing, setIsEditing] = useState(null);

    // Load note data when in edit mode
    useEffect(() => {
        if (noteToEdit) {
            setNewNote({
                title: noteToEdit.note_title,
                content: noteToEdit.content,
                page: noteToEdit.page
            });
            setIsEditing(noteToEdit.note_id);
        } else {
            // Reset form when not editing
            setNewNote({ title: "", content: "", page: 1 });
            setIsEditing(null);
        }
    }, [noteToEdit]);

    const handleSaveNote = async () => {
        try {
            if (!newNote.title.trim() || !newNote.content.trim()) {
                toast.error("Please enter both title and content for your note");
                return;
            }

            if (isEditing) {
                // Update the existing note
                await api.put(`api/notes/${isEditing}`, {
                    document_id: documentId,
                    note_title: newNote.title,
                    content: newNote.content,
                    page: newNote.page,
                });
                toast.success("Note updated successfully!");
            } else {
                // Create a new note
                await api.post("api/notes/", {
                    document_id: documentId,
                    note_title: newNote.title,
                    content: newNote.content,
                    page: newNote.page,
                });
                toast.success("Note saved successfully!");
            }
            
            // Reset form state
            setNewNote({ title: "", content: "", page: 1 });
            setIsEditing(null);
            
            // Notify parent component that save is complete
            if (onSave) {
                onSave();
            } else {
                onClose(); // Fallback to onClose if onSave isn't provided
            }
        } catch (error) {
            console.error("Error saving note:", error);
            toast.error("Failed to save note. Please try again.");
        }
    };

    const handleCancel = () => {
        setNewNote({ title: "", content: "", page: 1 });
        setIsEditing(null);
        onClose();
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                    {isEditing ? "Edit Note" : "Create Note"}
                </h2>
                <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close panel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <input
                        id="note-title"
                        type="text"
                        placeholder="Enter note title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                    </label>
                    <textarea
                        id="note-content"
                        placeholder="Write your note here..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={6}
                    />
                </div>

                <div>
                    <label htmlFor="note-page" className="block text-sm font-medium text-gray-700 mb-1">
                        Page Number
                    </label>
                    <input
                        id="note-page"
                        type="number"
                        min="1"
                        placeholder="Page number"
                        value={newNote.page}
                        onChange={(e) => setNewNote({ ...newNote, page: parseInt(e.target.value) || 1 })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleSaveNote}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isEditing ? "Update Note" : "Save Note"}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default NotesPanel;