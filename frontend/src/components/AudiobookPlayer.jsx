import ReactAudioPlayer from "react-audio-player";

const AudiobookPlayer = ({ audiobook }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">{audiobook.document_title}</h2>
            <ReactAudioPlayer
                src={`http://127.0.0.1:8000/${audiobook.file_path}`}
                controls
                autoPlay={false}
                className="w-full"
            />
        </div>
    );
};

export default AudiobookPlayer;