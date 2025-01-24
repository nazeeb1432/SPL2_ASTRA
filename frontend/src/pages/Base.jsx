import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import { useAuthContext } from "../context/AuthContext";  // Import user auth context

const Base = () => {
  const { email } = useAuthContext();  // Get userEmail from context
  console.log("User email:", email);
  return (
    <div className="flex flex-col h-screen">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <UploadSection userEmail={email} /> {/* Pass userEmail */}
      </div>
    </div>
  );
};

export default Base;
