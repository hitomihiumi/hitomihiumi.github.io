/** Root URL of the site (where the overlay lives), without the editor / oauth sub-path. */
export const siteBase = () => {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname.replace(/(editor|oauth)\/?$/, '').replace(/\/?$/, '/');
  return window.location.origin + path;
};

export const constants = {
  CLIENT_ID: 'h1ttmkwmvie1t024nakvh5yd078bqm',
  get OAUTH_REDIRECT_URI() {
    return encodeURIComponent(siteBase() + 'oauth/');
  },
  get OAUTH_URL() {
    return (
      `https://id.twitch.tv/oauth2/authorize` +
      `?client_id=${constants.CLIENT_ID}` +
      `&redirect_uri=${constants.OAUTH_REDIRECT_URI}` +
      '&response_type=token' +
      '&scope=chat:read%20chat:edit'
    );
  },
};
