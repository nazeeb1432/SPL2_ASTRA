const AudiobookRow = ({ audiobook, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            <h2 className="text-xl font-semibold text-gray-800">{audiobook.document_title}</h2>
            <p className="text-sm text-gray-600">Voice ID: {audiobook.voice_id}</p>
        </div>
    );
};

export default AudiobookRow;