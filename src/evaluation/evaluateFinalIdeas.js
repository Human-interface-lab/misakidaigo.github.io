import { mednickNoveltyScore, graceNoveltyScore } from "./noveltyEvaluator";
import { referenceNgrams } from "./referenceNgrams";

/**
 * 최종 아이디어 리스트 일괄 평가
 * @param {Array} ideas - confirmed 아이디어 n-gram 배열 (배열의 배열)
 * @returns {Array} - [{idea, mednickScore, graceScore}]
 */
export function evaluateFinalIdeas(ideas) {
  return ideas.map(idea => ({
    idea,
    mednickScore: mednickNoveltyScore(idea, referenceNgrams),
    graceScore: graceNoveltyScore(idea, referenceNgrams)
  }));
}