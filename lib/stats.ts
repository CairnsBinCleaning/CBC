// Trust numbers shown on the site. Every value here has to be the real,
// current figure — the same discipline as calloutZones in pricing.ts,
// which never invents a call-out fee it doesn't actually have yet.
//
// Set LIFETIME_BIN_CLEANS to the real count before this ships. Leave it
// null to keep the homepage stat hidden rather than show a guessed number
// — components/LiveStat.tsx only renders when this is a real number.

export const LIFETIME_BIN_CLEANS: number | null = null;
