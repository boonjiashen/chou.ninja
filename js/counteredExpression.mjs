// See: https://stackoverflow.com/a/2383215/3606378
export const CounterType = {
  "DAY_OF_MONTH": {"string": "day-of-month", "value": 1},
  "DAY_OF_WEEK": {"string": "day-of-week", "value": 2},
  "PLAIN_NUMBER": {"string": "plain-number", "value": 3},
  "MONTH_OF_YEAR": {"string": "month-of-year", "value": 4}
};

export class CounteredExpression {
  constructor(numbers) {
    this.numbers = numbers;
    this.counters = [];
    this.str = null
    this.counterType = null;
  }
}

export class DayOfMonthExpression extends CounteredExpression {
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

export class MonthOfYearExpression extends CounteredExpression {
  constructor(number) {
    if (number > 12 || number < 1) {
      throw "IllegalArgumentException";
    }
    super([number]);
    this.counters = ["月"];
    this.counterType = CounterType.MONTH_OF_YEAR;
  }

  toString() {
    return this.numbers[0] + this.counters[0];
  }
}

export class DayOfWeekExpression extends CounteredExpression {
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

export class CounterlessExpression extends CounteredExpression {
  constructor(number) {
    super([number]);
    this.counters = null;
    this.counterType = CounterType.PLAIN_NUMBER;
  }

  toString() {
    return this.numbers[0];
  }
}