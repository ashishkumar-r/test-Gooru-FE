import Ember from 'ember';

/**
 * Gooru APP pull up component
 *
 * Component responsible for generating the skeleton pull up component,
 * which  have header, footer(Optional) and close button .
 * @augments ember/Component
 * see the sample usage below
 * {{#gru-pull-up showPullUp=showPullUp  as |pull-up| }}
 * {{/gru-pull-up}}
 */

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gruPullUp', 'gru-pull-out'],

  classNameBindings: ['pullUpType'],
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user close the pull up.
     **/
    closeAll: function() {
      this.sendAction('onClosePullUp');
    },
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose() {
      this.set('showPullUpEx', false);
      this.set('isShowMore', false);
      this.sendAction('onClosePullUp');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUpEx: false,

  /**
   * Propery to show header in pullup component.
   * @property {showPisShowHeaderullUp}
   */
  header: {
    isShowHeader: true
  },

  /**
   * Propery to show pullup body content.
   * @property {isShowBody}
   */
  body: {
    isShowBody: true
  },

  /**
   * @property {pullUpType}
   * Property to identify which pull up currently rendering
   */
  pullUpType: '',

  didInsertElement() {
    this.animatePullUp();
  },

  //--------------------------------------------------------------------------
  // Observer
  //

  /**
   * Observer to check the showPullUp property in component
   **/
  onChange: Ember.observer('showPullUpEx', function() {
    //this.onClosePullUp();
    this.set(
      'showPullUpEx',
      this.get('isShowMore') ? true : this.get('showPullUpEx')
    );
    if (!this.get('isShowMore')) {
      this.animatePullOut();
    }
  }),

  animatePullUp() {
    if (this.get('showPullUpEx')) {
      Ember.$('.gru-pull-up').animate(
        {
          top: '10%'
        },
        850
      );
    } else {
      Ember.$('.gru-pull-up').animate({
        top: '100%'
      });
    }
  },

  animatePullOut() {
    if (this.get('showPullUpEx')) {
      Ember.$('body.application').addClass('no-vertical-scroll');
      let component = this;
      let right, pullUpWidth;
      if ($('body').hasClass('gruHelpPullup')) {
        pullUpWidth = 550;
        right = `${pullUpWidth}` - component.$().width();
      } else {
        pullUpWidth = 650;
        right = `${pullUpWidth}` - component.$().width();
      }
      if (component.get('hasDocument')) {
        pullUpWidth = 1050;
        right = `${pullUpWidth}` - component.$().width();
      }
      //Add class for mobile responsive
      component.$().addClass('gru-pull-out-xs');
      component.$().removeClass('gru-pull-out-hidden');
      component.$().animate(
        {
          right: `${right}px`
        },
        {
          complete: function() {
            component.$().css('right', `calc(${pullUpWidth}px - 100%)`);
          }
        }
      );
    } else {
      let component = this;
      component.$().animate(
        {
          right: '-101%'
        },
        {
          complete: function() {
            component.$().removeClass('gru-pull-out-xs');
            component.$().addClass('gru-pull-out-hidden');
            Ember.$('body.application').removeClass('no-vertical-scroll');
          }
        }
      );
    }
  }
});
