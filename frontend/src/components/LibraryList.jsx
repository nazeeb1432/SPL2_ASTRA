import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";  // Import AuthContext

const LibraryList = () => {
    const { email } = useAuthContext();  // Fetch userEmail from context
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (!email) {
            console.error("❌ userEmail is undefined in LibraryList.jsx");
            return;
        }

        const fetchDocuments = async () => {
            try {
                console.log(`📤 Fetching documents for user: ${email}`);
                const response = await api.get(`/documents/${email}`);
                console.log("✅ Documents Fetched:", response.data);
                setDocuments(response.data.documents);
            } catch (error) {
                console.error("❌ Error fetching documents:", error);
            }
        };

        fetchDocuments();
    }, [email]);

    return (
        <div className="space-y-3">
            {documents.length ? (
                documents.map((doc) => (
                    <div key={doc.document_id} className="p-4 bg-white border rounded-md">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.file_path}</p>
                        <Link to={`/document/${doc.document_id}`} className="text-blue-500">Read</Link>
                    </div>
                ))
            ) : (
                <p className="text-gray-600">No documents uploaded yet.</p>
            )}
        </div>
    );
};

export default LibraryList;
