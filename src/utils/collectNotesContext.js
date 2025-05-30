// src/utils/collectNotesContext.js

/**
 * 주어진 루트 노트 ID부터 시작해, connections에 의해 확장된
 * 모든 자식 노트를 재귀적으로 수집합니다.
 *
 * @param {string} rootId
 * @param {Array<{id:string}>} notes
 * @param {Array<{from:string,to:string}>} connections
 * @returns {Array} contextNotes
 */
export function collectNotesContext(rootId, notes, connections) {
  const result = [];
  const queue = [rootId];
  const seen = new Set();

  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);

    const note = notes.find(n => n.id === id);
    if (note) {
      result.push(note);
      // 이 노트에서 확장된 자식들을 큐에 추가
      connections
        .filter(c => c.from === id)
        .forEach(c => queue.push(c.to));
    }
  }

  return result;
}
