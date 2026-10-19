/**
 * Contact-form email for both versions of the site, sent through Web3Forms to
 * contact@butterfly-talent.com (the address the key was registered with).
 *
 * Replaces the Superdev `sendEmail` integration the site was generated with:
 * the build has only carried placeholder Superdev settings since it moved to
 * Vercel, so those sends all failed. The access key is public by design; it can
 * only deliver to that inbox, never read from it. Free plan: 250 messages a month.
 */
const WEB3FORMS_KEY = '6440f375-9d9d-4eb4-8e68-19864ace075e';
const ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Sends one message. `subject`, `name`, `email` and `replyto` are Web3Forms'
 * own fields; any other key becomes a labelled line in the email. Pass the
 * form's hidden honeypot as `botcheck` so submissions from bots are dropped.
 * Throws if the message was not accepted.
 */
export async function sendContactEmail(
  fields: Record<string, string | boolean>,
  { timeoutMs = 15000 }: { timeoutMs?: number } = {},
): Promise<void> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: abort.signal,
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, from_name: 'אתר Butterfly', ...fields }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) throw new Error(data.message || `Web3Forms HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}
