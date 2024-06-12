import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await axios.post("/api/login", { username, password });
      setProfile(null);
      alert("Login successful");
    } catch (error) {
      alert("Login failed");
    }
  };

  const handleGetProfile = async () => {
    try {
      const response = await axios.get("/api/note", {
        withCredentials: true,
      });
      setProfile(response.data.user);
    } catch (error) {
      setProfile("Not authenticated");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
      setProfile(null);
      alert("Logged out");
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div>
      <h1>App3</h1>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleGetProfile}>Get Profile</button>
      </div>
      {profile && <div>Profile: {profile}</div>}
    </div>
  );
};

export default App;
