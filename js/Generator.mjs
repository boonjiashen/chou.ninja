import {preload, shuffle} from "./utils.mjs";
import {Track} from "./Track.mjs";

export class Generator {
  next() {
    throw "MethodNotImplementedException";
  }
}

export class GeneratorThatShufflesOnEmpty extends Generator {

  #arr = [];
  #remainders = [];

  constructor(arr) {
    super();
    if (arr.length == 0) {
      throw "IllegalArgumentException";
    }
    this.#arr = arr;
    this.#remainders = arr.slice(0);
  }

  next() {
    if (this.#remainders.length == 0) {
      this.#remainders = this.#arr.slice(0);
      this.#remainders = shuffle(this.#remainders);
    }
    const x = this.#remainders.pop();
    return x;
  }
}

export class LookAheadGenerator extends Generator {

  #preloadedGen = function() {};

  constructor(gen) {
    super();
    this.#preloadedGen = preload(function() {
      return gen.next();
    })
  }

  next() {
    return this.#preloadedGen();
  }
}

export class TrackGenerator extends Generator {

  #exprGenerator = function() {};
  #expr2audio = function() {};

  constructor(exprGenerator, expr2audio) {
    super()
    this.#exprGenerator = exprGenerator;
    this.#expr2audio = expr2audio;
  }

  next() {
    const expression = this.#exprGenerator.next();
    const $audio = this.#expr2audio(expression);

    return new Track(expression, $audio);
  }
}