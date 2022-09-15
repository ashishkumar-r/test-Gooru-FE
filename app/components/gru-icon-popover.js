import Ember from 'ember';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-icon-popover', 'material-icons'],

  classNameBindings: ['name'],

  tagName: 'i',

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Icon name
   * @property {string}
   */
  name: null,

  attributeBindings: ['dataToggle:data-toggle'],

  dataToggle: 'popover',

  placement: 'top',

  clipboardEvents: ['success', 'error'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {string} type
   */
  key: null,

  /**
   * @property {string} template to be used for the popover window
   */
  template: Ember.computed('key', function() {
    return `<div class="gru-icon-popover-content">
    <span class='lead'><b>${this.get('i18n').t(
    `gru-icon-popover.${this.get('key')}-title`
  )}</b></span>
    <p>${this.get('i18n').t(`gru-icon-popover.${this.get('key')}-content`)}</p>
   </div>`;
  }),

  // -------------------------------------------------------------------------
  // Methods

  getTemplate: function() {
    return `<div class="gru-icon-popover-window popover" role="tooltip">
      <div class="arrow"></div>
      <h3 class="popover-title"></h3>
      <div class="popover-content"></div>
    </div>`;
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Overwrites didInsertElement hook to add clipboard and popover functionality
   */

  didInsertElement: function() {
    var component = this;
    component.$().popover({
      animation: false,
      placement: component.get('placement'),
      html: true,
      template: component.get('getTemplate')(),
      content: function() {
        return component.get('template');
      }
    });
  },
  // -------------------------------------------------------------------------
  // Events

  /**
   * Overwrites willDestroyElement hook. Destroys popover instance
   */
  willDestroyElement: function() {
    this.$().popover('destroy');
  }
});
