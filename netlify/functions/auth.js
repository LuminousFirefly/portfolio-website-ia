// Step 1 of the Decap CMS GitHub OAuth handshake: send the browser to
// GitHub's own login/consent screen. GitHub redirects back to /callback
// (see callback.js) with a one-time code once the user approves.
exports.handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    return { statusCode: 500, body: "OAUTH_CLIENT_ID is not set in Netlify environment variables." };
  }

  const origin = `https://${event.headers.host}`;
  const redirectUri = `${origin}/callback`;
  const scope = "repo,user";

  const authorizeUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}`;

  return {
    statusCode: 302,
    headers: { Location: authorizeUrl },
    body: "",
  };
};
