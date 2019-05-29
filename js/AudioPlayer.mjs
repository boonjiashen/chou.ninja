export class AudioPlayer {
  #prevAudio = $("<audio />")[0];
  #playbackRateGetter = function() {};

  constructor(playbackRateGetter) {
    this.#playbackRateGetter = playbackRateGetter;
  }

  play($audio) {
    this.#prevAudio.pause();
    this.#prevAudio.currentTime = 0;

    const currAudio = $audio[0];
    currAudio.playbackRate = this.#playbackRateGetter();
    currAudio.play();
    this.#prevAudio = currAudio;
  }
}
