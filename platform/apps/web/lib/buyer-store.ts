"use client";

import { useEffect, useState } from "react";

export const FAV_KEY = "motora-favs";
export const CMP_KEY = "motora-compare";
export const COMPARE_MAX = 4;
const EVENT = "motora-buyer";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, arr: string[]) {
  window.localStorage.setItem(key, JSON.stringify(arr));
  window.dispatchEvent(new Event(EVENT));
}

/** Adiciona/remove um id da lista. Respeita `max` (não adiciona além do limite). */
export function toggle(key: string, id: string, max?: number): boolean {
  const arr = read(key);
  const i = arr.indexOf(id);
  if (i >= 0) {
    arr.splice(i, 1);
    write(key, arr);
    return false;
  }
  if (max && arr.length >= max) return true;
  arr.push(id);
  write(key, arr);
  return true;
}

export function clear(key: string) {
  write(key, []);
}

/** Hook reativo: retorna os ids da lista, sincronizando entre componentes/abas. */
export function useBuyerList(key: string): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(read(key));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  return ids;
}
