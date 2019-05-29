export class Track {

  #counteredExpression = null;
  #$audio = null;

  constructor(counteredExpression, $audio) {
    this.#counteredExpression = counteredExpression;
    this.#$audio = $audio;
  }

  get counteredExpression() {
    return this.#counteredExpression;
  }

  get $audio() {
    return this.#$audio;
  }
}