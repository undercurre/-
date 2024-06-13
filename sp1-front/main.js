import $ from "jquery";

$(document).ready(function () {
  // 登录逻辑
  $("#loginButton").click(function () {
    const username = $("#username").val();
    const password = $("#password").val();

    $.ajax({
      url: "/api/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password }),
      success: function (res) {
        $("#login-form").hide();
        $("#profile-section").show();
        $("#profile").html("");
        localStorage.setItem("accessToken", res.accessToken);
      },
      error: function (xhr, status, error) {
        alert("Login failed: " + xhr.responseJSON.message);
      },
    });
  });

  // 获取用户信息
  $("#getProfile").click(async function () {
    const profile = await fetchProtectedResource("/api/profile", "GET");
    $("#profile").html("User: " + profile.user);
  });

  // 注销逻辑
  $("#logoutButton").click(function () {
    $.ajax({
      url: "/api/logout",
      type: "POST",
      xhrFields: {
        withCredentials: true,
      },
      success: function (data) {
        localStorage.removeItem("accessToken");
        alert("Logout success!");
      },
      error: function (xhr, status, error) {
        alert("Logout failed: " + xhr.responseJSON.message);
      },
    });
    document.cookie = "refresh_token=; Max-Age=0; path=/; domain=.local";
    $("#profile-section").hide();
    $("#login-form").show();
    $("#username").val("");
    $("#password").val("");
  });

  // 刷新token
  function refreshAccessToken() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/api/refresh-token", // 替换成实际的刷新 Token 的接口地址
        method: "POST",
        contentType: "application/json",
        xhrFields: {
          withCredentials: true,
        },
        success: function (response) {
          localStorage.setItem("accessToken", response.accessToken);
          console.log("Refreshed token successfully.");
          resolve(response.accessToken); // 成功时返回新的 Access Token
        },
        error: function (xhr, status, error) {
          reject(error); // 失败时处理错误
        },
      });
    });
  }

  // 示例使用：在请求受保护资源时检查 AccessToken 是否失效，如果失效则刷新 Token 并重试请求
  async function fetchProtectedResource(url, method) {
    return new Promise((resolve, reject) => {
      var accessToken = localStorage.getItem("accessToken");

      $.ajax({
        url, // 替换成实际的受保护资源接口地址
        method,
        headers: {
          Authorization: "Bearer " + accessToken,
        },
        success: function (response) {
          resolve(response); // 成功时返回响应数据
        },
        error: function (xhr, status, error) {
          if (xhr.status === 401) {
            // 如果返回 401 表示 AccessToken 失效
            refreshAccessToken()
              .then(function (newAccessToken) {
                // 重新发起原始请求或其他操作
                fetchProtectedResource(url, method)
                  .then(resolve) // 再次发起请求成功时，将响应数据返回
                  .catch(reject); // 再次发起请求失败时，将错误信息返回
              })
              .catch(reject); // 刷新 Token 失败时，将错误信息返回
          } else {
            reject(error); // 其他错误情况，将错误信息返回
          }
        },
      });
    });
  }
});
