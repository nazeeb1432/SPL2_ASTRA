import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { FiLogOut } from "react-icons/fi";

const LogoutButton = () => {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg flex items-center gap-2 
                 transition-colors text-sm font-medium"
    >
      <FiLogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;