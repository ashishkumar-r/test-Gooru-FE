import Ember from 'ember';
import { PLAYER_EVENT_MESSAGE } from 'gooru-web/config/config';
import tenantSsettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(tenantSsettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['player', 'player-pull-up'],
  attributeBindings: ['bgStyle:style'],
  bgStyle: Ember.computed('tenantSettingBg', function() {
    return `background-image: url(${this.get('tenantSettingBg')})`;
  }),

  //--------------------------------------------------------------------------
  //property

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  isLoading: false,
  /**
   * @property {Service} tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    Ember.$(document.body).addClass('iframe-panel');
    component.openPullUp();
  },

  didReceiveAttrs() {
    const component = this;
    /**
     * method used to listen the events from iframe.
     **/
    function receiveMessage(event) {
      if (event.data === PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE) {
        component.send('closePlayer');
      } else if (event.data === PLAYER_EVENT_MESSAGE.GRU_LOADING_COMPLETED) {
        if (!component.get('isDestroyed')) {
          component.set('isLoading', false);
        }
      } else if (event.data.message === PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE) {
        component.closePullUp(event.data.classId);
      }
    }
    window.addEventListener('message', receiveMessage, false);
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    closePlayer: function() {
      const component = this;
      let classId = component.get('classId');
      if (classId) {
        component
          .get('router')
          .transitionTo('student.class.course-map', classId);
      } else {
        component.closePullUp();
      }
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLOSE_PLAYER_CONTAINER);
    }
  },

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    const component = this;
    component.set('isLoading', true);
    component.$().animate(
      {
        bottom: '0'
      },
      400
    );
  },

  closePullUp(data) {
    const component = this;
    if (!component.isDestroyed) {
      component.$().animate(
        {
          bottom: '100%'
        },
        400,
        function() {
          Ember.$(document.body).removeClass('iframe-panel');
          if (data) {
            component
              .get('router')
              .transitionTo('student.class.dashboard', data);
          }
          component.sendAction('onclosePullUp');
        }
      );
    }
  }
});
