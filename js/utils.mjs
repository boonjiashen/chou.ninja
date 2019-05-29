// See https://stackoverflow.com/a/2450976/3606378
export function shuffle(array) {
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
export function memoize(func){
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
export function preload(func) {
  var nextReturn = func();
  return function() {
    var toBeReturned = nextReturn;
    nextReturn = func();
    return toBeReturned;
  }
}