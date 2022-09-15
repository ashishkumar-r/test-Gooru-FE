import Ember from 'ember';
import Answer from 'gooru-web/models/content/builder/match-the-following';

export default Ember.Component.extend({
  /**
   * @property {MediaService} Media service API SDK
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  classNames: ['content', 'questions', 'answers', 'gru-match-question'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    component.resetValue();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      const selectedOptions = this.get('selectedOptions');
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        leftValue: null,
        rightValue: null,
        leftValueFormat: selectedOptions.get('left') || null,
        rightValueFormat: selectedOptions.get('right') || null,
        rightValShuffleOrder: 'random',
        text: 'text',
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    },

    // Remove existing answer
    removeChoice: function(answer) {
      this.get('answers').removeObject(answer);
      this.resetValue();
    },

    selectFile: function(answer, side, file) {
      let component = this;
      let imageIdPromise = new Ember.RSVP.resolve(file);
      imageIdPromise = component.get('mediaService').uploadContentFile(file);
      imageIdPromise.then(function(filename) {
        if (side === 'left') {
          answer.set('leftValue', filename);
          answer.set('leftValueFormat', 'image');
        } else {
          answer.set('rightValue', filename);
          answer.set('rightValueFormat', 'image');
        }
        component.resetValue();
      });
    },

    resetImage: function(answer, side) {
      if (side === 'left') {
        answer.set('leftValue', null);
        answer.set('leftValueFormat', null);
      } else {
        answer.set('rightValue', null);
        answer.set('rightValueFormat', null);
      }
      this.resetValue();
    },

    onSelectOption(option, keyName) {
      const selectedOptions = this.get('selectedOptions');
      selectedOptions.setProperties({
        [keyName]: option.id
      });
      const answers = this.get('answers');
      answers.forEach(item => {
        item.setProperties({
          leftValueFormat: selectedOptions.get('left') || null,
          rightValueFormat: selectedOptions.get('right') || null
        });
      });
    }
  },

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Question answers
   */
  answers: null,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  /**
   * List of error messages to present to the user for conditions that the loaded image does not meet
   * @prop {String[]}
   */
  filePickerErrors: Ember.A(),

  /**
   * @param {Boolean } isLeftSideFileUpload - value used to check if can able to upload file on left side
   */
  isLeftSideFileUpload: true,

  /**
   * @param {Boolean } isRightSideFileUpload - value used to check if can able to upload file on right side
   */
  isRightSideFileUpload: true,

  /**
   * @param {Boolean } isLeftSideDisableInput - value used to check if the left side input box is disable or not
   */
  isLeftSideDisableInput: false,

  /**
   * @param {Boolean } isRightSideDisableInput - value used to check if the right side input box is disable or not
   */
  isRightSideDisableInput: false,

  matchOptions: Ember.A([
    {
      id: 'image',
      name: 'Image'
    },
    {
      id: 'text',
      name: 'Text'
    }
  ]),

  selectedOptions: Ember.computed('answers', function() {
    const defaultOptions = Ember.Object.create({
      left: 'text',
      right: 'text'
    });
    const answers = this.get('answers');
    if (answers && answers.length) {
      defaultOptions.set('left', answers[0].leftValueFormat);
      defaultOptions.set('right', answers[0].rightValueFormat);
    }
    return defaultOptions;
  }),

  // -------------------------------------------------------------------------
  // Methods

  resetValue() {
    let component = this;
    let answers = component.get('answers');
    let leftValueImageAnswers = answers
      ? answers.filterBy('leftValueFormat', 'image')
      : [];
    let rightValueImageAnswers = answers
      ? answers.filterBy('rightValueFormat', 'image')
      : [];
    let leftValueTextAnswers = answers
      ? answers.filterBy('leftValueFormat', 'text')
      : [];
    let rightValueTextAnswers = answers
      ? answers.filterBy('rightValueFormat', 'text')
      : [];
    component.set('isLeftSideDisableInput', leftValueImageAnswers.length > 0);
    component.set('isRightSideDisableInput', rightValueImageAnswers.length > 0);
    component.set('isLeftSideFileUpload', !(leftValueTextAnswers.length > 0));
    component.set('isRightSideFileUpload', !(rightValueTextAnswers.length > 0));
  }
});
