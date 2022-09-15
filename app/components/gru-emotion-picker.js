import Ember from 'ember';
import { EMOTION_VALUES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Emotion picker
 *
 * Component responsible for letting the user select and update an emotion
 * from a predefined list of emotions
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-emotion-picker'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Set a new emotion as selected and update the component appearance accordingly
     *
     * @function actions:setEmotion
     * @param {string} newEmotionValue - newly selected emotion
     * @returns {undefined}
     */
    setEmotion: function(newEmotionValue) {
      let component = this;
      if (!component.get('readOnly')) {
        if (
          !component.get('selectedEmotion') ||
          component.get('selectedEmotion') !== newEmotionValue
        ) {
          component.selectEmotion(newEmotionValue);
          component.sendAction(
            'onChangeEmotion',
            component.get('selectedEmotion')
          );
        }
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Overwrites didInsertElement hook.
   */
  didInsertElement: function() {
    this._super(...arguments);
    const component = this;
    const startEmotion = this.get('startEmotion');

    // Adds tooltip to UI elements (elements with attribute 'data-toggle')
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    // Sets the emotion icon if there is a score for this resource
    if (startEmotion) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        component.selectEmotion(startEmotion);
      });
    }
  },

  didUpdate: function() {
    this._super(...arguments);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * List of emotions to be displayed by the component
   *
   * @constant {Array}
   */
  emotionValues: Ember.computed('likertScalePoints', function() {
    let totalCount = this.get('likertScalePoints');
    let emotionValues = EMOTION_VALUES.slice(0, totalCount);
    if (totalCount < 5) {
      emotionValues[0] = EMOTION_VALUES[0];
      emotionValues[totalCount - 1] = EMOTION_VALUES[EMOTION_VALUES.length - 1];
      if (totalCount === 3) {
        emotionValues[1] = EMOTION_VALUES[2];
      }
      if (totalCount === 4) {
        emotionValues[2] = EMOTION_VALUES[3];
      }
    }
    emotionValues = JSON.parse(JSON.stringify(emotionValues.reverse()));
    emotionValues.forEach((emotional, index) => {
      Ember.set(emotional, 'value', index + 1);
    });
    return emotionValues;
  }),

  likertScalePoints: 5,

  /**
   * @property {String|Function} onChangeEmotion - event handler for when the selected emotion is changed
   */
  onChangeEmotion: null,

  /**
   * @property {?string} selectedEmotion - selected emotion
   */
  selectedEmotion: 0,

  /**
   * @property {number} Initial emotion value
   */
  startEmotion: 0,

  /**
   * Indicates if changes can be made
   * @property {boolean}
   */
  readOnly: false,

  // -------------------------------------------------------------------------
  // Methods

  selectEmotion: function(emotionValue) {
    let selectedAttr = this.$('.emotions-list li')
      .find('.active svg use')
      .attr('xlink:href');
    this.$('.emotions-list li')
      .find('.active svg use')
      .attr('xlink:href', `${selectedAttr}-inactive`);
    this.$('.emotions-list li')
      .find('.active')
      .removeClass('active');
    this.set('selectedEmotion', 0);
    if (emotionValue) {
      this.set('selectedEmotion', emotionValue);
      this.$(`.emotion-${emotionValue}`).toggleClass('active');
      let emotion = this.get('emotionValues').findBy('value', emotionValue);
      this.set('defaultEmoji', emotion.unicode);
      this.$('.emotions-list li')
        .find('.active svg use')
        .attr(
          'xlink:href',
          `/assets/quizzes-addon/emoji-one/emoji.svg#${emotion.unicode}`
        );
    }
  }
});
