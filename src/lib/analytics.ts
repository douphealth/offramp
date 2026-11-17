import { submitFeedback } from './submissions.functions';
import type { Submission } from './submissions';
export const ANALYTICS_KEY = 'offramp:measurement-consent';
export function trackExit(data: Submission) {
  try { if (localStorage.getItem(ANALYTICS_KEY) !== 'yes') return; } catch { return; }
  // Optional counts only; no receipt content, account IDs or financial data.
  void submitFeedback({ data }).catch(() => {});
}
