import { useState } from "react";
import { FaEdit, FaBook, FaMagic, FaInfoCircle } from "react-icons/fa";

const DocumentSideRibbon = ({ onNavigate, onToggleSummarization }) => {
  const [showTooltip, setShowTooltip] = useState(null);
  
  const handleMouseEnter = (tooltipId) => {
    setShowTooltip(tooltipId);
  };
  
  const handleMouseLeave = () => {
    setShowTooltip(null);
  };
  
  return (
    <div className="fixed left-44 top-[40vh] transform -translate-y-1/2 z-12 bg-white rounded-xl shadow-lg py-3 px-2">
      <div className="flex flex-col space-y-6">
        {/* Take Notes */}
        <div className="relative">
          <button 
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-all duration-300"
            onClick={() => onNavigate("notes")}
            onMouseEnter={() => handleMouseEnter("notes")}
            onMouseLeave={handleMouseLeave}
          >
            <FaEdit size={24} />
          </button>
          {showTooltip === "notes" && (
            <div className="absolute left-12 top-0 bg-gray-800 text-white px-3 py-1 rounded whitespace-nowrap">
              Take Notes
            </div>
          )}
        </div>
        
        {/* View Notes */}
        <div className="relative">
          <button 
            className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-100 rounded-full transition-all duration-300"
            onClick={() => onNavigate("view-notes")}
            onMouseEnter={() => handleMouseEnter("view-notes")}
            onMouseLeave={handleMouseLeave}
          >
            <FaBook size={24} />
          </button>
          {showTooltip === "view-notes" && (
            <div className="absolute left-12 top-0 bg-gray-800 text-white px-3 py-1 rounded whitespace-nowrap">
              View Notes
            </div>
          )}
        </div>
        
        {/* AI Summarization */}
        <div className="relative">
          <button 
            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-full transition-all duration-300"
            onClick={onToggleSummarization}
            onMouseEnter={() => handleMouseEnter("summarize")}
            onMouseLeave={handleMouseLeave}
          >
            <FaMagic size={24} />
          </button>
          {showTooltip === "summarize" && (
            <div className="absolute left-12 top-0 bg-gray-800 text-white px-3 py-1 rounded whitespace-nowrap">
              AI Enhancements
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentSideRibbon;