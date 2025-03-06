import { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        speed: 1.0,
        page_goal: null,
        duration_goal: null,
        voice_id: null,
        streak_count: 0,
        last_login_date: null,
    });
    const [voices, setVoices] = useState([]);
    const [milestoneMessage, setMilestoneMessage] = useState("");
    const { email: contextEmail } = useAuthContext();
    const email = contextEmail || Cookies.get("email");
    const navigate = useNavigate();

    // Speed options: 0.25 to 2.0 in steps of 0.25
    const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get(`/settings/${email}`);
                setSettings(response.data);
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };

        const fetchVoices = async () => {
            try {
                const response = await api.get("/audiobooks/voices");
                setVoices(response.data.voices);
            } catch (error) {
                console.error("Error fetching voices:", error);
            }
        };

        fetchSettings();
        fetchVoices();
    }, [email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/settings/${email}`, settings);
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Error updating settings:", error);
            alert("Failed to update settings.");
        }
    };

    const updateStreak = async () => {
        try {
            const response = await api.post(`settings/update-streak/${email}`);
            setSettings((prev) => ({
                ...prev,
                streak_count: response.data.streak_count,
                last_login_date: new Date().toISOString().split("T")[0],
            }));
            if (response.data.milestone_message) {
                setMilestoneMessage(response.data.milestone_message);
                setTimeout(() => setMilestoneMessage(""), 5000); // Clear message after 5 seconds
            }
        } catch (error) {
            console.error("Error updating streak:", error);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Go to Library Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => navigate("/library")}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Library
                </button>
            </div>

            {/* Settings Form */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Speed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Playback Speed</label>
                        <select
                            name="speed"
                            value={settings.speed}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {speedOptions.map((speed) => (
                                <option key={speed} value={speed} className="text-gray-900">
                                    {speed}x
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Page Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Page Goal</label>
                        <input
                            type="number"
                            name="page_goal"
                            value={settings.page_goal || ""}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Duration Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Daily Duration Goal (minutes)</label>
                        <input
                            type="number"
                            name="duration_goal"
                            value={settings.duration_goal || ""}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Voice Selection Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Voice</label>
                        <select
                            name="voice_id"
                            value={settings.voice_id || ""}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Choose a voice...</option>
                            {voices.map((voice) => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Streak Counter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Streak Count</label>
                        <p className="mt-1 text-lg text-gray-800">
                            🔥 Current Streak: <span className="font-bold">{settings.streak_count}</span> days
                        </p>
                        {milestoneMessage && (
                            <p className="text-sm text-green-600 mt-2">{milestoneMessage}</p>
                        )}
                        {/* <button
                            type="button"
                            onClick={updateStreak}
                            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Log In Today
                        </button> */}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;