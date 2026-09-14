# Connecting the website to Jobber

What this gets you: someone fills in the bin cleaning booking form on the
real site, and a real Client record appears in Jobber automatically —
no Jobber page, no Jobber branding, they never leave cairnsbin­cleaning.com.au.
Jobber still runs the scheduling, invoicing, payments and recurring
billing behind the scenes exactly as it does today. This does **not**
replace Jobber or its $350/month subscription — that was never the
point of this piece. It just stops the site from having to bounce anyone
over to a generic Jobber-hosted page to get booked.

Five steps. The first four you do once, ever. The fifth is what to do
next.

## 1. Create the Jobber app

Go to [developer.getjobber.com](https://developer.getjobber.com), signed
in as the Cairns Bin Cleaning Jobber account, and create a new app.

Choose a **private/custom connection**, not a marketplace app — Jobber
only requires their app-review process for apps published to their
marketplace or connected to 5+ different Jobber accounts. This is one
app, for one account, so none of that applies and there's no review to
wait on.

Set the redirect URI to:

- Local dev: `http://localhost:3000/api/jobber/oauth/callback`
- Production: `https://<your real domain>/api/jobber/oauth/callback`

(You can add both — Jobber allows multiple redirect URIs per app.)

Copy the **Client ID** and **Client Secret** it gives you.

## 2. Add a small Redis store for the connection tokens

Jobber's access token expires every 60 minutes and has to be refreshed
using a longer-lived refresh token. Vercel's serverless functions don't
keep local disk between requests, so that refresh token needs to live
somewhere durable outside the function itself.

Easiest path, since the site's already on Vercel: open the project in the
Vercel dashboard → **Storage** tab → **Create Database** → **Upstash for
Redis** → pick the free tier. Vercel wires the connection details into
your project automatically as `KV_REST_API_URL` and `KV_REST_API_TOKEN` —
nothing else to configure.

## 3. Set the environment variables

Copy `env.example` to `.env.local` and fill in:

```
JOBBER_CLIENT_ID=<from step 1>
JOBBER_CLIENT_SECRET=<from step 1>
JOBBER_REDIRECT_URI=http://localhost:3000/api/jobber/oauth/callback
```

`KV_REST_API_URL` / `KV_REST_API_TOKEN` are already set if you used
Vercel's Storage tab in step 2 — `vercel env pull` will pull them into
`.env.local` for local dev. Set the same variables (with the production
redirect URI) in the Vercel project's environment variables for
production.

## 4. Authorize the app — once

With the dev server running (`npm run dev`), visit:

```
http://localhost:3000/api/jobber/oauth/connect
```

You'll land on Jobber's normal authorization screen. Approve it. You get
redirected back and should see "Jobber is connected. You can close this
tab." That's it — the site now has a working, self-refreshing connection
to Jobber. Nothing else needs to be repeated; do the same once against
production after deploying.

**To test it:** fill in the bin cleaning booking form on the site and
submit it. A new Client should appear in Jobber within a few seconds,
with the name, phone and suburb you entered.

## 5. What's next: finishing the actual booking

Right now, submitting the form creates a real Client in Jobber — that
part is done and safe to use. It does not yet automatically create the
Request/Job in Jobber for that client. That's deliberate: Jobber's public
API docs confirm the exact fields for creating a *client* in detail, but
don't spell out the exact input fields for creating a *request* — and
guessing field names for the piece that actually books the paid work
isn't worth the risk of it silently failing.

Once you've done step 4, visit (replace the key with your
`JOBBER_CLIENT_SECRET`):

```
/api/jobber/oauth/schema-check?type=RequestCreateInput&key=<JOBBER_CLIENT_SECRET>
```

That asks Jobber's own schema what fields `RequestCreateInput` actually
takes. Paste the JSON result back into the next session and the
`requestCreate` call in `lib/jobber/actions.ts` gets finished with
confirmed fields instead of guessed ones — a small follow-up, not a
redo of anything here.

## Where things live

- `lib/jobber/config.ts` — every env var and Jobber constant, in one place
- `lib/jobber/tokens.ts` — reads/writes the OAuth tokens in Redis
- `lib/jobber/client.ts` — token refresh + the GraphQL request helper
- `lib/jobber/actions.ts` — `bookBinCleaning`, the Server Action the form calls
- `app/api/jobber/oauth/connect` + `.../callback` — the one-time setup flow (step 4)
- `app/api/jobber/oauth/schema-check` — setup-only schema lookup (step 5)
- `app/api/jobber/webhooks` — receives real-time updates from Jobber once
  a webhook is registered against this URL in the Developer Center's app
  settings (not required yet — logs and verifies signatures already, ready
  for when there's an event worth acting on, like a paid invoice)
