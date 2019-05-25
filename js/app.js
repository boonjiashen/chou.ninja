// See https://stackoverflow.com/a/2450976/3606378
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// See https://codeburst.io/understanding-memoization-in-3-minutes-2e58daf33a19
function memoize(func){
  var cache = {};
  return function() {
    var key = JSON.stringify(arguments);
    if (cache[key]){
      return cache[key];
    }
    else{
      var val = func.apply(null, arguments);
      cache[key] = val;
      return val;
    }
  }
}

// Expects a generator (function that takes no arguments), and calls it before the user calls
function preload(func) {
  var nextReturn = func();
  return function() {
    var toBeReturned = nextReturn;
    nextReturn = func();
    return toBeReturned;
  }
}

// See: https://stackoverflow.com/a/2383215/3606378
const CounterType = {
  "DAY_OF_MONTH": {"string": "day-of-month", "value": 1},
  "DAY_OF_WEEK": {"string": "day-of-week", "value": 2},
  "PLAIN_NUMBER": {"string": "plain-number", "value": 3}
};

class CounteredExpression {
  constructor(numbers) {
    this.numbers = numbers;
    this.counters = [];
    this.str = null
    this.counterType = null;
  }
}

class DayOfMonthExpression extends CounteredExpression {
  constructor(number) {
    if (number > 31 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this.counters = ["日"];
    this.counterType = CounterType.DAY_OF_MONTH;
  }

  toString() {
    return this.numbers[0] + this.counters[0];
  }
}

class DayOfWeekExpression extends CounteredExpression {
  constructor(number) {
    if (number > 7 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this.counters = ["曜日"];
    this.counterType = CounterType.DAY_OF_WEEK;
  }

  static int2char(i) {
    const map = {
      1: "月",
      2: "火",
      3: "水",
      4: "木",
      5: "金",
      6: "土",
      7: "日"
    }
    return map[i];
  }

  toString() {
    return DayOfWeekExpression.int2char(this.numbers[0]) + this.counters[0];
  }
}

class CounterlessExpression extends CounteredExpression {
  constructor(number) {
    super([number]);
    this.counters = null;
    this.counterType = CounterType.PLAIN_NUMBER;
  }

  toString() {
    return this.numbers[0];
  }
}

class Track {
  constructor(counteredExpression, $audio) {
    this.counteredExpression = counteredExpression;
    this.$audio = $audio;
  }
}

class Generator {
  next() {
    throw "MethodNotImplementedException";
  }
}

class GeneratorThatShufflesOnEmpty extends Generator {
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

class LookAheadGenerator extends Generator {
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

class TrackGenerator extends Generator {
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

  const expressions = [].concat(getDaysOfMonth(), getDaysOfWeek(), getPlainNumbers());
  if (expressions.length == 0) {
    throw "IncorrectUserInputException";
  }

  return expressions;
}

function expr2apiPath(expr) {
  let number = expr.numbers[0];
  let apiPath = null;
  if (expr.counterType == CounterType.PLAIN_NUMBER) {
    apiPath = "https://px0asnk62c.execute-api.ap-northeast-1.amazonaws.com/prod/digit/" + number;
  }
  if (expr.counterType == CounterType.DAY_OF_MONTH) {
    apiPath = "https://px0asnk62c.execute-api.ap-northeast-1.amazonaws.com/prod/day-of-month/" + number;
  }
  if (expr.counterType == CounterType.DAY_OF_WEEK) {
    let char = DayOfWeekExpression.int2char(number);
    apiPath = "https://px0asnk62c.execute-api.ap-northeast-1.amazonaws.com/prod/day-of-week/" + char;
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

class AudioPlayer {
  constructor() {
    const dummyAudio = $("<audio />")[0];
    this._prevAudio = dummyAudio;
  }

  play($audio) {
    this._prevAudio.pause();
    this._prevAudio.currentTime = 0;

    const currAudio = $audio[0];
    currAudio.playbackRate = getCurrentPlaybackRate();
    currAudio.play();
    this._prevAudio = currAudio;
  }
}

const audioPlayer = new AudioPlayer();
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
  $("form.setting input").change(function() {
    initializeTrackGenerator();
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

var getCurrentPlaybackRate = (function() {
  var playbackRateNominal2Float = {
    "slow": 0.8,
    "normal": 1,
    "fast": 1.5
  };
  return function() {
    var nominalPlaybackRate = $(".playbackRate option:selected").val();
    return playbackRateNominal2Float[nominalPlaybackRate];
  };
})();