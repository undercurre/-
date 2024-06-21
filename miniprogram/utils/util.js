const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 将 Cookie 字符串解析为对象
function parseCookies(cookieString) {
  return cookieString.split(";").reduce((cookies, cookie) => {
    const parts = cookie.split("=");
    const key = parts[0].trim();
    const value = parts[1];
    cookies[key] = value;
    return cookies;
  }, {});
}

module.exports = {
  formatTime,
  parseCookies
}