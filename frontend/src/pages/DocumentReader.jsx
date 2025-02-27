import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import PlaybackControls from "../components/PlaybackControls";
import { useAuthContext } from "../context/AuthContext";
import SummarizationPanel from "../components/SummarizationPanel";

const DocumentReader = () => {
    const { documentId } = useParams();
    const [document, setDocument] = useState(null);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState("");
    const [audioPath, setAudioPath] = useState("");
    const { email } = useAuthContext();
    const [showSummarizationPanel, setShowSummarizationPanel] = useState(false);


    useEffect(() => {
        const fetchDocument = async () => {
            try {
                console.log(`Fetching document with ID: ${documentId}`);
                const response = await api.get(`/documents/view/${documentId}`);
                console.log("Document Fetched:", response.data);
                setDocument(response.data);
                setPdfDocument(response.data.file_path);
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
            console.log(response.data);
            const audioFilePath = response.data.file_path; // Fetch audio path from response
            setAudioPath(audioFilePath);
            alert("Audiobook generation started!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Audiobook generation failed");
        }
    };

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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {document && (
                <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
                    {/* Document Title */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                        {document.title}
                    </h1>

                    {/* PDF Viewer */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio Container */}
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
                            type="button"
                            onClick={generateAudiobook}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Generate Audiobook
                        </button>

                        {/* Summarization Button */}
                        <button
                            type="button"
                            onClick={() => setShowSummarizationPanel(!showSummarizationPanel)}
                            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            {showSummarizationPanel ? "Hide Summarization" : "Show Summarization"}
                        </button>

                        <PlaybackControls audioPath={audioPath} />
                    </div>
                </div>
            )}

            {/* Summarization Panel */}
            {showSummarizationPanel && (
                <SummarizationPanel
                    onSummarize={handleSummarize}
                    onGenerateKeywords={handleGenerateKeywords}
                />
            )}
        </div>
    );
};

export default DocumentReader;