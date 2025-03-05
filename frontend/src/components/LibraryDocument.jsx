import React from "react";
import { Link } from "react-router-dom";

const LibraryDocument = ({ document, handleDeleteDocument }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-100">
      <h3 className="font-semibold text-lg truncate mb-2">{document.title}</h3>
      <p className="text-sm text-gray-500 truncate mb-4">{document.file_path}</p>
      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/document/${document.document_id}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          View
        </Link>
        <button
          onClick={() => handleDeleteDocument(document.document_id)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default LibraryDocument;