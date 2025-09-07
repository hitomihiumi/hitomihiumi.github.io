import { getHashString } from "@/utils";

export const constants = {
  /** number of milliseconds between cleanup sweeps */
  CLEANUP_TIMER: 10 * 1000,
  /** number of milliseconds before messages disappear */
  get DESTRUCT_TIMER() {
    const hs = getHashString();
    return parseInt(hs.lifetime ?? "90") * 1000;
  },
  CLIENT_ID: "h1ttmkwmvie1t024nakvh5yd078bqm",
  get OAUTH_REDIRECT_URI() {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin + window.location.pathname;
    const redirectUrl = baseUrl.replace(/\/$/, '') + '/oauth/';
    return encodeURIComponent(redirectUrl);
  },
  get OAUTH_URL() {
    return (
      `https://id.twitch.tv/oauth2/authorize` +
      `?client_id=${constants.CLIENT_ID}` +
      `&redirect_uri=${constants.OAUTH_REDIRECT_URI}` +
      "&response_type=token" +
      "&scope=chat:read%20chat:edit"
    );
  },
};

// Default color values for chat bubbles
export const defaultColors = {
  broadcaster: {
    usernameBg: '#f3ebe8',
    messageBg: '#fa95cd',
    usernameTextColor: '#fa95cd',
    messageTextColor: '#f3ebe8',
    usernameTextShadow: '#ffffff',
    messageTextShadow: '#3b3b3b'
  },
  mod: {
    usernameBg: '#a6608d',
    messageBg: '#f5dbe4',
    usernameTextColor: '#ffffff',
    messageTextColor: '#a6608d',
    usernameTextShadow: '#ffffff',
    messageTextShadow: '#3b3b3b'
  },
  subscriber: {
    usernameBg: '#a6608d',
    messageBg: '#f3ebe8',
    usernameTextColor: '#f3ebe8',
    messageTextColor: '#a6608d',
    usernameTextShadow: '#000000',
    messageTextShadow: '#6c6c6c'
  },
  vip: {
    usernameBg: '#a6608d',
    messageBg: '#f3ebe8',
    usernameTextColor: '#f3ebe8',
    messageTextColor: '#a6608d',
    usernameTextShadow: '#000000',
    messageTextShadow: '#6c6c6c'
  },
  default: {
    usernameBg: '#f990c8',
    messageBg: '#ffffff',
    usernameTextColor: '#ffffff',
    messageTextColor: '#f990c8',
    usernameTextShadow: '#000000',
    messageTextShadow: '#4d4d4d'
  }
};
