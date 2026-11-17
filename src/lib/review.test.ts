import { describe, expect, it } from 'vitest';
import { getService, services, matchingRoute, reviewStatus, scopeLabel, filterServices } from './services';
import { estimateCosts } from './calculator';
import { parseSaved, toggleSaved } from './saved';
import { submissionSchema } from './submissions';
import { needsEvidenceReview } from './monitoring';
function service(id: string) { const s = getService(id); if (!s) throw new Error('Missing fixture'); return s; }
describe('cancellation safety rules', () => {
 it('Apple billing never uses the direct ChatGPT route', () => { expect(matchingRoute(service('chatgpt'),'apple','Greece').guide.id).toBe('apple-subscriptions'); });
 it('Google billing uses Google Play', () => { expect(matchingRoute(service('adobe'),'google','US').destination).toBe('https://play.google.com/store/account/subscriptions'); });
 it('partner billing does not show direct instructions', () => { expect(matchingRoute(service('netflix'),'partner','Other').supported).toBe(false); });
 it('US-specific shortcuts do not apply to Greece', () => { expect(matchingRoute(service('audible'),'direct','Greece').supported).toBe(false); });
 it('PayPal is not represented as merchant contract cancellation', () => { expect(matchingRoute(service('paypal'),'paypal','US').guide.caution).toContain('may NOT cancel'); });
 it('unreviewed guides remain reference-only', () => { expect(reviewStatus(service('twitch'))).toBe('Reference only'); });
 it('reviews expire after 90 days', () => { expect(reviewStatus(service('netflix'),new Date('2027-01-30T00:00:00Z'))).toBe('Needs re-review'); expect(reviewStatus(service('netflix'),new Date('2027-01-29T00:00:00Z'))).toBe('Imported source review'); });
 it('unverified international scope is not worldwide applicability', () => { expect(scopeLabel(service('netflix'))).toBe('Region varies'); });
 it('all official destinations use https', () => { expect(services.every(s => new URL(s.route).protocol === 'https:' && new URL(s.source).protocol === 'https:')).toBe(true); });
 it('source changes and blocked URLs require manual review', () => { expect(needsEvidenceReview(200,200,true)).toBe(true); expect(needsEvidenceReview(403,200,false)).toBe(true); expect(needsEvidenceReview(200,200,false)).toBe(false); });
});
describe('directory and estimates', () => {
 it('combines market, category and saved filters', () => { expect(filterServices({ category:'Streaming',market:'greek',onlySaved:true,saved:['cosmote-tv'] }).map(s=>s.id)).toEqual(['cosmote-tv']); });
 it('returns an honest empty result for unsupported services', () => { expect(filterServices({q:'unsupported-service-xyz'})).toEqual([]); });
 it('ignores invalid stored bookmark data', () => { expect(parseSaved('{"admin":true}')).toEqual([]); });
 it('adds and removes saved items', () => { expect(toggleSaved([], 'netflix')).toEqual(['netflix']); expect(toggleSaved(['netflix'],'netflix')).toEqual([]); });
 it('separates annual and monthly costs without fees or refunds', () => { expect(estimateCosts([{name:'a',price:12,cycle:'month'},{name:'b',price:120,cycle:'year'}])).toEqual({monthly:22,annual:264,fiveYear:1320}); });
 it('handles empty, negative and nonfinite costs', () => { expect(estimateCosts([]).monthly).toBe(0); expect(estimateCosts([{name:'a',price:-1,cycle:'month'},{name:'b',price:Infinity,cycle:'year'}]).monthly).toBe(0); });
 it('rejects oversized and empty reports', () => { expect(submissionSchema.safeParse({kind:'issue',message:'x'.repeat(2001)}).success).toBe(false); expect(submissionSchema.safeParse({kind:'request',message:''}).success).toBe(false); });
 it('rejects unsolicited outcome values and honeypot input', () => { expect(submissionSchema.safeParse({kind:'outcome',outcome:'cancelled'}).success).toBe(false); expect(submissionSchema.safeParse({kind:'request',message:'Missing service',website:'spam'}).success).toBe(false); });
});
