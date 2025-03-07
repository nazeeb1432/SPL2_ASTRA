import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSave } from "react-icons/fa";
import api from "../utils/api";

// Configure the PDF.js worker to use the local .mjs file
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const DocumentViewer = ({ document, pageNumber, setPageNumber, numPages, setNumPages }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [pdfDocument, setPdfDocument] = useState(null); // Use pdfDocument instead of pdfInstance
    const [pageTexts, setPageTexts] = useState({}); // Store text content per page

    // Function to update progress
    const updateProgress = async (pageNumber) => {
        console.log(`Sending request to update progress for document ID: ${document.document_id} with page number: ${pageNumber}`);
    
        // Ensure progress is an integer before sending
        const requestPayload = {
            progress: parseInt(pageNumber, 10)  // Force conversion to integer
        };
        console.log("Request payload:", requestPayload); // Log the payload before sending
    
        try {
            await api.put(`/documents/update-progress/${document.document_id}`, requestPayload);
            console.log("Progress saved!");
        } catch (error) {
            console.error("Error saving progress:", error.response?.data || error.message);
            // Log the full error response for more details
            if (error.response) {
                console.log("Full error response data:", error.response.data);  // Log entire error response
                console.log("Error response status:", error.response.status);
            }
        }
    };
    

    useEffect(() => {
        // On initial load, check if progress is 0, and set to 1
        if (document.progress === 0) {
            console.log("Initial document progress is 0, setting it to 1");
            updateProgress(1); // Set initial page as 1
        }
    }, [document]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= numPages) {
            setPageNumber(newPage);
            // Removed the automatic progress update here
        }
    };

    const onDocumentLoadSuccess = async (pdfDocument) => {
        setNumPages(pdfDocument.numPages);
        setPdfDocument(pdfDocument); // Set the pdfDocument state

        // Retrieve text content for each page
        const texts = {};
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" "); // Store all text as one string
            texts[i] = pageText;
        }
        setPageTexts(texts);
    };

    const handleSearch = () => {
        console.log("Search term:", searchTerm); // Debug log
        if (!searchTerm || !pdfDocument) {
            console.log("Search term is empty or PDF document is not available.");
            return;
        }

        const results = [];
        Object.entries(pageTexts).forEach(([pageNum, text]) => {
            console.log(`Searching in page ${pageNum}...`); // Debug log
            const matches = [];
            let index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
            while (index !== -1) {
                matches.push(index);
                index = text.toLowerCase().indexOf(searchTerm.toLowerCase(), index + 1);
            }
            if (matches.length > 0) {
                console.log(`Found ${matches.length} matches in page ${pageNum}:`, matches); // Debug log
                results.push({ pageNumber: parseInt(pageNum), matches });
            }
        });

        console.log("Search results:", results); // Debug log
        setSearchResults(results);
        setCurrentResultIndex(0);
        if (results.length > 0) {
            setPageNumber(results[0].pageNumber);
        } else {
            console.log("No matches found for the search term."); // Debug log
        }
    };

    const clearSearch = () => {
        console.log("Clearing search..."); // Debug log
        setSearchTerm("");
        setSearchResults([]);
        setCurrentResultIndex(0);
    };

    const navigateSearchResult = (direction) => {
        let newIndex;
        if (direction === "next") {
            newIndex = (currentResultIndex + 1) % searchResults.length;
        } else {
            newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
        }
        console.log(`Navigating to result index ${newIndex}...`); // Debug log
        setCurrentResultIndex(newIndex);
        setPageNumber(searchResults[newIndex].pageNumber);
    };

    const handleSaveProgress = () => {
        updateProgress(pageNumber);
    };

    return (
        <div>
            {/* Thin Ribbon-like Top Bar */}
            <div className="flex justify-between items-center bg-gray-100 p-2 rounded-t-lg border-b border-gray-200">
                {/* Search Input and Controls */}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        <FaSearch size={18} />
                    </button>
                    <button
                        onClick={clearSearch}
                        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        <FaTimes size={18} />
                    </button>
                    {searchResults.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => navigateSearchResult("prev")}
                                className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                                <FaChevronLeft size={18} />
                            </button>
                            <span className="text-gray-700">
                                {currentResultIndex + 1} of {searchResults.length}
                            </span>
                            <button
                                onClick={() => navigateSearchResult("next")}
                                className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                            >
                                <FaChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Page Navigation Controls (Right Side) */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => handlePageChange(pageNumber - 1)}
                        disabled={pageNumber <= 1}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 focus:outline-none"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <span className="text-gray-700">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pageNumber + 1)}
                        disabled={pageNumber >= numPages}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 focus:outline-none"
                    >
                        <FaChevronRight size={18} />
                    </button>
                    {/* Save Button */}
                    <button
                        onClick={handleSaveProgress}
                        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        <FaSave size={18} />
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="border border-gray-200 rounded-b-lg overflow-hidden shadow-sm" style={{ height: "750px", overflowY: "auto" }}>
                <Document
                    file={document.file_path}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error("Error loading PDF:", error)}
                    loading={<div className="text-center py-4">Loading PDF...</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        width={1000} // Set a fixed width for the PDF page
                    />
                </Document>
            </div>
        </div>
    );
};

export default DocumentViewer;