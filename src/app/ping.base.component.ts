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

  getBaseUrl() {
    let location = window.location.href;
    const ind = location.lastIndexOf('/');
    location = location.substring(0, ind);
    console.log(location); // http://localhost:4200/new-event;group_id=66;school_id=113
    return location;
  }

  padNumber(value) {
    const item = parseInt(value, 10);
    if (item < 10) {
      return '0' + item;
    }
    return item + '';
  }


}
