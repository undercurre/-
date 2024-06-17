import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post("/api/login", { username, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      setLoggedIn(true);
      setProfile(null);
      alert("Login successful");
    } catch (error) {
      alert("Login failed");
    }
  };

  const handleGetProfile = async () => {
    try {
      const response = await axios.get("/api/note", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        withCredentials: true,
      });
      setProfile(response.data.user);
    } catch (error) {
      refreshToken(() => handleGetProfile());
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

  async function refreshToken(callback: () => void) {
    try {
      const response = await axios.post(
        "/api/refresh-token",
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.setItem("accessToken", response.data.accessToken);
      console.log("Token refreshed successfully");
      callback();
    } catch (error) {
      console.error("Failed to refresh token", error);
      setLoggedIn(false);
      localStorage.removeItem("accessToken");
    }
  }

  return (
    <div>
      <h1>App3</h1>
      <div>
        {!loggedIn ? (
          <>
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
          </>
        ) : (
          <>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleGetProfile}>Get Profile</button>
          </>
        )}
      </div>
      {profile && <div>Profile: {profile}</div>}
    </div>
  );
};

export default App;
