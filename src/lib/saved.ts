import { useEffect, useState, useCallback } from "react";
export const KEY = "offramp:saved";
export function parseSaved(value: string | null): string[] { try { const parsed: unknown = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []; } catch { return []; } }
export function toggleSaved(prev: string[], id: string) { return prev.includes(id) ? prev.filter(x => x !== id) : [...prev,id]; }
export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => { const read = () => { try { setSaved(parseSaved(localStorage.getItem(KEY))); } catch { setSaved([]); } }; read(); window.addEventListener('offramp:saved-change',read); window.addEventListener('storage',read); return () => { window.removeEventListener('offramp:saved-change',read); window.removeEventListener('storage',read); }; }, []);
  const toggle = useCallback((id: string) => {
    let previous: string[] = [];
    try { previous = parseSaved(localStorage.getItem(KEY)); } catch { /* Storage unavailable */ }
    const next = toggleSaved(previous,id);
    setSaved(next);
    try { localStorage.setItem(KEY,JSON.stringify(next)); window.dispatchEvent(new Event('offramp:saved-change')); } catch { /* Keep session bookmark without breaking the page */ }
  }, []);
  return { saved, toggle };
}
