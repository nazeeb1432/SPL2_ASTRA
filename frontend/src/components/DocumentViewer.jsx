import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSave } from "react-icons/fa";
import api from "../utils/api";

// Configure the PDF.js worker to use the local .mjs file
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const DocumentViewer = ({ document: docData, pageNumber, setPageNumber, numPages, setNumPages }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [pdfDocument, setPdfDocument] = useState(null);
    const [pageTexts, setPageTexts] = useState({});
    const textLayerRef = useRef(null);

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
        setPdfDocument(pdfDocument);

        // Retrieve text content for each page
        const texts = {};
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            texts[i] = pageText;
        }
        setPageTexts(texts);
    };

    // Apply highlighting to the text layer after rendering
    useEffect(() => {
        if (searchTerm && searchResults.length > 0) {
            setTimeout(() => {
                highlightTextLayer();
            }, 100); // Short delay to ensure text layer is rendered
        }
    }, [pageNumber, searchResults, currentResultIndex, searchTerm]);

    const highlightTextLayer = () => {
        if (!textLayerRef.current) return;
        
        // Get the text layer element
        const textLayerElement = textLayerRef.current.querySelector(".react-pdf__Page__textContent");
        if (!textLayerElement) return;

        // Remove any previous highlights
        const existingHighlights = textLayerElement.querySelectorAll(".search-highlight");
        existingHighlights.forEach((highlight) => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize(); // Normalize to merge adjacent text nodes
        });

        if (!searchTerm) return;

        // Get the current page's search result
        const currentPageResult = searchResults.find(r => r.pageNumber === pageNumber);
        if (!currentPageResult) return;

        // Apply highlighting by wrapping the text with highlight span elements
        const textNodes = getTextNodesIn(textLayerElement);
        
        const searchTermLower = searchTerm.toLowerCase();
        textNodes.forEach((node) => {
            const nodeText = node.textContent;
            const nodeTextLower = nodeText.toLowerCase();
            
            let lastIndex = 0;
            let index = nodeTextLower.indexOf(searchTermLower, lastIndex);
            
            if (index === -1) return;
            
            // Create a document fragment to hold the new content
            const fragment = document.createDocumentFragment();
            
            while (index !== -1) {
                // Add text before the match
                fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex, index)));
                
                // Add the highlighted match
                const highlightSpan = document.createElement("span");
                highlightSpan.className = "search-highlight";
                highlightSpan.style.backgroundColor = "yellow";
                highlightSpan.style.color = "black";
                highlightSpan.textContent = nodeText.substring(index, index + searchTerm.length);
                fragment.appendChild(highlightSpan);
                
                // Update lastIndex to after the match
                lastIndex = index + searchTerm.length;
                
                // Find the next match
                index = nodeTextLower.indexOf(searchTermLower, lastIndex);
            }
            
            // Add any remaining text
            if (lastIndex < nodeText.length) {
                fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex)));
            }
            
            // Replace the original node with the fragment
            node.parentNode.replaceChild(fragment, node);
        });
    };

    // Helper function to get all text nodes within an element
    const getTextNodesIn = (element) => {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    };

    const handleSearch = () => {
        console.log("Search term:", searchTerm);
        if (!searchTerm || !pdfDocument) {
            console.log("Search term is empty or PDF document is not available.");
            return;
        }

        const results = [];
        Object.entries(pageTexts).forEach(([pageNum, text]) => {
            console.log(`Searching in page ${pageNum}...`);
            const matches = [];
            let index = text.toLowerCase().indexOf(searchTerm.toLowerCase());
            while (index !== -1) {
                matches.push(index);
                index = text.toLowerCase().indexOf(searchTerm.toLowerCase(), index + 1);
            }
            if (matches.length > 0) {
                console.log(`Found ${matches.length} matches in page ${pageNum}:`, matches);
                results.push({ pageNumber: parseInt(pageNum), matches });
            }
        });

        console.log("Search results:", results);
        setSearchResults(results);
        setCurrentResultIndex(0);
        if (results.length > 0) {
            setPageNumber(results[0].pageNumber);
        } else {
            console.log("No matches found for the search term.");
        }
    };

    const clearSearch = () => {
        console.log("Clearing search...");
        setSearchTerm("");
        setSearchResults([]);
        setCurrentResultIndex(0);
        
        // Remove any existing highlights
        if (textLayerRef.current) {
            const textLayerElement = textLayerRef.current.querySelector(".react-pdf__Page__textContent");
            if (textLayerElement) {
                const existingHighlights = textLayerElement.querySelectorAll(".search-highlight");
                existingHighlights.forEach((highlight) => {
                    const parent = highlight.parentNode;
                    parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                    parent.normalize();
                });
            }
        }
    };

    const navigateSearchResult = (direction) => {
        if (searchResults.length === 0) return;
        
        let newIndex;
        if (direction === "next") {
            newIndex = (currentResultIndex + 1) % searchResults.length;
        } else {
            newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
        }
        console.log(`Navigating to result index ${newIndex}...`);
        setCurrentResultIndex(newIndex);
        setPageNumber(searchResults[newIndex].pageNumber);
    };

    // Add CSS for the text layer container
    useEffect(() => {
        // Add custom CSS to the document head for highlighting
        const style = document.createElement('style');
        style.textContent = `
            .search-highlight {
                background-color: yellow !important;
                color: black !important;
                border-radius: 3px;
                padding: 0 1px;
                margin: 0 1px;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
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
            <div 
                className="border border-gray-200 rounded-b-lg overflow-hidden shadow-sm" 
                style={{ height: "750px", overflowY: "auto" }}
                ref={textLayerRef}
            >
                <Document
                    file={docData?.file_path}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error("Error loading PDF:", error)}
                    loading={<div className="text-center py-4">Loading PDF...</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        width={1000}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        onRenderSuccess={highlightTextLayer}
                    />
                </Document>
            </div>
        </div>
    );
};

export default DocumentViewer;

