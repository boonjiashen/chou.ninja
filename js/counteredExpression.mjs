// See: https://stackoverflow.com/a/2383215/3606378
export const CounterType = {
  "DAY_OF_MONTH": {"string": "day-of-month", "value": 1},
  "DAY_OF_WEEK": {"string": "day-of-week", "value": 2},
  "PLAIN_NUMBER": {"string": "plain-number", "value": 3},
  "MONTH_OF_YEAR": {"string": "month-of-year", "value": 4}
};

export class CounteredExpression {
  _numbers = null;
  _counters = [];
  _counterType = null;
  constructor(numbers) {
    this._numbers = numbers;
  }


}

export class DayOfMonthExpression extends CounteredExpression {
  constructor(number) {
    if (number > 31 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this._counters = ["日"];
    this._counterType = CounterType.DAY_OF_MONTH;
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
    this._counterType = CounterType.MONTH_OF_YEAR;
  }

  toString() {
    return this._numbers[0] + this._counters[0];
  }
}

export class DayOfWeekExpression extends CounteredExpression {
  constructor(number) {
    if (number > 7 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this._counters = ["曜日"];
    this._counterType = CounterType.DAY_OF_WEEK;
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
    return DayOfWeekExpression.int2char(this._numbers[0]) + this._counters[0];
  }
}

export class CounterlessExpression extends CounteredExpression {
  constructor(number) {
    super([number]);
    this._counters = null;
    this._counterType = CounterType.PLAIN_NUMBER;
  }

  toString() {
    return this._numbers[0];
  }
}