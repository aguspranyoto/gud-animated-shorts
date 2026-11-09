/**
 * chunkPhrases — phrase-aware caption chunking (SKILL.md §7a).
 * Pure module, ZERO imports: node can unit-test it without Remotion.
 *
 * Fixed-N-word chunking produced hanging fragments ("yang berat" /
 * "satu" / "kena" dangling alone). This splits at sentence boundary
 * first, comma/conjunction second — never mid-phrase. Trailing stubs
 * (<3 words) merge back if they fit maxWords + 2.
 */
export function chunkPhrases(text: string, maxWords: number): string[][] {
  const sentences = text
    .toLowerCase()
    .split(/(?<=[.!?,])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks: string[][] = [];
  for (const s of sentences) {
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
      chunks.push(words);
      continue;
    }
    let cur: string[] = [];
    const flush = () => {
      if (cur.length) chunks.push(cur);
      cur = [];
    };
    for (const w of words) {
      cur.push(w);
      const atComma = /,$/.test(w);
      if (cur.length >= maxWords || (atComma && cur.length >= 4)) {
        flush();
      }
    }
    flush();
    const last = chunks[chunks.length - 1];
    if (last && last.length < 3 && chunks.length > 1) {
      const prev = chunks[chunks.length - 2];
      if (prev.length + last.length <= maxWords + 2) {
        chunks.splice(chunks.length - 1, 1);
        chunks[chunks.length - 1] = [...prev, ...last];
      }
    }
  }
  return chunks.length ? chunks : [[]];
}
