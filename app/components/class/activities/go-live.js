import Ember from 'ember';
import { GO_LIVE_EVENT_MESSAGE } from 'gooru-web/config/config';

export default Ember.Component.extend({
  classNames: ['go-live-panel'],

  /**
   * @property {boolean} isShowGoLive
   */
  isShowGoLive: false,

  /**
   * Receive attribute
   */
  didReceiveAttrs() {
    let component = this;

    /**
     * Receive message
     */
    function receivedMessage(ev) {
      if (ev.data.data === GO_LIVE_EVENT_MESSAGE.CLOSE_GO_LIVE_PULLUP) {
        component.set('isShowGoLive', false);
      }
    }
    window.addEventListener('message', receivedMessage, false);
  }
});
