import { useState } from "react";


const HamburgerMenu = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleMenuItemClick = (section) => {
        setIsOpen(false); // Close the menu
        onNavigate(section); // Trigger the navigation logic
    };

    return (
        <div className="fixed top-4 left-4 z-50">
            {/* Hamburger Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 w-16 text-2xl mt-2"
            >
                ☰
            </button>

            {/* Menu Items */}
            {isOpen && (
                <div className="mt-2 bg-white shadow-lg rounded-lg p-4 space-y-2 w-48">
                    <button
                        onClick={() => handleMenuItemClick("notes")}
                        className="block w-full text-left font-semibold hover:bg-blue-700 hover:text-white hover:font-bold p-2 rounded-lg"
                    >
                        Take Notes
                    </button>
                    <button
                        onClick={() => handleMenuItemClick("bookmarks")}
                        className="block w-full text-left font-semibold hover:bg-blue-700 hover:text-white hover:font-bold p-2 rounded-lg"
                    >
                        Bookmarks
                    </button>
                    <button
                        onClick={() => handleMenuItemClick("audiobook")}
                        className="block w-full text-left font-semibold hover:bg-blue-700 hover:text-white hover:font-bold p-2 rounded-lg"
                    >
                        Generate Audiobook
                    </button>
                    <button
                        onClick={() => handleMenuItemClick("summarization")}
                        className="block w-full text-left font-semibold hover:bg-blue-700 hover:text-white hover:font-bold p-2 rounded-lg"
                    >
                        Generate Summarization
                    </button>
                    <button
                        onClick={() => handleMenuItemClick("audiobooks")}
                        className="block w-full text-left font-semibold hover:bg-blue-700 hover:text-white hover:font-bold p-2 rounded-lg"
                    >
                        My Audiobooks
                    </button>
                </div>
            )}
        </div>
    );
};

export default HamburgerMenu;