import $ from "jquery";

$(document).ready(function () {
  // 登录逻辑
  $("#loginButton").click(function () {
    const username = $("#username").val();
    const password = $("#password").val();

    $.ajax({
      url: "api/login",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ username, password }),
      xhrFields: {
        withCredentials: true,
      },
      success: function () {
        $("#login-form").hide();
        $("#profile-section").show();
        $("#profile").html("");
      },
      error: function (xhr, status, error) {
        alert("Login failed: " + xhr.responseJSON.message);
      },
    });
  });

  // 获取用户信息
  $("#getProfile").click(function () {
    $.ajax({
      url: "/api/profile",
      type: "GET",
      xhrFields: {
        withCredentials: true,
      },
      success: function (data) {
        $("#profile").html("User: " + data.user);
      },
      error: function (xhr, status, error) {
        $("#profile").html("Not authenticated");
      },
    });
  });

  // 注销逻辑
  $("#logoutButton").click(function () {
    document.cookie = "sso_token=; Max-Age=0; path=/; domain=.local";
    $("#profile-section").hide();
    $("#login-form").show();
    $("#username").val("");
    $("#password").val("");
  });
});
