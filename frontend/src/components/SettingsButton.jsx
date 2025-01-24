import { FiSettings } from 'react-icons/fi';

const SettingsButton = () => {

    const handleSettings = () => {};
    return (
        <button
          onClick={handleSettings}
          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md flex items-center space-x-1"
        >
        <FiSettings/>
        <span> Settings</span>
        </button>
    );
}

export default SettingsButton;