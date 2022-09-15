import Ember from 'ember';
import { COMPETENCY_STATUS } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['competency-report-pull-up'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.openPullUp();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when close pull up
     */
    onClosePullUp(closeAll) {
      let component = this;
      component.closePullUp(closeAll);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * @property {title}
   * Property to store pull up title
   */
  title: '',

  /**
   * @property {type}
   * Property to store pull up type
   */
  type: '',

  /**
   * @property {String} competencyStatus
   */
  competencyStatus: Ember.computed('competency', function() {
    let component = this;
    let competency = component.get('competency');
    return COMPETENCY_STATUS[competency.status];
  }),

  /**
   * @property {Boolean} isBadgedCompetency
   */
  isBadgedCompetency: Ember.computed('competency', function() {
    let component = this;
    let competency = component.get('competency');
    return competency.status === 5;
  }),

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  init() {
    let component = this;
    component._super(...arguments);
    let title = component.get('title');
    if (title && !title.string) {
      component.set('title', title.replace(/\./g, ' | '));
    }
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  }
});
