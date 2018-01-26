export abstract class PingBaseComponent {

  loading = true;


  constructor() {
  }


  addDateTimeZone(date: Date) {
    const newDate = new Date(date);
    console.log(newDate.getTimezoneOffset());
    newDate.setTime(newDate.getTime() - newDate.getTimezoneOffset() * 60 * 1000);
    return newDate;
  }

  padNumber(value) {
    const item = parseInt(value, 10);
    if (item < 10) {
      return '0' + item;
    }
    return item + '';
  }


}
