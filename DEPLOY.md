# Going live

The site is an Eleventy static site with a Decap CMS admin panel at `/admin/`.
Locally, the admin panel talks to a small proxy server on your machine — no
GitHub account needed for testing. To let Arnob edit the site from anywhere
and have changes actually publish, connect it to GitHub + Netlify (both free).

## 1. Push this repo to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/arnob-website.git
git branch -M main
git push -u origin main
```

(Create the empty repo on GitHub first if it doesn't exist yet — `gh repo create arnob-website --private --source=. --remote=origin` does both at once if you have the `gh` CLI signed in.)

## 2. Point the CMS at that repo

Edit `admin/config.yml` and replace the placeholder:

```yaml
backend:
  name: github
  repo: YOUR_USERNAME/arnob-website   # <-- your actual GitHub username/repo
  branch: main
```

Commit and push that change.

## 3. Add Arnob as a collaborator

He needs write access to the repo so the CMS can actually publish his edits
as commits.

1. On GitHub: repo → **Settings → Collaborators → Add people**.
2. Enter his GitHub username or the email tied to his account.
3. He accepts the invite (email or GitHub notification). If he doesn't have
   a GitHub account yet, he'll need to create one (free) first.

## 4. Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Pick the `arnob-website` GitHub repo.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `_site`
4. Deploy. Netlify gives you a live URL (you can add a custom domain later).

## 5. Set up the CMS login (GitHub OAuth App)

Netlify used to issue the CMS's GitHub login automatically, but that only
works for repos connected the old "OAuth App" way — repos connected via
Netlify's newer **GitHub App** integration (the current default) get a
`404 Not Found` from `api.netlify.com/auth` when you try to log in. This site
works around that with its own tiny OAuth relay, built as two Netlify
Functions already in the repo (`netlify/functions/auth.js` and
`callback.js`), wired up via `netlify.toml`. You just need to give them a
GitHub OAuth App to talk to:

1. Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: anything, e.g. "Arnob Portfolio CMS"
   - **Homepage URL**: `https://YOUR-SITE.netlify.app`
   - **Authorization callback URL**: `https://YOUR-SITE.netlify.app/callback`
3. Register, then **Generate a new client secret** — copy both the Client ID
   and the secret now (the secret is only shown once).
4. In Netlify: **Site settings → Environment variables → Add a variable**,
   add both:
   - `OAUTH_CLIENT_ID` = the Client ID
   - `OAUTH_CLIENT_SECRET` = the Client secret
5. Trigger a redeploy (Netlify → Deploys → **Trigger deploy**) so the
   functions pick up the new env vars.
6. Also double-check `admin/config.yml` — `base_url` must match your actual
   Netlify URL exactly (`https://YOUR-SITE.netlify.app`).

## 6. Arnob's editing workflow, going forward

1. Go to `https://YOUR-SITE.netlify.app/admin/`
2. Click **Login with GitHub** and authorize once (only works after he's
   accepted the collaborator invite in step 3).
3. Edit content, click **Publish**.
4. Netlify rebuilds the site automatically (~30–60s) and the change goes live.

Every edit becomes a real Git commit in the repo's history, so nothing is
ever silently lost — anything can be reverted from GitHub if needed.

## Local editing (no GitHub/Netlify needed)

Useful while you're still setting things up, or if Arnob wants to preview
changes before they're live:

```bash
npm install        # first time only
npm start           # serves the site at http://localhost:8080
npm run cms         # in a second terminal — local admin backend
```

Then open `http://localhost:8080/admin/` and click **Login** (no credentials
needed locally). Edits save straight to the files on disk.
