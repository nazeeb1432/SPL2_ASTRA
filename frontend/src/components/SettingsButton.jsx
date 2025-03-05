import { FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SettingsButton = () => {
    const navigate = useNavigate();

    const handleSettings = () => {
        navigate("/settings"); // Navigate to the Settings Page
    };

    return (
        <button
            onClick={handleSettings}
            className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md flex items-center space-x-1"
        >
            <FiSettings />
            <span>Settings</span>
        </button>
    );
};

export default SettingsButton;