import moment from "moment";

export function getRandomDate() {
  var start = moment(moment().subtract(1, "month"));
  var end = moment();
  var randomDate = new Date(
    start.valueOf() + Math.random() * (end.valueOf() - start.valueOf())
  );
  return randomDate;
}
