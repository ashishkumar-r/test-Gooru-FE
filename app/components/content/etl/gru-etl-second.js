import Ember from 'ember';
import { etlFocusOut, etlFocus } from 'gooru-web/utils/utils';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'etl', 'gru-etl-second'],

  tenantService: Ember.inject.service('api-sdk/tenant'),

  tagName: 'article',

  isShowErrorMessage: false,

  estimatedTime: Ember.computed(
    'estimatedMinutes',
    'estimatedHours',
    function() {
      let estimatedMinutes = this.get('estimatedMinutes');
      let estimatedHours = this.get('estimatedHours');
      if (estimatedMinutes || estimatedHours) {
        return !(estimatedHours === '0 hr' && estimatedMinutes === '0 min');
      }
    }
  ),
  isShowFluency: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.fluency_level === 'on';
  }),
  fluenciesData: Ember.computed('fluencyData', function() {
    return this.get('fluencyData.fluency');
  }),

  actions: {
    setFluency(item) {
      const component = this;
      component.sendAction('selectedFluency', item);
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  init: function() {
    this._super(...arguments);
  },
  didInsertElement() {
    const component = this;
    component._super(...arguments);
    var editorClass = '.etl-seconds .etl-label .title-label input';
    const tempData = component.get('tempData');
    const valueHours = component.get('valueHours');
    const valueMins = component.get('valueMins');
    component.$().on('focus', editorClass, function() {
      const hrs = $(`input[name=${valueHours}]`);
      const mins = $(`input[name=${valueMins}]`);
      etlFocus(hrs, mins);
    });
    component.$().on('focusout', editorClass, function() {
      const hrs = $(`input[name=${valueHours}]`);
      const mins = $(`input[name=${valueMins}]`);
      etlFocusOut(hrs, mins, tempData);
      let isErrorMessage = tempData.get('isErrorMessage');
      component.set('isShowErrorMessage', isErrorMessage);
    });
    component.$().on('keypress', editorClass, function(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    });
  },
  /**
   * willDestroyElement events
   */
  willDestroyElement() {
    const component = this;
    var editorClass =
      '.duration-hours .etl-seconds .etl-label .title-label input';
    component.$().off('focusout', editorClass);
    component.$().off('focus', editorClass);
    component.$().off('keypress', editorClass);
  }
});
