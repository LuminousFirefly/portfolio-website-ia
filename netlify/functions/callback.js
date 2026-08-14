// Step 2 of the Decap CMS GitHub OAuth handshake: GitHub redirects here with
// a one-time ?code=. We exchange it server-side (using the client secret,
// which must never reach the browser) for a real access token, then hand
// that token back to the admin panel via postMessage — this is the exact
// handshake Decap CMS's GitHub backend expects from a "self-hosted" provider.
exports.handler = async (event) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const code = event.queryStringParameters && event.queryStringParameters.code;

  if (!clientId || !clientSecret) {
    return { statusCode: 500, body: "OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET are not set in Netlify environment variables." };
  }
  if (!code) {
    return { statusCode: 400, body: "Missing ?code from GitHub." };
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
    const message = tokenData.error_description || tokenData.error || "Unknown error exchanging code for a token.";
    return { statusCode: 401, body: `GitHub OAuth error: ${message}` };
  }

  const html = `<!doctype html>
<html><body>
<script>
(function () {
  var token = ${JSON.stringify(tokenData.access_token)};
  var message = "authorization:github:success:" + JSON.stringify({ token: token, provider: "github" });

  function receiveMessage(e) {
    window.opener.postMessage(message, e.origin);
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
Login successful, you can close this window.
</body></html>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html,
  };
};
