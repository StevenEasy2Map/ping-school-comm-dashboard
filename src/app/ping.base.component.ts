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

  copyTextToClipboard(text) {
    const textArea = document.createElement('textarea');

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = '0';

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    let successful = false;

    try {
      successful = document.execCommand('copy');
    } catch (err) {
      console.log('Unable to copy');
    } finally {
      document.body.removeChild(textArea);
      return !!successful;
    }


  }


}
