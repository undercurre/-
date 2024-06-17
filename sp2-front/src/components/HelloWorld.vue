<template>
  <div id="app">
    <h1>App2 - Dashboard</h1>
    <div v-if="!loggedIn">
      <h2>Login</h2>
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <button @click="getDashboard">Get Dashboard</button>
      <div>{{ message }}</div>
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      password: "",
      message: "",
      loggedIn: false,
    };
  },
  methods: {
    async login() {
      try {
        const res = await axios.post(
          "/api/login",
          {
            username: this.username,
            password: this.password,
          },
          {
            withCredentials: true,
          }
        );
        this.loggedIn = true;
        console.log(res);
        localStorage.setItem("accessToken", res.data.accessToken);
      } catch (error) {
        alert("Login failed: " + error.response.data.message);
      }
    },
    async getDashboard() {
      try {
        const response = await axios.get("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        this.message = `User: ${response.data.user}`;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.message = "";
          this.refreshToken(this.getDashboard);
        } else {
          this.message = "Not authenticated";
        }
      }
    },
    async logout() {
      try {
        await axios.post(
          "/api/logout",
          {},
          {
            withCredentials: true,
          }
        );
        this.loggedIn = false;
        this.username = "";
        this.password = "";
        this.message = "";
        localStorage.removeItem("accessToken");
      } catch (error) {
        console.error("Logout failed", error);
      }
    },
    async refreshToken(callback) {
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
        this.loggedIn = false;
        localStorage.removeItem("accessToken");
      }
    },
  },
  async mounted() {
    const token = localStorage.getItem("accessToken");

    this.loggedIn = true;
  },
};
</script>
