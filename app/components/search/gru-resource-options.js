import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-resource-options'],

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * selectOption selects menu option
     */
    selectOption: function(option) {
      this.sendAction('onSelectedOption', option);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Types of question selected
   *  @property {array} selectedOptionTypes
   *
   */
  selectedOptionTypes: Ember.A([]),

  /**
   * True if video option is selected
   *  @property {boolean} videoSelected
   *
   */

  videoSelected: Ember.computed('selectedOptionTypes.[]', function() {
    const selectedOptions = this.get('selectedOptionTypes');
    return selectedOptions.includes('video');
  }),

  /**
   * True if web-page option is selected
   *  @property {boolean} webPageSelected
   *
   */

  webPageSelected: Ember.computed('selectedOptionTypes.[]', function() {
    const selectedOptions = this.get('selectedOptionTypes');
    return selectedOptions.includes('webpage');
  }),

  /**
   * True if interactive option is selected
   *  @property {boolean} interactiveSelected
   *
   */

  interactiveSelected: Ember.computed('selectedOptionTypes.[]', function() {
    const selectedOptions = this.get('selectedOptionTypes');
    return selectedOptions.includes('interactive');
  }),

  /**
   * True if image option is selected
   *  @property {boolean} fibSelected
   *
   */

  imageSelected: Ember.computed('selectedOptionTypes.[]', function() {
    const selectedOptions = this.get('selectedOptionTypes');
    return selectedOptions.includes('image');
  }),

  /**
   * True if text option is selected
   *  @property {boolean} textSelected
   *
   */

  textSelected: Ember.computed('selectedOptionTypes.[]', function() {
    const selectedOptions = this.get('selectedOptionTypes');
    return selectedOptions.includes('text');
  }),

  /**
   * True if audio option is selected
   *  @property {boolean} audioSelected
   *
   */

  audioSelected: Ember.computed('selectedOptionTypes.[]', function() {
    const selectedOptions = this.get('selectedOptionTypes');
    return selectedOptions.includes('audio');
  }),

  /**
   * True if interactiveVideo option is selected
   *  @property {boolean} interactiveVideoSelected
   *
   */

  interactiveVideoSelected: Ember.computed(
    'selectedOptionTypes.[]',
    function() {
      const selectedOptions = this.get('selectedOptionTypes');
      return selectedOptions.includes('h5p_interactive_video');
    }
  ),

  /**
   * True if interactiveSlide option is selected
   *  @property {boolean} interactiveSlideSelected
   *
   */

  interactiveSlideSelected: Ember.computed(
    'selectedOptionTypes.[]',
    function() {
      const selectedOptions = this.get('selectedOptionTypes');
      return selectedOptions.includes('h5p_interactive_slide');
    }
  ),

  /**
   * True if interactivePersonalityQuiz option is selected
   *  @property {boolean} interactivePersonalityQuizSelected
   *
   */

  interactivePersonalityQuizSelected: Ember.computed(
    'selectedOptionTypes.[]',
    function() {
      const selectedOptions = this.get('selectedOptionTypes');
      return selectedOptions.includes('h5p_interactive_personality_quiz');
    }
  ),

  /**
   * True if dragAndDropResource option is selected
   *  @property {boolean} dragAndDropResourceSelected
   *
   */

  dragAndDropResourceSelected: Ember.computed(
    'selectedOptionTypes.[]',
    function() {
      const selectedOptions = this.get('selectedOptionTypes');
      return selectedOptions.includes('h5p_drag_and_drop_resource');
    }
  ),

  visibilityContentTypes: Ember.computed.alias(
    'configuration.visibility_content_types'
  ),
  resourceTypes: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    return visibilityContentTypes.other_resources;
  }),

  interactiveResourceTypes: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const visibilityContentTypes =
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.visibility_content_types
        ? tenantSettings.ui_element_visibility_settings.visibility_content_types
        : this.get('visibilityContentTypes');
    return visibilityContentTypes.interactive_resources;
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
