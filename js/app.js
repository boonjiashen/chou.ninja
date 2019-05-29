import {
  shuffle,
  memoize
} from "./utils.mjs";
import {
  CounteredExpression,
  DayOfWeekExpression
} from "./CounteredExpression.mjs";
import {
  GeneratorThatShufflesOnEmpty,
  LookAheadGenerator,
  TrackGenerator
} from "./Generator.mjs";
import {
  selectedExpressionsSupplier,
  NONE
} from "./expressionsSupplier.mjs";
import {AudioPlayer} from "./AudioPlayer.mjs";
import {playbackRateSupplier} from "./playbackRateSupplier.mjs";

$(window).on('load', function() {
  main();
});

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

const audioPlayer = new AudioPlayer(() => playbackRateSupplier.get());
let trackGenerator = null;

function getTrackGenerator() {
  let counteredExpressions = shuffle(getSelectedExpressions());
  let expressionGenerator = new GeneratorThatShufflesOnEmpty(counteredExpressions);
  let trackGeneratorWithoutLookAhead = new TrackGenerator(expressionGenerator, expr2audio);
  return new LookAheadGenerator(trackGeneratorWithoutLookAhead);
}

function main() {
  trackGenerator = getTrackGenerator();
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
    trackGenerator = getTrackGenerator();
  })
  $(".clearPlaybackContent").click(function () {
    $(".setting input[value=\"" + NONE + "\"]")
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