import Ember from 'ember';

/**
 * Taxonomy Tag
 *
 * Component responsible for displaying a taxonomy item as a taxonomy tag
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['taxonomy', 'gru-taxonomy-tag'],

  classNameBindings: [
    'model.isActive:active',
    'model.isReadonly:read-only',
    'model.isRemovable:remove',
    'model.canAdd:add'
  ],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    selectTag: function() {
      if (this.get('onSelect')) {
        this.get('onSelect')(this.get('model'));
      }
    },
    removeTag: function() {
      if (this.get('onRemove')) {
        this.get('onRemove')(this.get('model'));
      }
    },
    addTag: function() {
      if (this.get('onAdd')) {
        this.get('onAdd')(this.get('model'));
      }
    },

    onClickTag(tag) {
      if (this.get('isClassActivity')) {
        this.sendAction('onClickTag', tag);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  setup: Ember.on('didInsertElement', function() {
    this.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover',
      container: 'body'
    });
    if (this.get('hasTooltip')) {
      this.setupTooltip();
    }
  }),

  cleanUp: Ember.on('willDestroyElement', function() {
    const $anchor = this.$('> .content');
    $anchor.off('click');
    $anchor.off('mouseenter');
    $anchor.off('mouseleave');

    // In case a popover was open, it will need to be destroyed
    $anchor.popover('destroy');
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} hasTooltip - Should a tooltip be displayed showing more details for the taxonomy tag?
   */
  hasTooltip: false,

  /**
   * @property {TaxonomyItem} model - Taxonomy tag model
   */
  model: null,

  /**
   * @property {Function} onSelect - Event handler called when the clear/remove icon is selected
   */
  onRemove: null,

  /**
   * @property {Function} onSelect - Event handler called when the tag is selected
   */
  onSelect: null,
  /**
   * @property {Function} onAdd - Event handler called when the tag is added
   */
  onAdd: null,

  /**
   * Maintains the value of popover position
   * @type {String}
   */
  tagPopoverDefaultPosition: 'bottom',

  tooltipLabel: Ember.computed('model', function() {
    const model = this.get('model');
    const label = model.get('data.label');
    const caption = model.get('data.caption');
    const code = model.get('data.code') || model.get('code');
    const frameworkCode =
      model.get('data.frameworkCode') || model.get('frameworkCode');
    return model.data && label && caption
      ? `${label} ${caption}`
      : `${code} ${frameworkCode}`;
  }),

  // -------------------------------------------------------------------------
  // Methods

  setupTooltip: function() {
    var component = this;
    var $anchor = this.$('> .content');
    var isMobile = window.matchMedia('only screen and (max-width: 768px)');
    var isPad = window.matchMedia('only screen and (max-width: 2024px)');
    let tagPopoverDefaultPosition = this.get('tagPopoverDefaultPosition');
    $anchor.attr('data-html', 'true');
    $anchor.popover({
      placement: tagPopoverDefaultPosition,
      content: function() {
        return component.$('.tag-tooltip').html();
      },
      trigger: 'manual',
      container: 'body'
    });

    if (isMobile.matches || isPad.matches) {
      $anchor.on('click', function() {
        var $this = $(this);

        if (!$this.hasClass('list-open') && isMobile.matches) {
          // Close all tag tooltips by simulating a click on them
          $('.gru-taxonomy-tag > .content.list-open').click();
          $this.addClass('list-open').popover('show');
        } else {
          $this.removeClass('list-open').popover('hide');
        }

        if ($this.hasClass('list-open') && isPad.matches) {
          // Close all tag tooltips by simulating a click on them
          $('.gru-taxonomy-tag > .content.list-open').click();
          $this.addClass('list-open').popover('show');
        } else {
          $this.removeClass('list-open').popover('hide');
        }
      });
    } else {
      $anchor.on('mouseenter', function() {
        $(this).popover('show');
      });

      $anchor.on('mouseleave', function() {
        $(this).popover('hide');
      });
    }
  }
});
