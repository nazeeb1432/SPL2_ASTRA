import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import api from "../utils/api";

const LogoutButton = () => {
  const { logout, tokenize, emailHandle, nameHandle,setIsLoggedIn } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await api.post("/logout");

      // Clear local authentication state
      logout();
      tokenize("");
      emailHandle("");
      nameHandle("");

      // Redirect to the login page
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
