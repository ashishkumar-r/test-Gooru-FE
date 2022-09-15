import Ember from 'ember';
/**
 *Data Picker
 *
 *  Component responsible for letting the user select and update a performance option
 *  from a predefined list of options to display different analytic data.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-data-picker'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Set a new option as selected and update the component appearance accordingly
     *
     * @function actions:setOption
     * @param {string} newOption - newly selected option
     * @returns {undefined}
     */
    setOption: function(newOption) {
      if (!newOption.get('readOnly')) {
        if (newOption.get('selected')) {
          this.cleanupOption(newOption);
        } else {
          this.selectOption(newOption);
        }
        this.sendAction('onOptionsChange', this.get('selectedOptions'));
      }
    }
  },
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * List of  options to be displayed by the component
   *
   * @constant {Array}
   */
  options: Ember.A([
    Ember.Object.create({
      value: 'score',
      selected: true,
      readOnly: false,
      isDisabled: false
    }),
    Ember.Object.create({
      value: 'completion',
      selected: false,
      readOnly: false,
      isDisabled: false
    }),
    Ember.Object.create({
      value: 'timeSpent',
      selected: false,
      readOnly: false,
      isDisabled: false
    }),
    Ember.Object.create({
      value: 'reaction',
      selected: false,
      readOnly: false,
      isDisabled: false
    }),
    Ember.Object.create({
      value: 'attempts',
      selected: false,
      readOnly: false,
      isDisabled: false
    })
  ]),

  /**
   * @property {String|Function} onOptionsChange - event handler for when the selected option is changed
   */
  onOptionsChange: null,

  /**
   * Min options for select
   *
   * @constant {Number}
   */
  min: 1,

  /**
   * Max options for select
   *
   * @property {Number}
   */
  max: 1,

  /**
  * Icon displayed
  *
  * @property {String}
  */
  'icon-default': 'fa-circle',

  /**
   * Icon selected
   *
   * @property {String}
   */
  'icon-selected': 'fa-circle',

  /**
   *Computed property to calculate if the length of selectedOptions is less than the max value accepted
   *
   * @property
   */
  isLessThanMaxValue: Ember.computed(
    'max',
    'selectedOptions.length',
    function() {
      return this.get('selectedOptions.length') < this.get('max');
    }
  ),
  /**
   *Computed property to calculate if the length of selectedOptions is grater than the min value accepted
   *
   * @property
   */
  isGreaterThanMinValue: Ember.computed(
    'min',
    'selectedOptions.length',
    function() {
      return this.get('selectedOptions.length') > this.get('min');
    }
  ),
  /**
   *Computed property to calculate if the max length of selectedOptions is equal than the min value accepted
   *
   * @property
   */
  areSingleSelected: Ember.computed('min', 'max', function() {
    return this.get('min') === this.get('max');
  }),
  /**
   *Computed property that return all options selected
   *
   * @property
   */
  selectedOptions: Ember.computed('options.@each.selected', function() {
    return this.get('options').filterBy('selected', true);
  }),

  // -------------------------------------------------------------------------
  // Methods
  /**
   *When unselected  option
   *
   */
  cleanupOption: function(option) {
    if (this.get('isGreaterThanMinValue')) {
      option.set('selected', false);
    }
  },

  /**
   *When select a option
   *
   */
  selectOption: function(option) {
    if (this.get('areSingleSelected')) {
      this.cleanSelectedOptions(this.get('selectedOptions'));
      this.addOption(option);
    } else {
      if (this.get('isLessThanMaxValue')) {
        this.addOption(option);
      }
    }
  },

  /**
   * Selected a option.
   *
   */
  addOption: function(option) {
    option.set('selected', true);
  },
  /**
   * Unselected a option.
   *
   */
  cleanSelectedOptions: function(selectedOptions) {
    selectedOptions.forEach(function(option) {
      option.set('selected', false);
    });
  }
});
