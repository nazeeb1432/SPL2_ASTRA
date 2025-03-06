import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import PlaybackControls from "../components/PlaybackControls";
import { useAuthContext } from "../context/AuthContext";
import SummarizationPanel from "../components/SummarizationPanel";
import NotesPanel from "../components/NotesPanel";
import BookmarkPanel from "../components/BookmarkPanel";
import HamburgerMenu from "../components/HamburgerMenu";
import Cookies from "js-cookie";
import GoToLibraryButton from "../components/GoToLibraryButton";

const DocumentReader = () => {
    const { documentId } = useParams();
    const [document, setDocument] = useState(null);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState("");
    const [audioPath, setAudioPath] = useState("");

    const { email: contextEmail } = useAuthContext();
    const email=contextEmail || Cookies.get("email"); 

    const [showSummarizationPanel, setShowSummarizationPanel] = useState(false);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await api.get(`/documents/view/${documentId}`);
                setDocument(response.data);
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        const fetchVoices = async () => {
            const response = await api.get("/audiobooks/voices");
            setVoices(response.data.voices);
        };

        fetchDocument();
        fetchVoices();
    }, [documentId]);

    const generateAudiobook = async () => {
        if (!selectedVoice) return alert("Please select a voice!");
        try {
            const response = await api.post(`/audiobooks/generate/${documentId}`, {
                voice_id: selectedVoice,
                user_id: email,
            });
            setAudioPath(response.data.file_path);
            alert("Audiobook generation started!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Audiobook generation failed");
        }
    };

    // useEffect to trigger the audio player reload when audioPath changes
    useEffect(() => {
        if (audioPath) {
            console.log("Audio Path Updated:", audioPath);
            // Any additional logic to reload the player can be added here
        }
    }, [audioPath]);

    const onDocumentLoadSuccess = ({ numPages }) => {
                setNumPages(numPages); // Save the total number of pages of the PDF
    };
        
    const handleSummarize = async (text) => {
        const response = await api.post("api/summarize", { text });
        return response.data.summary;
    };
        
    const handleGenerateKeywords = async (text) => {
        const response = await api.post("api/generate-keywords", { text });
        return response.data.keywords;
    };


    const handleNavigate = (section) => {
        if (section === "audiobooks") {
            window.location.href = "/audiobooks"; // Navigate to the Audiobook Page
        } else if (section === "notes") {
            setShowNotesPanel(true);
            setShowBookmarkPanel(false);
            setShowSummarizationPanel(false);
            // Scroll down by 800 pixels to show the NotesPanel
            window.scrollBy({ top: 1000, behavior: "smooth" });
        } else if (section === "bookmarks") {
            setShowBookmarkPanel(true);
            setShowNotesPanel(false);
            setShowSummarizationPanel(false);
            // Scroll down by 800 pixels to show the BookmarkPanel
            window.scrollBy({ top: 1200, behavior: "smooth" });
        } else if (section === "audiobook") {
            // Scroll down by 1000 pixels to show the Generate Audiobook button
            window.scrollBy({ top: 800, behavior: "smooth" });
        } else if (section === "summarization") {
            // Scroll down by 1200 pixels to show the Summarization button
            window.scrollBy({ top: 800, behavior: "smooth" });
        }
    };

    const handleNavigateToPage = (pageNumber) => {
        const iframe = document.querySelector("iframe");
        if (iframe) {
            iframe.contentWindow.postMessage({ type: "navigate", page: pageNumber }, "*");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Hamburger Menu */}
            <HamburgerMenu onNavigate={handleNavigate} />
            <div className="ml-20">
            <GoToLibraryButton />
            </div>

            {document && (
                <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
                    {/* Document Title */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        {document.title}
                    </h1>

                    {/* PDF Viewer */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="relative pt-[56.25%]">
                            <iframe
                                src={document.file_path}
                                className="absolute top-0 left-0 w-full h-full"
                                title="PDF Viewer"
                            ></iframe>
                        </div>
                    </div>

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

                        {/* Summarization Button */}
                        <button
                            onClick={() => setShowSummarizationPanel(!showSummarizationPanel)}
                            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            {showSummarizationPanel ? "Hide Summarization" : "Show Summarization"}
                        </button>

                        <PlaybackControls audioPath={audioPath} />
                    </div>

                    {/* Notes Panel */}
                    {showNotesPanel && <NotesPanel documentId={documentId} />}

                    {/* Bookmark Panel */}
                    {showBookmarkPanel && (
                        <BookmarkPanel
                            documentId={documentId}
                            onNavigate={handleNavigateToPage}
                        />
                    )}

                    {/* Summarization Panel */}
                    {showSummarizationPanel && (
                        <SummarizationPanel
                            onSummarize={handleSummarize}
                            onGenerateKeywords={handleGenerateKeywords}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentReader;