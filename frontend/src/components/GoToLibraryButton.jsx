import React from "react";
import { useNavigate } from "react-router-dom";

const GoToLibraryButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/library"); // Navigate to the library page
    };

    return (
        <button
            onClick={handleClick}
            className="bg-purple-700 text-white px-5 py-3 rounded-lg hover:bg-purple-800 transition duration-300 ease-in-out shadow-md text-md font-semibold"
        >
            Go to Library
        </button>
    );
};

export default GoToLibraryButton;