import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import PlaybackControls from "../components/PlaybackControls";
import { useAuthContext } from "../context/AuthContext";
import SummarizationPanel from "../components/SummarizationPanel";
import NotesPanel from "../components/NotesPanel";
import Notes from "../components/Notes";
import DocumentSideRibbon from "../components/DocumentSideRibbon";
import Cookies from "js-cookie";
import GoToLibraryButton from "../components/GoToLibraryButton";
import DocumentViewer from "../components/DocumentViewer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DocumentReader = () => {
    const { documentId } = useParams();
    const [document, setDocument] = useState(null);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState("");
    const [audioPath, setAudioPath] = useState("");
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingAudiobook, setIsGeneratingAudiobook] = useState(false); // Track audiobook generation status

    const { email: contextEmail } = useAuthContext();
    const email = contextEmail || Cookies.get("email");

    const [showSummarizationPanel, setShowSummarizationPanel] = useState(false);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [showViewNotesPanel, setShowViewNotesPanel] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState(null);

    // Shift the main content to the left when the summarization panel is open
    const mainContentClass = showSummarizationPanel ? "mr-96" : "";

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await api.get(`/documents/view/${documentId}`);
                setDocument(response.data);
               
                // Check if there's saved progress and set page number accordingly
                if (response.data.progress && response.data.progress > 1) {
                    setPageNumber(response.data.progress);
                    console.log(`Restored reading progress to page ${response.data.progress}`);
                } else {
                    setPageNumber(1);
                    console.log("Starting from page 1 (no saved progress)");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchVoices = async () => {
            const response = await api.get("/audiobooks/voices");
            setVoices(response.data.voices);
        };

        const fetchUserSettings = async () => {
            try {
                const response = await api.get(`/settings/${email}`);
                const settings = response.data;
                setSelectedVoice(settings.voice_id || "");
                setPlaybackSpeed(settings.speed || 1.0);
            } catch (error) {
                console.error("Error fetching user settings:", error);
            }
        };

        fetchDocument();
        fetchVoices();
        fetchUserSettings();
    }, [documentId, email]);

    const generateAudiobook = async () => {
        if (!selectedVoice) return alert("Please select a voice!");
        try {
            setIsGeneratingAudiobook(true); // Start audiobook generation
            const response = await api.post(`/audiobooks/generate/${documentId}`, {
                voice_id: selectedVoice,
                user_id: email,
            });
    
            console.log("Audiobook generation started. Audiobook ID:", response.data.audiobook_id);
    
            // Start polling to check if the audiobook is ready
            const pollAudiobookStatus = async () => {
                try {
                    const statusResponse = await api.get(`/audiobooks/status/${response.data.audiobook_id}`);
                    console.log("Polling status:", statusResponse.data);
    
                    if (statusResponse.data.status === "completed") {
                        // Use the full URL returned by the backend
                        setAudioPath(statusResponse.data.file_path); // Update audioPath state
                        console.log("Audiobook ready. File path:", statusResponse.data.file_path);
                        setIsGeneratingAudiobook(false); // Stop polling
                    } else {
                        // If not completed, poll again after 5 seconds
                        setTimeout(pollAudiobookStatus, 5000);
                    }
                } catch (error) {
                    console.error("Error polling audiobook status:", error);
                    setIsGeneratingAudiobook(false); // Stop polling on error
                }
            };
    
            pollAudiobookStatus(); // Start polling
            alert("Audiobook generation started!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Audiobook generation failed");
            setIsGeneratingAudiobook(false); // Stop polling on error
        }
    };
    const handleSummarize = async (text) => {
        const response = await api.post("api/summarize", { text });
        return response.data.summary;
    };

    const handleGenerateKeywords = async (text) => {
        const response = await api.post("api/generate-keywords", { text });
        return response.data.keywords;
    };

    const handleWordMeaning = async (text) => {
        const response = await api.post("api/word-meaning", { text });
        return response.data.meaning;
    };

    const handleNavigate = (section) => {
        if (section === "audiobooks") {
            window.location.href = "/audiobooks";
        } else if (section === "notes") {
            // First close any other panels
            setShowSummarizationPanel(false);
            setShowViewNotesPanel(false);
            // Reset noteToEdit when creating a new note
            setNoteToEdit(null);
            // Open notes creation panel
            setShowNotesPanel(true);
            window.scrollBy({ top: 100, behavior: "smooth" });
        } else if (section === "view-notes") {
            // First close any other panels
            setShowNotesPanel(false);
            setShowSummarizationPanel(false);
            // Open notes viewing panel
            setShowViewNotesPanel(true);
            window.scrollBy({ top: 100, behavior: "smooth" });
        }
    };

    const handleToggleSummarization = () => {
        // Close other panels first
        setShowNotesPanel(false);
        setShowViewNotesPanel(false);
        // Open summarization panel
        setShowSummarizationPanel(true);
    };
    
    const handleCloseSummarization = () => {
        setShowSummarizationPanel(false);
    };

    const handleEditNote = (note) => {
        // Set the noteToEdit with the correct structure that matches what
        // we expect in NotesPanel
        setNoteToEdit(note);
        setShowViewNotesPanel(false);
        setShowNotesPanel(true);
    };

    const handleCloseNotes = () => {
        setShowNotesPanel(false);
        setNoteToEdit(null);
    };

    const handleCloseViewNotes = () => {
        setShowViewNotesPanel(false);
    };

    const handleNavigateToPage = (pageNumber) => {
        setPageNumber(pageNumber);
    };

    const handleNoteSaved = () => {
        // When a note is saved, refresh the notes view
        setShowNotesPanel(false);
        setNoteToEdit(null);
        
        // If coming from notes view, go back to it
        if (showViewNotesPanel || noteToEdit) {
            setShowViewNotesPanel(true);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Document Side Ribbon */}
            <DocumentSideRibbon
                onNavigate={handleNavigate} 
                onToggleSummarization={handleToggleSummarization} 
            />
            
            <div className="fixed top-12 left-12 z-50">
                <GoToLibraryButton />
            </div>

            {document && (
                <div className={`max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6 transition-all duration-300 ${mainContentClass}`}>
                    {/* Document Title */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        {document.title}
                    </h1>

                    {/* Document Viewer */}
                    <DocumentViewer
                        document={document}
                        pageNumber={pageNumber}
                        setPageNumber={setPageNumber}
                        numPages={numPages}
                        setNumPages={setNumPages}
                    />

                    {/* Controls Section */}
                    <div className="mt-6 space-y-4">
                        {/* Voice Selection Dropdown */}
                        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-4">
                            <label className="text-gray-700 font-medium">Select a Voice:</label>
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose a voice...</option>
                                {voices.map((voice) => (
                                    <option key={voice.voice_id} value={voice.voice_id}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Generate Audiobook Button */}
                        <button
                            onClick={generateAudiobook}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Generate Audiobook
                        </button>

                        {/* Playback Controls with speed */}
                        <PlaybackControls audioPath={audioPath} playbackSpeed={playbackSpeed} />
                    </div>

                    {/* Notes Panel */}
                    {showNotesPanel && (
                        <div className="mt-6">
                            <NotesPanel 
                                documentId={documentId} 
                                onClose={handleCloseNotes} 
                                noteToEdit={noteToEdit} 
                                onSave={handleNoteSaved}
                            />
                        </div>
                    )}

                    {/* View Notes Panel */}
                    {showViewNotesPanel && (
                        <div className="mt-6">
                            <Notes 
                                documentId={documentId} 
                                onEdit={handleEditNote}
                                onClose={handleCloseViewNotes}
                            />
                        </div>
                    )}

                    {/* Summarization Panel */}
                    {showSummarizationPanel && (
                        <SummarizationPanel
                            onSummarize={handleSummarize}
                            onGenerateKeywords={handleGenerateKeywords}
                            onWordMeaning={handleWordMeaning}
                            onClose={handleCloseSummarization}
                        />
                    )}
                </div>
            )}
            
            {/* Toast Container for notifications */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default DocumentReader;