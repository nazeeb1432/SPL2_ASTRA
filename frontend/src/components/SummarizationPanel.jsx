import { useState } from "react";
import api from "../utils/api";

const SummarizationPanel = ({ onSummarize, onGenerateKeywords }) => {
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        setIsLoading(true);
        try {
            const response = await onSummarize(inputText);
            setOutputText(response);
        } catch (error) {
            console.error("Error summarizing text:", error);
            setOutputText("Failed to generate summary. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateKeywords = async () => {
        setIsLoading(true);
        try {
            const response = await onGenerateKeywords(inputText);
            setOutputText(response);
        } catch (error) {
            console.error("Error generating keywords:", error);
            setOutputText("Failed to generate keywords. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Summarization & Keywords</h2>
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to summarize or generate keywords..."
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                rows={6}
            />
            <div className="flex space-x-4 mb-4">
                <button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isLoading ? "Summarizing..." : "Summarize"}
                </button>
                <button
                    onClick={handleGenerateKeywords}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300"
                >
                    {isLoading ? "Generating..." : "Generate Keywords"}
                </button>
            </div>
            <textarea
                value={outputText}
                readOnly
                placeholder="Summary or keywords will appear here..."
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={6}
            />
        </div>
    );
};

export default SummarizationPanel;