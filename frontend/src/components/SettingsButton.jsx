// SettingsButton.jsx
import { FiSettings } from 'react-icons/fi';

const SettingsButton = () => {
  const handleSettings = () => {};

  return (
    <button
      onClick={handleSettings}
      className="text-gray-600 hover:text-blue-600 px-4 py-2.5 rounded-lg flex items-center gap-2
                 transition-colors text-sm font-medium hover:bg-blue-50"
    >
      <FiSettings className="w-4 h-4" />
      <span>Settings</span>
    </button>
  );
};

export default SettingsButton;