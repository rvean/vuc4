const setFontSize = () => {
  const oHtml = document.getElementsByTagName('html')[0];
  const width = oHtml.clientWidth;
  oHtml.style.fontSize = `${37.5 * (width / 375)}px`; // 375 px 的屏幕基准像素为 37.5 px
};

// eslint-disable-next-line consistent-return
const remInit = () => {
  if (!document.addEventListener) return false;
  const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
  window.addEventListener(resizeEvt, setFontSize, false);
  document.addEventListener('DOMContentLoaded', setFontSize, false);
};

module.exports = {
  remInit
}
