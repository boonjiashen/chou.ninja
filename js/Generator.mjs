import {shuffle} from "./utils.mjs";
import {Track} from "./Track.mjs";

export function shuffleOnEmpty(arr) {
  let _arr = arr.slice(0);

  return (function * () {
    while (true) {
      _arr = shuffle(_arr);
      for (let x of _arr) {
        yield x;
      }
    }
  })();
}

export function * lookahead(iterable) {
  const iterator = iterable[Symbol.iterator]();
  let currObj = iterator.next();
  if (currObj.done) {
    return currObj.value;
  }
  let currValue = currObj.value;
  for (let nextValue of iterator) {
    yield currValue;
    currValue = nextValue;
  }
  return currValue;
}

export function cooccurrenceTracks(exprGenerator, expr2audio) {
  const _exprGenerator = exprGenerator;
  const _expr2audio = expr2audio;

  return (function * () {
    for (let expression of _exprGenerator) {
      const $audio = _expr2audio(expression);
      yield new Track(expression, $audio);
    }
  })();
}