// Base.jsx
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import { useAuthContext } from "../context/AuthContext"; 
import Cookies from "js-cookie";
import SettingsButton from "../components/SettingsButton";
import LogoutButton from "../components/LogoutButton";

const Base = () => {
  const { email: contextEmail } = useAuthContext();
  const email = contextEmail || Cookies.get("email"); 

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex justify-between items-center px-6 h-16">
          <SettingsButton />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <UploadSection userEmail={email} />
      </div>
    </div>
  );
};

export default Base;