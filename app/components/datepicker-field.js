import Ember from 'ember';

/**
 * Datepicker field component
 * @see datepicker-field.hbs
 *
 *
 * @module
 * @typedef {object} DatepickerField
 */
export default Ember.Component.extend({
  /**
   * @property {string} placeholder
   */
  placeholder: null,

  /**
   * @property {string} on select date action
   */
  onSelectDateAction: 'onSelectDate',

  /**
   * @property {string} selected date,  format: 'mm/DD/YYYY'
   */
  selectedDate: null,

  didInsertElement: function() {
    var component = this;
    var $component = component.$('.datepicker-icon');
    $component.datepicker({
      autoclose: true
    });
    $component.datepicker('update', component.get('selectedDate'));
    $component.on('changeDate', function() {
      var dateValue = $component.datepicker('getFormattedDate');
      component.$('.datepicker').val(dateValue);
      component.set('selectedDate', dateValue);
      component.sendAction('onSelectDateAction', dateValue);
    });
  }
});
