import EventBase from '@/components/threejs/event/event.base';

export default class EventRender extends EventBase {
  constructor() {
    this.eventId = 'render';
    this.eventName = 'render';
    super(this.eventId, this.eventName);
  }

  start() {
    super.start();
  }

  stop() {
    super.stop();
  }
}
