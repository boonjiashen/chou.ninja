import {
  CounterlessExpression,
  MonthOfYearExpression,
  DayOfWeekExpression,
  DayOfMonthExpression
} from "./CounteredExpression.mjs";
import {
  ConcatenatedListSupplier,
  ExpressionsSupplier
} from "./Supplier.mjs";
import {range} from "./utils.mjs";

function getSelection(name) {
  return $("input[name=" + name + "]:checked").val();
}

export const NONE = "none";
const daysOfMonthSupplier = new ExpressionsSupplier(
  () => getSelection("dayOfMonth"),
  new Map([
    [NONE, []],
    ["all", range(1, 32)]
  ]),
  DayOfMonthExpression
);

const daysOfWeekSupplier = new ExpressionsSupplier(
  () => getSelection("dayOfWeek"),
  new Map([
    [NONE, []],
    ["all", range(1, 8)]
  ]),
  DayOfWeekExpression
);

const plainNumbersSupplier = new ExpressionsSupplier(
  () => getSelection("plainNumber"),
  new Map([
    [NONE, []],
    ["zeroToTen", range(0, 11)]
  ]),
  CounterlessExpression
);

const monthsOfYearSupplier = new ExpressionsSupplier(
  () => getSelection("monthOfYear"),
  new Map([
    [NONE, []],
    ["all", range(1, 13)]
  ]),
  MonthOfYearExpression
);

export const selectedExpressionsSupplier = new ConcatenatedListSupplier([
  daysOfMonthSupplier,
  daysOfWeekSupplier,
  plainNumbersSupplier,
  monthsOfYearSupplier
]);