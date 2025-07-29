// evaluation/generateNgrams.js

// n = 3 또는 4로 지정
export function generateNgrams(words, n = 3) {
  function helper(start, path, res) {
    if (path.length === n) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < words.length; i++) {
      helper(i + 1, [...path, words[i]], res);
    }
  }
  const result = [];
  helper(0, [], result);
  return result;
}
