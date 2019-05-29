export class AudioPlayer {
  #prevAudio = null;
  #playbackRateGetter = function() {};

  constructor(playbackRateGetter) {
    const dummyAudio = $("<audio />")[0];
    this.#prevAudio = dummyAudio;
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