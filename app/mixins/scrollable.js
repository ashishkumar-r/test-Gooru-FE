import Ember from 'ember';

/**
 * @typedef {Object} ScrollableMixin
 */
export default Ember.Mixin.create({
  bindScrolling: function(opts) {
    opts = opts || { delay: 100 };

    const onScroll = function() {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;
      if (bottom && opts.onScrollToBottom) {
        opts.onScrollToBottom();
      }
      if (opts.onScroll) {
        opts.onScroll();
      }
    };

    $(document).bind('touchmove', onScroll);
    $(window).bind('scroll', onScroll);
  },

  unbindScrolling: function() {
    $(window).unbind('scroll');
    $(document).unbind('touchmove');
  }
});
