import { useEffect, useState } from "react";
import api from "../utils/api";
import AudiobookRow from "../components/AudiobookRow";
import AudiobookPlayer from "../components/AudiobookPlayer";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";
import GoToLibraryButton from "../components/GoToLibraryButton";
import { FaHeadphones, FaMusic, FaPlayCircle } from "react-icons/fa"; // Import icons

const AudiobookPage = () => {
    const [audiobooks, setAudiobooks] = useState([]);
    const [selectedAudiobook, setSelectedAudiobook] = useState(null);
    const { email: contextEmail } = useAuthContext();
    const email = contextEmail || Cookies.get("email");

    useEffect(() => {
        const fetchAudiobooks = async () => {
            try {
                const response = await api.get(`/audiobooks/user/${email}`);
                setAudiobooks(response.data.audiobooks);
            } catch (error) {
                console.error("Error fetching audiobooks:", error);
            }
        };

        fetchAudiobooks();
    }, [email]);

    const handleRowClick = (audiobook) => {
        setSelectedAudiobook(audiobook);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Smooth scroll to the top
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
            {/* Header with flex container */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-purple-700 flex items-center">
                    <FaHeadphones className="mr-3" /> Your Audiobooks
                </h1>
                <GoToLibraryButton />
            </div>

            {/* Audiobook Player */}
            {selectedAudiobook && (
                <div className="mb-16 p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-2xl text-white transform transition-all duration-500 hover:scale-105">
                    <AudiobookPlayer audiobook={selectedAudiobook} />
                </div>
            )}

            {/* Audiobook List */}
            <div className="space-y-4">
                {audiobooks.map((audiobook) => (
                    <div
                        key={audiobook.audiobook_id}
                        onClick={() => handleRowClick(audiobook)}
                        className={`p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out ${
                            selectedAudiobook?.audiobook_id === audiobook.audiobook_id
                                ? "bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300"
                                : "bg-white hover:bg-purple-50"
                        }`}
                    >
                        <div className="flex items-center space-x-4">
                            <FaMusic className="text-purple-600 text-2xl" />
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {audiobook.document_title}
                                </h2>
                                <p className="text-sm text-gray-600">Voice ID: {audiobook.voice_id}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AudiobookPage;
