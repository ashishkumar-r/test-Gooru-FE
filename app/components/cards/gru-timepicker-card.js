import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['cards', 'gru-timepicker-card'],

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    this._super(...arguments);
    this.numberValidation();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when increment hour
    onIncrementHour() {
      const component = this;
      let hour = component.get('hour');
      let maxHour = component.get('maxHour');
      let minute = component.get('minute');
      if (hour === maxHour) {
        hour = 0;
        minute = 0;
      } else {
        hour++;
      }
      component.set('hour', hour);
      component.set('minute', minute);
    },

    //Action triggered when decrement hour
    onDecrementHour() {
      const component = this;
      let hour = component.get('hour');
      let maxHour = component.get('maxHour');
      let minute = component.get('minute');
      hour = hour === 0 ? maxHour : hour - 1;
      minute = hour === maxHour ? 0 : minute;
      component.set('hour', hour);
      component.set('minute', minute);
    },

    //Action triggered when increment minute
    onIncrementMinute() {
      const component = this;
      let minute = component.get('minute');
      let maxMinute = component.get('maxMinute');
      let hour = component.get('hour');
      let maxHour = component.get('maxHour');
      if (minute === maxMinute) {
        minute = 0;
        hour = hour === maxHour ? 0 : hour + 1;
      } else {
        hour = hour === maxHour ? 0 : hour;
        minute++;
      }
      component.set('minute', minute);
      component.set('hour', hour);
    },

    //Action triggered when decrement minute
    onDecrementMinute() {
      const component = this;
      let minute = component.get('minute');
      let maxMinute = component.get('maxMinute');
      let hour = component.get('hour');
      minute = minute === 0 ? maxMinute : minute - 1;
      hour = minute === maxMinute && hour > 0 ? hour - 1 : hour;
      component.set('minute', minute);
      component.set('hour', hour);
    }
  },

  // -------------------------------------------------------------------------
  // Function

  /**
   * @function numberValidation
   * Method to only accept number
   */

  numberValidation() {
    const component = this;
    component.$('.time-value').keypress(function(event) {
      // 0 means key without character input, 8 is backspace, 48-57 are numbers
      let keyCode =
        typeof event.which === 'number' ? event.which : event.keyCode;
      return keyCode === 0 || keyCode === 8 || (keyCode >= 48 && keyCode <= 57);
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} maxHour
   */
  maxHour: 24,

  /**
   * @property {Number} maxMinute
   */
  maxMinute: 59,

  /**
   * @property {Number} hour
   */
  hour: 0,

  /**
   * @property {Number} minute
   */
  minute: 0
});
