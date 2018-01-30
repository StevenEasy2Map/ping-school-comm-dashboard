export class AppSettings {


  public static NODE_SERVER_URL_TEST = window.location.href.toString().includes('heroku') ? 'http://ec2-34-210-83-65.us-west-2.compute.amazonaws.com' : 'http://localhost:8888';
  public static NODE_SERVER_URL_LIVE = window.location.href.toString().includes('heroku') ? 'http://ec2-34-210-83-65.us-west-2.compute.amazonaws.com' : 'http://localhost:8888';
  // public static NODE_SERVER_URL_TEST = 'http://localhost:8888';
  // public static NODE_SERVER_URL_LIVE = 'http://localhost:8888';

  public static QUICKLY_SIGN_API_APPLICATION_CLIENT_ID = 'ahFzfnRoZW1hc3NpdmUtbGl2ZXIYCxILQXBwbGljYXRpb24YgICAgOy3nAoMogEHc2FuZGJveA';
  public static QUICKLY_SIGN_API_APPLICATION_CLIENT_NAME = 'Ping App';
  public static QUICKLY_SIGN_API_APPLICATION_CLIENT_SECRET = 'kIaGPMCjzbobDvzorNdeo2OF8UUgoYhKbBGUaKxT0pO';
  public static QUICKLY_SIGN_API_KEY = 'Mef6BX2WnTC5QswCNIaQxMbsV8aQrrtzxAmEyIqwyjy';


}
