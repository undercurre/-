// 将 Cookie 字符串解析为对象
function        parseCookies(cookieString) {
  return cookieString.split(";").reduce((cookies, cookie) => {
    const parts = cookie.split("=");
    const key = parts[0].trim();
    const value = parts[1];
    cookies[key] = value;
    return cookies;
  }, {});
}

module.exports = {
  parseCookies,
};
