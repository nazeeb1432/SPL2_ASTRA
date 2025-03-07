import { useState, useEffect } from "react";
import api from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notes = ({ documentId, onEdit, onClose }) => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, [documentId]);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`api/notes/${documentId}`);
            setNotes(response.data);
        } catch (error) {
            console.error("Error fetching notes:", error);
            toast.error("Failed to load notes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            await api.delete(`api/notes/${noteId}`);
            toast.success("Note deleted successfully");
            fetchNotes();
        } catch (error) {
            console.error("Error deleting note:", error);
            toast.error("Failed to delete note");
        }
    };

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">My Notes</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close panel"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>No notes found for this document.</p>
                    <button 
                        onClick={() => onEdit(null)}
                        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Create your first note
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {notes.map((note) => (
                        <div key={note.note_id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 bg-gray-50">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{note.note_title}</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Page {note.page}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-3 whitespace-pre-line">{note.content}</p>
                            <div className="flex justify-end space-x-2 mt-2">
                                <button
                                    onClick={() => onEdit(note)}
                                    className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteNote(note.note_id)}
                                    className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default Notes;