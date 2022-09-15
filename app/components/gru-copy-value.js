import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
/**
 * Copy value
 *
 * Component responsible for copying a value to the clipboard
 */
export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @dependency service:i18n
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  tagName: 'span',
  classNames: ['gru-copy-value'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    let clipboard = new Clipboard('.copy-btn', {
      text: function() {
        return $('#valueToCopy').val();
      }
    });

    $('.copy-btn').tooltip({ placement: 'bottom' });

    clipboard.on('success', function() {
      $('.copy-btn').tooltip('hide');
    });
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {String} value to be copied
   */
  value: null,

  /**
   * @property {String} code with text to be displayed in the tooltip
   */
  tooltipCode: null,

  /**
   * Return the respective text to be displayed as a tooltip
   */
  tooltip: Ember.computed('tooltipCode', function() {
    if (this.get('tooltipCode')) {
      return this.get('i18n').t(this.get('tooltipCode')).string;
    } else {
      return '';
    }
  })
  // -------------------------------------------------------------------------
  // Methods
});
