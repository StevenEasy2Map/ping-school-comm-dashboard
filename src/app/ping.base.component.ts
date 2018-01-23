export abstract class PingBaseComponent {


  constructor() {
  }


  addDateTimeZone(date: Date) {
    const newDate = new Date(date);
    console.log(newDate.getTimezoneOffset());
    newDate.setTime(newDate.getTime() - newDate.getTimezoneOffset() * 60 * 1000);
    return newDate;
  }


}
