// import { useParams } from "react-router-dom";
// import { useState, useEffect } from "react";
// import api from "../utils/api";

// const DocumentReader = () => {
//     const { documentId } = useParams();
//     const [document, setDocument] = useState(null);

//     useEffect(() => {
//         const fetchDocument = async () => {
//             try {
//                 console.log(`📄 Fetching document with ID: ${documentId}`);
//                 const response = await api.get(`/documents/view/${documentId}`);
//                 console.log("✅ Document Fetched:", response.data);
//                 setDocument(response.data);
//             } catch (error) {
//                 console.error("❌ Error fetching document:", error);
//             }
//         };

//         fetchDocument();
//     }, [documentId]);

//     return (
//         <div className="p-6">
//             {document ? (
//                 <>
//                     <h1 className="text-2xl font-bold">{document.title}</h1>
//                     <iframe 
//                         src={document.file_path}  
//                         className="w-full h-screen"
//                     ></iframe>
//                 </>
//             ) : (
//                 <p>Loading document...</p>
//             )}
//         </div>
//     );
// };

// export default DocumentReader;

import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";
import PlaybackControls from "../components/PlaybackControls";
import { useAuthContext } from "../context/AuthContext";

const DocumentReader = () => {
    const { documentId } = useParams();
    const [document, setDocument] = useState(null);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState("");
    const [audioPath, setAudioPath] = useState("");
    const {email} = useAuthContext();

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                console.log(`Fetching document with ID: ${documentId}`);
                const response = await api.get(`/documents/view/${documentId}`);
                console.log("Document Fetched:", response.data);
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
            console.log(response.data);
            const audioFilePath = response.data.file_path; // Fetch audio path from response
            setAudioPath(audioFilePath);
            alert("Audiobook generation started!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Audiobook generation failed");
        }
        
    };

    return (
        <div className="p-6">
            {document && (
                <>
                    <h1 className="text-2xl font-bold">{document.title}</h1>
                    <iframe src={document.file_path} className="w-full h-screen"></iframe>
                    <div className="mt-4">
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                        >
                            <option value="">Select a Voice</option>
                            {voices.map((voice) => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                        {/* <button className="bg-red-500 text-white " onClick={generateAudiobook}>Generate Audiobook</button> */}
                        <button type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-3 me-2 mb-2 ml-1 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                         onClick={generateAudiobook}>Generate Audiobook</button>
                        <PlaybackControls audioPath={audioPath} />
                    </div>
                </>
            )}
           
        </div>
    );
};

export default DocumentReader;

