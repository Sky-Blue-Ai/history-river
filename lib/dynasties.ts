import raw from "@/app/data/content.json";
import type { Track } from "@/lib/content";

export interface RulerTuple {
  title: string;
  name: string;
  from: number;
  to: number;
  note: string;
}

export interface DynastyPerson {
  name: string;
  role: string;
  note: string;
}

export interface Dynasty {
  id: string;
  name: string;
  span: { from: number; to: number };
  capital: string;
  founder: string;
  endReason: string;
  keywords: string[];
  summary: string;
  concurrent?: boolean;
  rulers: [string, string, number, number, string][];
  polities: string[];
  people: DynastyPerson[];
  eventIds: string[];
  sources: { title: string; url: string; publisher?: string }[];
}

interface Content {
  dynasties: { dynasties: Dynasty[]; note: string };
}

const content = raw as unknown as Content;

export const dynasties = content.dynasties.dynasties;
export const dynastiesNote = content.dynasties.note;
export const dynastyById = new Map(dynasties.map((d) => [d.id, d]));

export function rulersOf(d: Dynasty): RulerTuple[] {
  return d.rulers.map(([title, name, from, to, note]) => ({ title, name, from, to, note }));
}

export function neighboursOfDynasty(id: string): { prev?: Dynasty; next?: Dynasty } {
  const i = dynasties.findIndex((d) => d.id === id);
  return { prev: dynasties[i - 1], next: dynasties[i + 1] };
}

export type { Track };
