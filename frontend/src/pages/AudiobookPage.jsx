import { useEffect, useState } from "react";
import api from "../utils/api";
import AudiobookRow from "../components/AudiobookRow";
import AudiobookPlayer from "../components/AudiobookPlayer";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";
import GoToLibraryButton from "../components/GoToLibraryButton"; // Import the button component


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
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header with flex container */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-extrabold text-purple-700">Your Audiobooks</h1>
                <GoToLibraryButton /> 
            </div>
            
            
            {/* Audiobook Player */}
            {selectedAudiobook && (
                <div className="mb-16 p-6 bg-white rounded-lg shadow-2xl border border-gray-200">
                    <AudiobookPlayer audiobook={selectedAudiobook} />
                </div>
            )}

            {/* Audiobook List */}
            <div className="space-y-4">
                {audiobooks.map((audiobook) => (
                    <AudiobookRow
                        key={audiobook.audiobook_id}
                        audiobook={audiobook}
                        onClick={() => handleRowClick(audiobook)}
                        className="hover:bg-purple-100 transition duration-300 ease-in-out p-4 rounded-lg shadow-md bg-white"
                    />
                ))}
            </div>
        </div>
    );
};

export default AudiobookPage;
