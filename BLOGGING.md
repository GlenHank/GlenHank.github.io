# Blogging on GitHub Pages

This site is static, so public posts are loaded from `data/posts.json`.

The Decap CMS admin screen lives at `/admin/`. It edits the same `data/posts.json` file and uploads images to `assets/uploads/`.

## One-time Decap CMS authentication setup

The admin UI is already included in this repo, but GitHub requires an authentication bridge before browser-based publishing can write commits.

Current config:

- Admin URL: `/admin/`
- Backend: Netlify Identity + Git Gateway
- Branch: `main`
- Blog data file: `data/posts.json`
- Upload folder: `assets/uploads`

Before publishing from `/admin/`, connect this GitHub repo to Netlify and enable Identity + Git Gateway.

Important: use the Netlify-hosted `/admin/` URL when publishing from Decap CMS, because Git Gateway endpoints live on Netlify. Your public homepage can still be served from GitHub Pages if you prefer.

Without that auth bridge, the homepage still works and manual GitHub editing still works, but `/admin/` will not be able to commit changes.

To publish a blog post:

1. Open `/admin/` on the Netlify-hosted site and sign in through Identity.
2. Add or edit posts under `Site Content` -> `Blog Posts`.
3. Publish the change. Decap CMS commits the updated `data/posts.json` and uploaded images to GitHub.
4. GitHub Pages will rebuild and the newest post will appear on the homepage.

Manual publishing also works:

1. Add a new object to the `posts` array in `data/posts.json`.
2. Put images in an `assets/` or `images/` folder and set the post `image` field to that relative path, for example `assets/my-cover.jpg`.
3. Commit and push the change to GitHub.
4. GitHub Pages will rebuild and the newest post will appear on the homepage.

The in-page editor is still a local drafting tool. It can preview a post in your browser and export JSON, but Decap CMS is the GitHub-backed publishing path.
