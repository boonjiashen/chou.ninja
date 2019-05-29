import {
  shuffle,
  memoize,
  preload
} from "./utils.mjs";
import {
  CounterlessExpression,
  CounteredExpression,
  MonthOfYearExpression,
  DayOfWeekExpression,
  DayOfMonthExpression
} from "./CounteredExpression.mjs";
import {
  GeneratorThatShufflesOnEmpty,
  LookAheadGenerator,
  TrackGenerator
} from "./Generator.mjs";
import {AudioPlayer} from "./AudioPlayer.mjs";

$(window).on('load', function() {
  main();
});

class Supplier {
  get() {
    throw "MethodNotImplementedException";
  }
}

class ExpressionsSupplier extends Supplier {

  _selectionGetter = function() {};
  _selection2range = {
    "none": []
  }
  _Class = null;

  constructor(selectionGetter, selection2range, Class) {
    super();
    this._selectionGetter = selectionGetter;
    this._selection2range = selection2range;
    this._Class = Class;
  }

  get() {
    const selection = this._selectionGetter();
    const range = this._selection2range[selection];
    let expressions = [];
    for (let i = 0; i < range.length; ++i) {
      const constructorArgs = range[i];
      const item = new this._Class(constructorArgs);
      expressions.push(item);
    }

    return expressions;
  }
}

function getSelection(name) {
  return $("input[name=" + name + "]:checked").val();
}

// Returns [start, start + 1, ..., end - 1]
function range(start, end) {
  return Array(end - start).fill().map((_, idx) => start + idx)
}

const daysOfMonthSupplier = new ExpressionsSupplier(
  function() {
    return getSelection("dayOfMonth");
  },
  {
    "none": [],
    "all": range(1, 32)
  },
  DayOfMonthExpression
);

const daysOfWeekSupplier = new ExpressionsSupplier(
  function() {
    return getSelection("dayOfWeek");
  },
  {
    "none": [],
    "all": range(1, 8)
  },
  DayOfWeekExpression
);

const plainNumbersSupplier = new ExpressionsSupplier(
  function() {
    return getSelection("plainNumber");
  },
  {
    "none": [],
    "zeroToTen": range(0, 11)
  },
  CounterlessExpression
);

const monthsOfYearSupplier = new ExpressionsSupplier(
  function() {
    return getSelection("monthOfYear");
  },
  {
    "none": [],
    "all": range(1, 13)
  },
  MonthOfYearExpression
);

class ConcatenatedListSupplier extends Supplier {
  #listSuppliers = [];

  constructor(listSuppliers) {
    super();
    this.#listSuppliers = listSuppliers;
  }

  get() {
    let result = [];
    for (let i = 0; i < this.#listSuppliers.length; ++i) {
      const listSupplier = this.#listSuppliers[i];
      const list = listSupplier.get();
      result.push(...list);
    }

    return result;
  }
}

const selectedExpressionsSupplier = new ConcatenatedListSupplier([
  daysOfMonthSupplier,
  daysOfWeekSupplier,
  plainNumbersSupplier,
  monthsOfYearSupplier
  ]);

function getSelectedExpressions() {
  const expressions = selectedExpressionsSupplier.get();
  if (expressions.length == 0) {
    throw "IncorrectUserInputException";
  }

  return expressions;
}

function expr2apiPath(expr) {
  const API_PREFIX = "https://6xeipdrp36.execute-api.ap-northeast-1.amazonaws.com/Prod"
  let number = expr.numbers[0];
  let apiPath = null;
  if (expr.counterType == CounteredExpression.CounterType.PLAIN_NUMBER) {
    apiPath = API_PREFIX + "/digit/" + number;
  }
  if (expr.counterType == CounteredExpression.CounterType.DAY_OF_MONTH) {
    apiPath = API_PREFIX + "/day-of-month/" + number;
  }
  if (expr.counterType == CounteredExpression.CounterType.DAY_OF_WEEK) {
    let char = DayOfWeekExpression.int2char(number);
    apiPath = API_PREFIX + "/day-of-week/" + char;
  }
  if (expr.counterType == CounteredExpression.CounterType.MONTH_OF_YEAR) {
    apiPath = API_PREFIX + "/month-of-year/" + number;
  }
  return apiPath;
}

var expr2audio = memoize(function(expr) {
  let src = expr2apiPath(expr);
  var source = $("<source />")
    .attr("src", src)
    .attr("type", "audio/mpeg");
  var audio = $("<audio />")
    .attr("id", "audio-" + expr.toString())
    .attr("preload", "auto")
    .append(source);

  return audio;
});

const getCurrentPlaybackRate = (function() {
  const playbackRateNominal2Float = {
    "slow": 0.8,
    "normal": 1,
    "fast": 1.5
  };
  return function() {
    const nominalPlaybackRate = $("input[name=\"playbackRate\"]:checked").val();
    return playbackRateNominal2Float[nominalPlaybackRate];
  };
})();

const audioPlayer = new AudioPlayer(getCurrentPlaybackRate);
let trackGenerator = null;
function initializeTrackGenerator() {
  let counteredExpressions = shuffle(getSelectedExpressions());
  let expressionGenerator = new GeneratorThatShufflesOnEmpty(counteredExpressions);
  let trackGeneratorWithoutLookAhead = new TrackGenerator(expressionGenerator, expr2audio)
  trackGenerator = new LookAheadGenerator(trackGeneratorWithoutLookAhead);
}

function main() {
  initializeTrackGenerator();
  $(".buttons > button")
    .mousedown(function() {
      const track = trackGenerator.next();
      const expr = track.counteredExpression;
      const $audio = track.$audio;
      audioPlayer.play($audio);
      displayAnswer(expr);
      appendToHistory(expr, $audio);
    });
  $(".setting input").change(function() {
    initializeTrackGenerator();
  })
  $(".clearPlaybackContent").click(function () {
    $(".setting input[value='none']")
      .prop('checked', true)
      .change();
  })
}

function displayAnswer(expr) {
  $(".answer").show();
  $(".answer > .suffix")
    .empty()
    .text(expr.toString());
}

function appendToHistory(expr, $audio) {
  function getHistoryRecord(expr, $audio) {
    var transcript = $("<span />")
      .text(expr.toString())
      .attr("lang", "ja");
    var anchor = $("<a />")
      .attr("href", "javascript:void(0);")
      .text("[Hear again]")
      .attr("lang", "en")
      .mousedown(function() {
        audioPlayer.play($audio);
      });
    var suffix = $("<span />")
      .append(anchor);

    return $("<li />")
      .append(transcript, " ", suffix);
  }

  $(".history").show();
  const historyRecord = getHistoryRecord(expr, $audio);
  $(".history > ul").prepend(historyRecord);
}