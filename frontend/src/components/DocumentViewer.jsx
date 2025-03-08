import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSave, FaBookmark } from "react-icons/fa";
import api from "../utils/api";
import BookmarkPanel from "./BookmarkPanel";

// Configure the PDF.js worker to use the local .mjs file
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const DocumentViewer = ({ document: docData, pageNumber, setPageNumber, numPages, setNumPages }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [pdfDocument, setPdfDocument] = useState(null);
    const [pageTexts, setPageTexts] = useState({});
    const [saveStatus, setSaveStatus] = useState(null);
    const textLayerRef = useRef(null);
    const [selectedText, setSelectedText] = useState("");
    const [showAddBookmark, setShowAddBookmark] = useState(false);
    const [showBookmarkHighlight, setShowBookmarkHighlight] = useState(null);
    const [showBookmarkPanel, setShowBookmarkPanel] = useState(false);
    const [bookmarkTooltip, setBookmarkTooltip] = useState(false);
    const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });

    // Function to update progress
    const updateProgress = async (pageNumber) => {
        console.log(`Sending request to update progress for document ID: ${docData.document_id} with page number: ${pageNumber}`);
    
        // Ensure progress is an integer before sending
        const requestPayload = {
            progress: parseInt(pageNumber, 10)  // Force conversion to integer
        };
        console.log("Request payload:", requestPayload);
    
        try {
            await api.put(`/documents/update-progress/${docData.document_id}`, requestPayload);
            console.log("Progress saved!");
        } catch (error) {
            console.error("Error saving progress:", error.response?.data || error.message);
            // Log the full error response for more details
            if (error.response) {
                console.log("Full error response data:", error.response.data);
                console.log("Error response status:", error.response.status);
            }
        }
    };
    
    useEffect(() => {
        // On initial load, check if progress is 0, and set to 1
        if (docData.progress === 0) {
            console.log("Initial document progress is 0, setting it to 1");
            updateProgress(1); // Set initial page as 1
        }
    }, [docData]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= numPages) {
            setPageNumber(newPage);
            // Don't clear bookmark highlights when changing pages intentionally via navigation
            // Only clear when using the prev/next buttons
            if (!showBookmarkHighlight) {
                setShowBookmarkHighlight(null);
            }
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

    // Handle text selection for bookmark creation
    const handleTextSelection = useCallback(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            setSelectedText(selection.toString().trim());
            
            // Get selection position for better bookmark button placement
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Calculate a better position for the bookmark button
            const x = Math.min(rect.left + (rect.width / 2) - 75, window.innerWidth - 170);
            const y = rect.top - 50; // Position above the selection
            
            setSelectionPosition({ x: Math.max(10, x), y: Math.max(10, y) });
            setShowAddBookmark(true);
            
            // Show tooltip instructions for first-time users
            setBookmarkTooltip(true);
            // Hide tooltip after 4 seconds
            setTimeout(() => {
                setBookmarkTooltip(false);
            }, 4000);
        } else {
            setSelectedText("");
            setShowAddBookmark(false);
        }
    }, []);

    // Add listeners for text selection
    useEffect(() => {
        document.addEventListener('mouseup', handleTextSelection);
        return () => {
            document.removeEventListener('mouseup', handleTextSelection);
        };
    }, [handleTextSelection]);

    // Create a bookmark with the selected text
    const createBookmark = async () => {
        if (!selectedText || !docData.document_id) return;

        try {
            await api.post('/api/bookmarks/', {
                document_id: docData.document_id,
                page_number: pageNumber,
                description: selectedText
            });
            
            // Clear selection and hide add bookmark button
            setSelectedText("");
            setShowAddBookmark(false);
            
            // Show success feedback
            setSaveStatus("bookmark-added");
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
            
        } catch (error) {
            console.error("Error creating bookmark:", error);
            setSaveStatus("bookmark-error");
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        }
    };

    // Apply highlighting to the text layer after rendering
    useEffect(() => {
        if (textLayerRef.current) {
            // Wait for the text layer to be fully rendered
            const applyHighlights = () => {
                if (searchTerm && searchResults.length > 0) {
                    highlightTextLayer(searchTerm, "search-highlight");
                }
                
                if (showBookmarkHighlight) {
                    highlightTextLayer(showBookmarkHighlight, "bookmark-highlight");
                }
            };
            
            // Use a short delay to ensure the text layer is ready
            const timeoutId = setTimeout(applyHighlights, 200);
            return () => clearTimeout(timeoutId);
        }
    }, [pageNumber, searchResults, currentResultIndex, searchTerm, showBookmarkHighlight]);

    const highlightTextLayer = (textToHighlight, highlightClass) => {
        if (!textLayerRef.current) return;
        
        console.log(`Attempting to highlight: "${textToHighlight}" with class: ${highlightClass}`);
        
        // Get the text layer element
        const textLayerElement = textLayerRef.current.querySelector(".react-pdf__Page__textContent");
        if (!textLayerElement) {
            console.log("Text layer element not found");
            return;
        }

        // Remove any previous highlights of this class
        const existingHighlights = textLayerElement.querySelectorAll(`.${highlightClass}`);
        existingHighlights.forEach((highlight) => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize(); // Normalize to merge adjacent text nodes
        });

        if (!textToHighlight) return;

        // Apply highlighting by wrapping the text with highlight span elements
        const textNodes = getTextNodesIn(textLayerElement);
        
        const textToHighlightLower = textToHighlight.toLowerCase();
        let foundMatch = false;
        
        textNodes.forEach((node) => {
            const nodeText = node.textContent;
            const nodeTextLower = nodeText.toLowerCase();
            
            let lastIndex = 0;
            let index = nodeTextLower.indexOf(textToHighlightLower, lastIndex);
            
            if (index === -1) return;
            
            foundMatch = true;
            // Create a document fragment to hold the new content
            const fragment = document.createDocumentFragment();
            
            while (index !== -1) {
                // Add text before the match
                fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex, index)));
                
                // Add the highlighted match
                const highlightSpan = document.createElement("span");
                highlightSpan.className = highlightClass;
                if (highlightClass === "search-highlight") {
                    highlightSpan.style.backgroundColor = "yellow";
                } else if (highlightClass === "bookmark-highlight") {
                    highlightSpan.style.backgroundColor = "#a7f3d0"; // Light green for bookmarks
                }
                highlightSpan.style.color = "black";
                highlightSpan.textContent = nodeText.substring(index, index + textToHighlight.length);
                fragment.appendChild(highlightSpan);
                
                // Update lastIndex to after the match
                lastIndex = index + textToHighlight.length;
                
                // Find the next match
                index = nodeTextLower.indexOf(textToHighlightLower, lastIndex);
            }
            
            // Add any remaining text
            if (lastIndex < nodeText.length) {
                fragment.appendChild(document.createTextNode(nodeText.substring(lastIndex)));
            }
            
            // Replace the original node with the fragment
            node.parentNode.replaceChild(fragment, node);
        });
        
        if (!foundMatch) {
            console.log(`No matches found for "${textToHighlight}"`);
        } else {
            console.log(`Successfully highlighted "${textToHighlight}"`);
        }
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

    // Save the current page as progress
    const saveProgress = async () => {
        if (!docData || !docData.document_id) {
            console.error("Document data is missing or invalid");
            setSaveStatus("error");
            return;
        }

        try {
            await api.put(
                `/documents/update-progress/${docData.document_id}`,
                { progress: pageNumber }
            );

            console.log("Progress saved successfully");
            setSaveStatus("success");
            
            // Clear the success message after 3 seconds
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        } catch (error) {
            console.error("Error saving progress:", error);
            setSaveStatus("error");
            
            // Clear the error message after 3 seconds
            setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        }
    };

    // Navigate to and highlight a bookmark
    const navigateToBookmark = (bookmark) => {
        // First set the bookmark text to highlight
        setShowBookmarkHighlight(bookmark.description);
        console.log(`Navigating to bookmark: Page ${bookmark.page_number}, Text: "${bookmark.description}"`);
        
        // Then change the page
        setPageNumber(bookmark.page_number);
        
        // Close the bookmark panel after navigation
        setShowBookmarkPanel(false);
    };

    // Toggle bookmark panel
    const toggleBookmarkPanel = () => {
        setShowBookmarkPanel(!showBookmarkPanel);
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
            .bookmark-highlight {
                background-color: #a7f3d0 !important;
                color: black !important;
                border-radius: 3px;
                padding: 0 1px;
                margin: 0 1px;
            }
            .bookmark-button {
                position: fixed;
                z-index: 100;
                background-color: #3b82f6;
                color: white;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 14px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .bookmark-button:hover {
                background-color: #2563eb;
            }
            .bookmark-tooltip {
                position: fixed;
                z-index: 110;
                background-color: #1e293b;
                color: white;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 14px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                top: calc(100% + 10px);
                left: 0;
                width: 220px;
                animation: fadeIn 0.3s;
            }
            .bookmark-tooltip:after {
                content: '';
                position: absolute;
                top: -8px;
                left: 12px;
                border-width: 0 8px 8px 8px;
                border-style: solid;
                border-color: transparent transparent #1e293b transparent;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
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
            <div className="flex flex-wrap justify-between items-center bg-gray-100 p-2 rounded-t-lg border-b border-gray-200">
                {/* Search Input and Controls */}
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
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
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Bookmarks Button - Updated to match search button style */}
                    <button
                        onClick={toggleBookmarkPanel}
                        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                        title="View bookmarks"
                    >
                        <FaBookmark size={18} />
                    </button>
                    
                    <button
                        onClick={() => {
                            setShowBookmarkHighlight(null); // Clear highlight when navigating with buttons
                            handlePageChange(pageNumber - 1);
                        }}
                        disabled={pageNumber <= 1}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 focus:outline-none"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <span className="text-gray-700 whitespace-nowrap">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => {
                            setShowBookmarkHighlight(null); // Clear highlight when navigating with buttons
                            handlePageChange(pageNumber + 1);
                        }}
                        disabled={pageNumber >= numPages}
                        className="p-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300 focus:outline-none"
                    >
                        <FaChevronRight size={18} />
                    </button>
                    
                    {/* Save Progress Button */}
                    <button
                        onClick={saveProgress}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                    >
                        <FaSave size={16} />
                        <span className="hidden sm:inline">Save Progress</span>
                    </button>
                    
                    {/* Save Status Feedback */}
                    {saveStatus === "success" && (
                        <span className="text-green-600 text-sm whitespace-nowrap">
                            Progress saved!
                        </span>
                    )}
                    {saveStatus === "error" && (
                        <span className="text-red-600 text-sm whitespace-nowrap">
                            Failed to save
                        </span>
                    )}
                    {saveStatus === "bookmark-added" && (
                        <span className="text-green-600 text-sm whitespace-nowrap">
                            Bookmark added!
                        </span>
                    )}
                    {saveStatus === "bookmark-error" && (
                        <span className="text-red-600 text-sm whitespace-nowrap">
                            Failed to add bookmark
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Area with PDF and Bookmark Panel */}
            <div className="flex relative">
                {/* PDF Viewer */}
                <div 
                    className="border border-gray-200 rounded-b-lg overflow-hidden shadow-sm flex-grow"
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
                            onRenderSuccess={() => {
                                // Add a delay to ensure text layer is fully rendered
                                setTimeout(() => {
                                    if (searchTerm && searchResults.length > 0) {
                                        highlightTextLayer(searchTerm, "search-highlight");
                                    }
                                    
                                    if (showBookmarkHighlight) {
                                        highlightTextLayer(showBookmarkHighlight, "bookmark-highlight");
                                    }
                                }, 200);
                            }}
                        />
                    </Document>
                </div>

                {/* Bookmark Panel */}
                {showBookmarkPanel && (
                    <div className="border border-gray-200 border-l-0 rounded-r-lg bg-white w-80 shadow-sm flex-shrink-0">
                        <BookmarkPanel 
                            documentId={docData.document_id} 
                            onBookmarkClick={navigateToBookmark} 
                            onClose={() => setShowBookmarkPanel(false)} 
                        />
                    </div>
                )}
            </div>

            {/* Floating Add Bookmark Button with Tooltip - Updated positioning */}
            {showAddBookmark && (
                <div className="fixed" style={{ 
                    top: `${selectionPosition.y}px`,
                    left: `${selectionPosition.x}px`,
                    zIndex: 100
                }}>
                    <button 
                        className="bookmark-button"
                        onClick={createBookmark}
                    >
                        <FaBookmark />
                        <span>Add Bookmark</span>
                    </button>
                    
                    {bookmarkTooltip && (
                        <div className="bookmark-tooltip">
                            Highlight text to create a bookmark. Your bookmarks help you find important points later.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentViewer;