/**
 * Presence of this file gates the "Trade Services" option on the homepage
 * behind a "Coming soon" state (visible to the public, bypassable only via
 * a double-tap once it shows "Coming soon" — that's for you to test/preview).
 *
 * To make Trade Services fully public: delete this file from the repo.
 * index.html checks for it on load — if it's missing (404), the gate is
 * skipped automatically and clicking "Trade Services" goes straight through.
 * No other file needs to change.
 */
window.TRADE_GATE_ACTIVE = true;
