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

function getSelectedExpressions() {
  function getSelection(name) {
    return $("input[name=" + name + "]:checked").val();
  }
  function getDaysOfMonth() {
    let selection =  getSelection("dayOfMonth");
    if ("none" == selection) {
      return [];
    }
    let items = [];
    for (let x = 1; x <= 31; x++) {
      items.push(new DayOfMonthExpression(x));
    }
    return items;
  }

  function getDaysOfWeek() {
    let selection =  getSelection("dayOfWeek");
    if ("none" == selection) {
      return [];
    }
    let items = [];
    for (let x = 1; x <= 7; x++) {
      items.push(new DayOfWeekExpression(x));
    }
    return items;
  }

  function getPlainNumbers() {
    let selection = getSelection("plainNumber");
    if ("none" == selection) {
      return [];
    }
    let items = [];
    for (let x = 0; x <= 10; x++) {
      items.push(new CounterlessExpression(x));
    }
    return items;
  }

  function getMonthsOfYear() {
    let selection = getSelection("monthOfYear");
    if ("none" == selection) {
      return [];
    }
    let items = [];
    for (let x = 1; x <= 12; x++) {
      items.push(new MonthOfYearExpression(x));
    }
    return items;
  }

  const expressions = [].concat(getDaysOfMonth(), getDaysOfWeek(), getPlainNumbers(), getMonthsOfYear());
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