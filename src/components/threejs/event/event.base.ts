export default class EventBase {
  eventName: string;
  eventId: string;

  constructor(eventName, eventId) {
    this.eventName = eventName;
    this.eventId = eventId;
  }

  start() {}

  stop() {}
}
