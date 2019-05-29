export class CounteredExpression {
  _numbers = null;
  _counters = [];
  _counterType = null;

  // See: https://stackoverflow.com/a/2383215/3606378
  static CounterType = {
    "DAY_OF_MONTH": {"string": "day-of-month", "value": 1},
    "DAY_OF_WEEK": {"string": "day-of-week", "value": 2},
    "PLAIN_NUMBER": {"string": "plain-number", "value": 3},
    "MONTH_OF_YEAR": {"string": "month-of-year", "value": 4}
  };

  constructor(numbers) {
    this._numbers = numbers;
  }

  get numbers() {
    return this._numbers;
  }

  get counterType() {
    return this._counterType;
  }
}

export class DayOfMonthExpression extends CounteredExpression {
  constructor(number) {
    if (number > 31 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this._counters = ["日"];
    this._counterType = CounteredExpression.CounterType.DAY_OF_MONTH;
  }

  toString() {
    return this._numbers[0] + this._counters[0];
  }
}

export class MonthOfYearExpression extends CounteredExpression {
  constructor(number) {
    if (number > 12 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this._counters = ["月"];
    this._counterType = CounteredExpression.CounterType.MONTH_OF_YEAR;
  }

  toString() {
    return this._numbers[0] + this._counters[0];
  }
}

export class DayOfWeekExpression extends CounteredExpression {

  static #map = {
    1: "月",
    2: "火",
    3: "水",
    4: "木",
    5: "金",
    6: "土",
    7: "日"
  };

  constructor(number) {
    if (number > 7 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this._counters = ["曜日"];
    this._counterType = CounteredExpression.CounterType.DAY_OF_WEEK;
  }

  static int2char(i) {
    return DayOfWeekExpression.#map[i];
  }

  toString() {
    return DayOfWeekExpression.int2char(this._numbers[0]) + this._counters[0];
  }
}

export class CounterlessExpression extends CounteredExpression {
  constructor(number) {
    super([number]);
    this._counters = null;
    this._counterType = CounteredExpression.CounterType.PLAIN_NUMBER;
  }

  toString() {
    return this._numbers[0];
  }
}