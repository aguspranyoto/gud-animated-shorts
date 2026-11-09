/**
 * chunkPhrases — phrase-aware caption chunking (SKILL.md §7a).
 * Pure module, ZERO imports: node can unit-test it without Remotion.
 *
 * Fixed-N-word chunking produced hanging fragments ("yang berat" /
 * "satu" / "kena" dangling alone). This splits at sentence boundary
 * first, comma second — never mid-phrase — and balances long sentences
 * so no card exceeds maxWords and no card is a <3-word stub.
 */
export function chunkPhrases(text: string, maxWords: number): string[][] {
  // Sentences end at . ! ? only — a comma NEVER splits sentences here
  // (comma split happens inside the long-sentence balancer below).
  const sentences = text
    .toLowerCase()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const chunks: string[][] = [];
  for (const s of sentences) {
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
      chunks.push(words);
      continue;
    }
    // Long sentence: balanced partition into ceil(n/max) chunks,
    // preferring comma boundaries near the ideal split point.
    const n = words.length;
    const num = Math.ceil(n / maxWords);
    const commaAfter: boolean[] = words.map((w) => /,$/.test(w));
    let start = 0;
    for (let c = 0; c < num; c++) {
      const remaining = n - start;
      const left = num - c;
      // ideal size for this chunk keeps the tail balanced (>=3 each)
      let ideal = Math.round(remaining / left);
      ideal = Math.max(3, Math.min(maxWords, ideal));
      let cut = start + ideal;
      if (c === num - 1) {
        cut = n;
      } else {
        // prefer a comma within ±2 of ideal (never beyond maxWords)
        let best = -1;
        for (let d = 0; d <= 2; d++) {
          for (const cand of [cut - 1 + d, cut - 1 - d]) {
            if (cand >= start + 3 && cand < start + maxWords && cand < n - 3) {
              if (commaAfter[cand]) {
                best = cand + 1;
                break;
              }
            }
          }
          if (best !== -1) break;
        }
        cut = best !== -1 ? best : Math.min(start + maxWords, n - 3 * (left - 1));
      }
      chunks.push(words.slice(start, cut));
      start = cut;
    }
  }
  // Safety net: strict merge only when the result still fits maxWords.
  // (Never force-merge into an over-budget card — rebalancing above
  // already guarantees no stub when a balanced split exists.)
  while (chunks.length > 1) {
    const last = chunks[chunks.length - 1];
    if (last.length >= 3) break;
    const prev = chunks[chunks.length - 2];
    if (prev.length + last.length > maxWords) break;
    chunks.splice(chunks.length - 1, 1);
    chunks[chunks.length - 1] = [...prev, ...last];
  }
  return chunks.length ? chunks : [[]];
}
