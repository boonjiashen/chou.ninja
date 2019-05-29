import {Supplier} from "./Supplier.mjs";

class PlaybackRateSupplier extends Supplier {
  static #playbackRateNominal2Float = {
    "slow": 0.8,
    "normal": 1,
    "fast": 1.5
  };

  get() {
    const nominalPlaybackRate = $("input[name=\"playbackRate\"]:checked").val();
    return PlaybackRateSupplier.#playbackRateNominal2Float[nominalPlaybackRate];
  }
}

export const playbackRateSupplier = new PlaybackRateSupplier();