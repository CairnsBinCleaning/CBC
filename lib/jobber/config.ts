// Central place for every Jobber-related environment variable and
// constant. Nothing else in the codebase should read process.env.JOBBER_*
// directly — import from here so a missing var fails loudly, at the point
// of use, instead of silently deep inside a mutation.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See docs/JOBBER_SETUP.md.`
    );
  }
  return value;
}

export const jobberConfig = {
  get clientId() {
    return required("JOBBER_CLIENT_ID");
  },
  get clientSecret() {
    return required("JOBBER_CLIENT_SECRET");
  },
  get redirectUri() {
    return required("JOBBER_REDIRECT_URI");
  },

  // Jobber ships a new dated API version periodically. Bump this
  // deliberately after checking the changelog — never silently.
  apiVersion: "2025-04-16",

  authorizeUrl: "https://api.getjobber.com/api/oauth/authorize",
  tokenUrl: "https://api.getjobber.com/api/oauth/token",
  graphqlUrl: "https://api.getjobber.com/api/graphql",

  // Requested when a visitor (you, once, during setup) is sent to Jobber
  // to authorize the app. Jobber shows the real scope list when you
  // register the app in the Developer Center — keep this matched to
  // exactly what's granted there, nothing wider.
  scopes: "clients requests",
};
