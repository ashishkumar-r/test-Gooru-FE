import Ember from 'ember';

/**
 * Gooru APP pull out component
 *
 * Component responsible for generating the selekton pull out component,
 * which  have header, footer(Optional), title, close button and more info(Optional).
 * @augments ember/Component
 * see the sample usage below
 * {{#gru-pull-out showPullOut=showPullOut title=title  description=description  showMore=true  as |section| }}
 * {{#if section.isLessContent}}
 * {{custom-less-info-component}}
 * {{else if section.isMoreContent}}
 * {{custom-more-info-component}}
 * {{/if}}
 * {{/gru-pull-out}}
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-pull-out'],

  classNameBindings: ['showLess:gru-pull-out-more'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when the user invoke the pull out.
     */
    onPullOutOpen() {
      this.set('showPullOut', true);
    },

    /**
     * Action triggered when the user click's the more info button.
     */
    showMoreInfo() {
      let component = this;
      component.$().animate(
        {
          right: '0'
        },
        {
          complete: function() {
            component.toggleProperty('showMore');
            component.toggleProperty('showLess');
          }
        }
      );
    },

    /**
     * Action triggered when the user click's the less info button.
     */
    showLessInfo() {
      let component = this;
      const right = 460 - component.$().width();
      component.$().animate(
        {
          right: `${right}px`
        },
        {
          complete: function() {
            component.toggleProperty('showMore');
            component.toggleProperty('showLess');
            component.$().css('right', 'calc(460px - 100%)');
          }
        }
      );
    },

    /**
     * Action triggered when the user close the pull out
     */
    onPullOutClose() {
      this.set('showMore', false);
      this.set('showLess', false);
      this.sendAction('onClosePullOut');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * It indicates the display  status of show more action button.
   * @type {Boolean}
   */
  showMore: false,

  /**
   * It indicates the display  status of show more action button
   * @type {Boolean}
   */
  showLess: false,

  lessContent: {
    isLessContent: true
  },

  moreContent: {
    isMoreContent: true
  },

  showPullOut: false,

  //--------------------------------------------------------------------------
  // Observer
  //
  onChange: Ember.observer('showPullOut', function() {
    if (this.get('showPullOut')) {
      Ember.$('body.application').addClass('no-vertical-scroll');
      let component = this;
      const right = 460 - component.$().width();
      component.$().removeClass('gru-pull-out-hidden');
      component.$().animate(
        {
          right: `${right}px`
        },
        {
          complete: function() {
            component.$().css('right', 'calc(460px - 100%)');
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
            component.$().addClass('gru-pull-out-hidden');
            Ember.$('body.application').removeClass('no-vertical-scroll');
          }
        }
      );
    }
  })
});
