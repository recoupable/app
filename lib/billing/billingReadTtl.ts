/** Billing changes on a scale of days: keep a read for six hours, and never reload it on tab focus. */
const BILLING_READ_TTL = 6 * 60 * 60 * 1000;

export default BILLING_READ_TTL;
