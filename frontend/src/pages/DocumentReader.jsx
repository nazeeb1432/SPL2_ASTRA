import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/api";

const DocumentReader = () => {
    const { documentId } = useParams();
    const [document, setDocument] = useState(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                console.log(`📄 Fetching document with ID: ${documentId}`);
                const response = await api.get(`/documents/view/${documentId}`);
                console.log("Document Fetched:", response.data);
                setDocument(response.data);
            } catch (error) {
                console.error("Error fetching document:", error);
            }
        };

        fetchDocument();
    }, [documentId]);

    return (
        <div className="p-6">
            {document ? (
                <>
                    <h1 className="text-2xl font-bold">{document.title}</h1>
                    <iframe 
                        src={document.file_path}  
                        className="w-full h-screen"
                    ></iframe>
                </>
            ) : (
                <p>Loading document...</p>
            )}
        </div>
    );
};

export default DocumentReader;
