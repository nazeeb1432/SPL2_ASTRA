import { useState, useEffect } from "react";
import api from "../utils/api";

const NotesPanel = ({ documentId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState({ title: "", content: "", page: 1 });
    const [isEditing, setIsEditing] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, [documentId]);

    const fetchNotes = async () => {
        const response = await api.get(`api/notes/${documentId}`);
        setNotes(response.data);
    };

    const handleSaveNote = async () => {
        if (isEditing) {
            // Update the existing note
            await api.put(`api/notes/${isEditing}`, {
                document_id: documentId,
                note_title: newNote.title,
                content: newNote.content,
                page: newNote.page,
            });
        } else {
            // Create a new note
            await api.post("api/notes/", {
                document_id: documentId,
                note_title: newNote.title,
                content: newNote.content,
                page: newNote.page,
            });
        }
        setNewNote({ title: "", content: "", page: 1 });
        setIsEditing(null);
        fetchNotes();
    };

    const handleDeleteNote = async (noteId) => {
        await api.delete(`api/notes/${noteId}`);
        fetchNotes();
    };

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Notes</h2>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <textarea
                    placeholder="Content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    rows={4}
                />
                <input
                    type="number"
                    placeholder="Page"
                    value={newNote.page}
                    onChange={(e) => setNewNote({ ...newNote, page: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <button
                    onClick={handleSaveNote}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    {isEditing ? "Update Note" : "Save Note"}
                </button>
            </div>
            <div className="mt-4 space-y-2">
                {notes.map((note) => (
                    <div key={note.note_id} className="p-2 border border-gray-200 rounded-lg">
                        <h3 className="font-bold">{note.note_title}</h3>
                        <p>{note.content}</p>
                        <p className="text-sm text-gray-500">Page: {note.page}</p>
                        <div className="flex space-x-2 mt-2">
                            <button
                                onClick={() => {
                                    setNewNote({
                                        title: note.note_title,
                                        content: note.content,
                                        page: note.page,
                                    });
                                    setIsEditing(note.note_id);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteNote(note.note_id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesPanel;