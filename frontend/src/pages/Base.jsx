import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";

const Base = () => {
  return (
    <div className="flex flex-col h-screen">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <UploadSection />
      </div>
    </div>
  );
};

export default Base;
