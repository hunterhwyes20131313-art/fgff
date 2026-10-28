# Atlas Fortnite Item Shop Website

A responsive static website connected to your deployed API: https://atlas-server-add3.onrender.com

## Features
- Current shop data and cosmetic artwork
- Search and sorting
- Refresh button and automatic refresh every 5 minutes while the page is open
- Open, download, and share the generated shop image
- Responsive dark Atlas design
- No API key or user account needed

## Test in VS Code
1. Extract the ZIP and open this folder in VS Code.
2. Install the **Live Server** extension, then right-click `index.html` → **Open with Live Server**.
3. Or use PowerShell in this folder:
   ```powershell
   py -m http.server 5500
   ```
   Open http://127.0.0.1:5500

## Deploy the website on Render
This is a separate frontend website. Keep your existing API service running.

1. Create a new GitHub repository named `atlas-fortnite-shop-site`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` into the repository root (do not upload only the ZIP file).
3. Open https://dashboard.render.com/ → **New +** → **Static Site**.
4. Connect the new repository and choose the branch (usually `main`).
5. Set:
   - **Build Command:** leave blank
   - **Publish Directory:** `.`
6. Click **Create Static Site**. When deployment finishes, open the new `*.onrender.com` URL.

Render's official instructions: https://render.com/docs/static-sites . Render static sites can be deployed on the free tier and redeploy from a connected Git repo when you push updates.

## Automatic updates
The website fetches `/api/shop` every five minutes while someone has the page open. Your API also caches upstream shop data for five minutes. The image endpoint generates a PNG on demand. This is not a background scheduled job: the browser must be open for the page refresh. A scheduled Discord post would require a separate scheduled task and a Discord webhook kept secret on the server, never in frontend code.

## Troubleshooting
- Test https://atlas-server-add3.onrender.com/api/shop directly first. If it fails, fix the API service.
- If the API works directly but the site cannot load it, open browser developer tools (F12 → Console) and check for CORS errors.
- If the first request is slow, the free API service may be waking up.
- Item artwork can be missing if the upstream provider doesn't include a usable image URL.

Unofficial fan project. Fortnite and related assets belong to their respective owners. Not affiliated with or endorsed by Epic Games.
