import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['report', 'student-activity-report'],

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    const component = this;
    component.openPullUp();
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    //Action triggered when click on close pullup
    onClosePullUp(isCloseAll) {
      const component = this;
      component.closePullUp(isCloseAll);
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Boolean} showPullUp
   */
  showPullUp: false,

  /**
   * @property {Object} reportPeriod
   */
  reportPeriod: null,

  /**
   * @property {String} title
   */
  title: '',

  //--------------------------------------------------------------------------
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

  /**
   * Method to close pullup
   */
  closePullUp(isCloseAll) {
    let component = this;
    component.$().animate({
      top: '100%'
    },
    400,
    function() {
      component.set('showPullUp', false);
      if (isCloseAll) {
        component.sendAction('onClosePullUp');
      }
    });
  }
});
