import Ember from 'ember';

export default Ember.Mixin.create({
  //--------------------------------------------------------------------------
  // Properties

  /**
   * @property {String} populatedTopPos
   */
  populatedTopPos: '10%',

  /**
   * @property {Boolean} showPullUp
   */
  showPullUp: false,

  //--------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when close pullup
    onClosePullUp() {
      this.closePullUp();
    }
  },

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    const mixin = this;
    let populatedTopPos = mixin.get('populatedTopPos');
    mixin
      .$()
      .animate(
        {
          top: populatedTopPos
        },
        400
      )
      .addClass('pull-up-open');
  },

  /**
   * Method to close pullup
   */
  closePullUp() {
    const mixin = this;
    mixin
      .$()
      .animate(
        {
          top: '100%'
        },
        400,
        function() {
          mixin.set('showPullUp', false);
          mixin.sendAction('onClosePullUp');
        }
      )
      .removeClass('pull-up-open');
  }
});
