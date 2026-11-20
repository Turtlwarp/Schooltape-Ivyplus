// How to read a class code like "R10SC12":R,10,SC,12. then grab the SC and give whatever name you want to it

import { injectInlineStyles, uninjectInlineStyles } from "@/utils";

export type Subject = {
  name: string; // shown in the menu, e.g. "Science"
  code: string; // subject letters, e.g. "SC". "MA" also matches "MAC", "MAE"...
  colour: string; // hex colour, e.g. "#a6e3a1"
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { name: "Example (humanities)", code: "HU", colour: "#cba6f7" },
];
const STYLE_ID = "plugin-ivyPlus-classColours";
const ATTR = "data-ivyplus-subject"; // the label we stick on each class box

const CANDIDATES = "div.timetable-subject, .fc-event";

let observer: MutationObserver | null = null;


export function subjectLetters(classCode: string): string | null {
  const match = classCode.toUpperCase().match(/^[A-Z]?\d+([A-Z]+)\d*$/);
  return match?.[1] ?? null;
}


export function findClassCode(el: Element): string | null {
  // Timetable: <a href="/homepage/code/R10SC12">
  const link = el.querySelector<HTMLAnchorElement>('a[href*="/homepage/code/"]');
  if (link) return link.getAttribute("href")!.split("/").pop() ?? null;

  // Calendar
  const fromText = el.textContent?.match(/\(([A-Z]\d+[A-Z]+\d*)\)/);
  if (fromText?.[1]) return fromText[1];

  // Calendar fallback
  const relation = el.getAttribute("data-calendar-event-relation");
  if (relation?.startsWith("class-")) return relation.slice("class-".length);

  return null;
}

// subject picky thing
export function matchSubject(letters: string, subjects: Subject[]): Subject | undefined {
  return [...subjects]
    .filter((s) => s.code && letters.startsWith(s.code.toUpperCase()))
    .sort((a, b) => b.code.length - a.code.length)[0];
}

const safeCode = (code: string) => code.toUpperCase().replace(/[^A-Z]/g, "");
const safeColour = (colour: string) => (/^#[0-9a-f]{3,8}$/i.test(colour) ? colour : null);

function buildCss(subjects: Subject[]): string {
  return subjects
    .map((s) => {
      const code = safeCode(s.code);
      const colour = safeColour(s.colour);
      if (!code || !colour) return "";
      return `
[${ATTR}="${code}"]:not(.fc-list-event) { background-color: ${colour} !important; border-color: ${colour} !important; }
[${ATTR}="${code}"] .fc-list-event-dot { border-color: ${colour} !important; }`;
    })
    .join("\n");
}

function labelElements(subjects: Subject[]) {
  for (const el of document.querySelectorAll(`${CANDIDATES}`)) {
    if (el.hasAttribute(ATTR)) continue;
    const code = findClassCode(el);
    const letters = code ? subjectLetters(code) : null;
    const subject = letters ? matchSubject(letters, subjects) : undefined;
    if (subject) el.setAttribute(ATTR, safeCode(subject.code));
  }
}

export function applyClassColours(subjects: Subject[]) {
  injectInlineStyles(buildCss(subjects), STYLE_ID);
  labelElements(subjects);


  let scheduled = false;
  observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      labelElements(subjects);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function removeClassColours() {
  observer?.disconnect();
  observer = null;
  uninjectInlineStyles(STYLE_ID);
  for (const el of document.querySelectorAll(`[${ATTR}]`)) el.removeAttribute(ATTR);
}
