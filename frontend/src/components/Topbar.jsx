import LogoutButton from './LogoutButton';
import SettingsButton from './SettingsButton'

const Topbar = () => {
  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4">
      <div className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">ASTRA</div>
      <div className="flex items-center space-x-6">
        <SettingsButton/>
        <LogoutButton/>
      </div>
    </div>
  );
};

export default Topbar;
