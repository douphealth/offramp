import { useEffect, useState, useCallback } from "react";
const KEY = "offramp:saved";
export function useSaved() {
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ } }, []);
  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { saved, toggle };
}
