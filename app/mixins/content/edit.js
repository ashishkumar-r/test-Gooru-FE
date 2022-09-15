import Ember from 'ember';

/**
 * Properties/functionality in common for content creation
 *
 * @mixin
 */
export default Ember.Mixin.create({
  actions: {
    /**
     * Cancel Edit Content
     */
    cancelEdit: function() {
      this.set('isEditing', false);
      this.set('isErrorScormFile', false);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  addSubscriptions: Ember.on('didInsertElement', function() {
    this._super(...arguments);

    const $container = this.$();
    const $header = $container.find('> header');
    const $window = Ember.$(window);
    const headerTopOffset = $header.offset().top;

    // Add fix header behaviour
    Ember.$(window).on('scroll.edit', function() {
      var scrollTop = $window.scrollTop();
      var headerWidth = $header.css('width');
      var headerPaddingLeft = $header.css('paddingLeft');
      headerWidth = (headerWidth && headerWidth.split('px')[0]) || '100%';

      if (scrollTop >= headerTopOffset) {
        if (!$container.hasClass('fixed-header')) {
          // Add inline styles to preserve the same look
          $header.css({
            width: headerWidth,
            paddingLeft: headerPaddingLeft
          });
          $container.addClass('fixed-header');
        }
      } else {
        if ($container.hasClass('fixed-header')) {
          // Remove any inline styles
          $header.prop('style', '');
          $container.removeClass('fixed-header');
        }
      }
    });
  }),

  removeSubscriptions: Ember.on('willDestroyElement', function() {
    Ember.$(window).off('scroll.edit');
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicate if a course information is in edit mode
   * @property {Boolean}
   */
  isEditing: false
});
