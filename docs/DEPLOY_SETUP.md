# Getting this site live on Vercel, then connected to Jobber

The order matters — Jobber's Redis token store and its OAuth redirect URI
both depend on the site already being deployed to a real URL, so deploy
first, connect Jobber second. Do these in order and each step unblocks the
next one.

You don't need to own a domain yet. Vercel gives every project a free
`your-project.vercel.app` URL the moment it deploys — use that to get
everything working end to end today, then swap in the real domain later
(step 8) without touching any of the Jobber setup again.

## 1. Put the code in git

Nothing here is in git yet. From the project folder, in a terminal:

```
git init
git add .
git commit -m "Initial commit"
```

Then create an empty repository on [github.com](https://github.com/new)
(no README, no .gitignore — this project already has one), copy the
remote URL it gives you, and:

```
git branch -M main
git remote add origin <the URL GitHub gave you>
git push -u origin main
```

From here on, `git push` updates the live site automatically once step 2
is done — no redeploying by hand.

## 2. Create the Vercel project

At [vercel.com/new](https://vercel.com/new), sign in (GitHub login is
easiest), and import the repository you just pushed. Leave every build
setting on its default — Vercel detects Next.js automatically. Click
Deploy.

A few minutes later you'll have a working URL like
`cairns-bin-cleaning.vercel.app`. That's the real, live site — just not
on your own domain yet.

## 3. Add the Redis store for Jobber

In the Vercel project → **Storage** tab → **Create Database** → **Upstash
for Redis** → free tier. Vercel wires `KV_REST_API_URL` and
`KV_REST_API_TOKEN` into the project automatically — nothing to copy by
hand.

## 4. Set the site URL

Vercel project → **Settings** → **Environment Variables** → add:

```
NEXT_PUBLIC_SITE_URL = https://cairns-bin-cleaning.vercel.app
```

(use your actual `.vercel.app` URL from step 2). This feeds the sitemap,
robots.txt, canonical links and social preview tags — all of it is
already wired to read from this one variable.

## 5. Create the Jobber app and connect it

Now that there's a real URL, follow **docs/JOBBER_SETUP.md** steps 1–4 —
same process, just use your `.vercel.app` URL (not `localhost`) as the
redirect URI this time:

```
https://cairns-bin-cleaning.vercel.app/api/jobber/oauth/callback
```

Add the resulting `JOBBER_CLIENT_ID`, `JOBBER_CLIENT_SECRET` and
`JOBBER_REDIRECT_URI` to the same Vercel environment variables page as
step 4. Redeploy (Vercel project → Deployments → ⋯ → Redeploy, or just
push any commit) so the new variables take effect.

Then visit `https://<your-vercel-url>/api/jobber/oauth/connect` on the
**live** site and authorize it — this is the same one-time step described
in JOBBER_SETUP.md, just done against production instead of localhost.

## 6. Test it for real

Fill in the bin cleaning booking form on the live site and submit it. A
new Client should appear in Jobber within a few seconds. If it does,
money-moving-wise the site is doing everything it's currently built to do
— the only piece still missing is automatic Request/Job creation, which
is its own documented next step in JOBBER_SETUP.md.

## 7. Local development still works the same way

Copy `env.example` to `.env.local`, fill in the same values (with
`JOBBER_REDIRECT_URI` back to `localhost:3000` and `NEXT_PUBLIC_SITE_URL`
back to `localhost:3000` for local testing), and `npm run dev` as normal.
Production and local use separate copies of these variables — changing
one never touches the other.

## 8. Later: swap in the real domain

Once a domain is bought: Vercel project → **Settings** → **Domains** →
add it, and follow Vercel's DNS instructions (usually one A or CNAME
record at your registrar). Then:

- Update `NEXT_PUBLIC_SITE_URL` in Vercel's environment variables to the
  new domain.
- In the Jobber developer app, **add** the new domain's callback URL as a
  second redirect URI — Jobber allows multiple, so the `.vercel.app` one
  can stay working as a fallback rather than breaking anything.
- Redeploy.

No code changes required for any of this — every place the domain is used
reads from `NEXT_PUBLIC_SITE_URL`.
