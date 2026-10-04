# Admin setup

The editor lives at `/admin`. Content is stored in `content/site-content.json`. Publishing commits that file to GitHub, which starts a Vercel deployment when the repository is connected to the Vercel project. Uploaded media goes to a public Vercel Blob store; its URL is saved into the master content file when you publish.

## Configure authentication

Create a strong, unique admin password with a password manager. Create a separate random session secret with at least 32 characters. Never commit either value or send it in chat.

Add these environment variables in Vercel under **Project Settings → Environment Variables**:

- `ADMIN_PASSWORD`: the admin password.
- `ADMIN_SESSION_SECRET`: the random session-signing secret.
- `GITHUB_OWNER`: the GitHub account or organization that owns the site repository.
- `GITHUB_REPO`: the repository name.
- `GITHUB_BRANCH`: the branch Vercel deploys, usually `main`.
- `GITHUB_CONTENT_TOKEN`: a fine-grained GitHub token with **Contents: Read and write** access to this repository only.

Use the same values in a local `.env.local` file to test publishing locally. `.env.local` is ignored by Git. Do not put secret values into `.env.example`.

## Configure media uploads

In the Vercel project, create and connect a **public** Blob store. Vercel provides `BLOB_READ_WRITE_TOKEN` to the connected project. Include Development, Preview, and Production environments as needed. For local testing, pull the Development variables with the Vercel CLI or set `BLOB_READ_WRITE_TOKEN` in `.env.local`. The upload endpoint requires an authenticated admin session and accepts common image formats and MP4, WebM, or QuickTime videos up to 150 MB.

## Publish workflow

1. Sign in at `/admin`.
2. Choose a section and update its fields. Repeated items such as reels, FAQs, or packages can be added or removed.
3. Upload a poster or video in a media field, then publish the changes.
4. The editor commits the updated master file to the configured branch. Vercel rebuilds the site; edits appear publicly after that deployment completes.

The current master file intentionally contains obvious sample placeholders. Replace those with approved studio copy and real media before launch.