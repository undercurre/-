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
        await axios.post(
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
      } catch (error) {
        alert("Login failed: " + error.response.data.message);
      }
    },
    async getDashboard() {
      try {
        const response = await axios.get("/api/dashboard", {
          withCredentials: true,
        });
        this.message = `User: ${response.data.user}`;
      } catch (error) {
        this.message = "Not authenticated";
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
      } catch (error) {
        console.error("Logout failed", error);
      }
    },
  },
};
</script>
