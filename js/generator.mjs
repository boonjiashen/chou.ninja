import {preload, shuffle} from "./utils.mjs";
import {Track} from "./track.mjs";

export class Generator {
  next() {
    throw "MethodNotImplementedException";
  }
}

export class GeneratorThatShufflesOnEmpty extends Generator {
  constructor(arr) {
    super();
    if (arr.length == 0) {
      throw "IllegalArgumentException";
    }
    this._arr = arr;
    this._remainders = arr.slice(0);
  }

  next() {
    if (this._remainders.length == 0) {
      this._remainders = this._arr.slice(0);
      this._remainders = shuffle(this._remainders);
    }
    const x = this._remainders.pop();
    return x;
  }
}

export class LookAheadGenerator extends Generator {
  constructor(gen) {
    super();
    this._preloadedGen = preload(function() {
      return gen.next();
    })
  }

  next() {
    return this._preloadedGen();
  }
}

export class TrackGenerator extends Generator {
  constructor(exprGenerator, expr2audio) {
    super()
    this._exprGenerator = exprGenerator;
    this._expr2audio = expr2audio;
  }

  next() {
    const expression = this._exprGenerator.next();
    const $audio = this._expr2audio(expression);

    return new Track(expression, $audio);
  }
}