// noveltyEvaluator.js

/**
 * Mednick(1962) 방식: n-gram 등장 빈도 역수 기반 참신성
 * @param {Array} ideaNgram - 평가할 n-gram 아이디어 (ex. ["Drone", "Personalization", "Cashless"])
 * @param {Array} referenceNgrams - 레퍼런스 n-gram 리스트 (배열)
 * @returns {number} - 참신성 점수 (1: 매우 희귀, 0: 일반적)
 */
export function mednickNoveltyScore(ideaNgram, referenceNgrams) {
  const ideaKey = ideaNgram.slice().sort().join(",");
  const refKeys = referenceNgrams.map(arr => arr.slice().sort().join(","));
  const freq = refKeys.filter(x => x === ideaKey).length;
  if (freq === 0) return 1.0;
  return 1 / freq;
}

/**
 * Grace et al.(2015) 방식: Reference set과의 유사 아이디어 비율 기반 참신성
 * (Jaccard 유사도 0.7 이상이면 유사)
 */
export function graceNoveltyScore(ideaNgram, referenceNgrams) {
  const ideaSet = new Set(ideaNgram);
  let similarCount = 0;
  referenceNgrams.forEach(ref => {
    const refSet = new Set(ref);
    const intersection = new Set([...ideaSet].filter(x => refSet.has(x)));
    const union = new Set([...ideaSet, ...refSet]);
    const sim = union.size === 0 ? 0 : intersection.size / union.size;
    if (sim > 0.7) similarCount += 1;
  });
  if (referenceNgrams.length === 0) return 1;
  return 1 - similarCount / referenceNgrams.length;
}
