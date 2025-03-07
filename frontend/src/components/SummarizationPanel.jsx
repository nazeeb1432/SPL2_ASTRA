import { useState } from "react";
import api from "../utils/api";
import { FaMagic, FaKey, FaBook, FaSync } from "react-icons/fa"; // Import icons

const SummarizationPanel = ({ onSummarize, onGenerateKeywords, onWordMeaning }) => {
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

    const handleWordMeaning = async () => {
        setIsLoading(true);
        try {
            const response = await onWordMeaning(inputText);
            setOutputText(response);
        } catch (error) {
            console.error("Error fetching word meaning:", error);
            setOutputText("Failed to fetch word meaning. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        setInputText("");
        setOutputText("");
    };

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl p-6 overflow-y-auto">
            {/* Panel Header with Refresh Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800 flex items-center">
                    <FaMagic className="mr-2" /> Summarization & Keywords
                </h2>
                <button
                    onClick={handleRefresh}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                >
                    <FaSync />
                </button>
            </div>

            {/* Input Text Area */}
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to summarize, generate keywords, or find word meaning..."
                className="w-full p-3 border border-purple-200 rounded-lg mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                rows={12}
            />

            {/* Action Buttons - Stacked Vertically */}
            <div className="flex flex-col space-y-4 mb-6">
                <button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-all duration-300"
                >
                    <FaMagic className="mr-2" />
                    {isLoading ? "Summarizing..." : "Summarize"}
                </button>
                <button
                    onClick={handleGenerateKeywords}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-300"
                >
                    <FaKey className="mr-2" />
                    {isLoading ? "Generating..." : "Keywords"}
                </button>
                <button
                    onClick={handleWordMeaning}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-all duration-300"
                >
                    <FaBook className="mr-2" />
                    {isLoading ? "Fetching..." : "Word Meaning"}
                </button>
            </div>

            {/* Output Text Area */}
            <textarea
                value={outputText}
                readOnly
                placeholder="Summary, keywords, or word meaning will appear here..."
                className="w-full p-3 border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                rows={10} // Increased height for better visibility
            />
        </div>
    );
};

export default SummarizationPanel;


