// SettingsButton.jsx
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
        className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 
                  rounded-lg transition-colors text-base border border-gray-200"
      >
        <FiSettings className="w-5 h-5 text-purple-600" />
        <span className="font-medium">Settings</span>
      </button>
    );
};

export default SettingsButton;