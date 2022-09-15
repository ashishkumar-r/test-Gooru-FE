import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['cards', 'question-preview-card'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isShowCorrectAnswer
   */
  isShowCorrectAnswer: false,
  /**
   * @property {Boolean} isPause
   */
  isPause: false,
  /*
   * Hold the audio details
   */
  audioRecorder: null,
  /**
   * @property {Array} to get existing attachments
   */
  attachments: Ember.computed(function() {
    return this.get('question.exemplarDocs');
  }),

  classData: null,

  collection: null,

  /**
   * @property {Boolean} isShowFeedback
   */
  isShowFeedback: false,

  didInsertElement() {
    if (this.get('question.type') === 'SERP_ID') {
      for (
        let index = 0;
        index < this.get('question.exemplarDocs').length;
        index++
      ) {
        const element = this.get('question.exemplarDocs')[index];
        element.correct_answer.map(data => {
          this.hightLightDefaultWord(data.text, index, 'identify-digraph');
          return data;
        });
      }
    }
  },
  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  taxonomyTags: Ember.computed('question.standards.[]', function() {
    var standards = this.get('question.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
    }
    return TaxonomyTag.getTaxonomyTags(standards);
  }),
  /**
   * @property {answerDetails[]} List of answer of details
   */
  answerDetails: Ember.computed('question', function() {
    const component = this;
    if (component.get('question.answerDetails')) {
      let answerResult = component.get('question.answerDetails');
      return answerResult.map(function(choice) {
        let data = Ember.Object.create({
          answer_text: choice.answer_text,
          answer_category: choice.answer_category,
          answer_type: 'text',
          correct_answer: ''
        });

        if (
          choice.answer_text.indexOf('[]') !== -1 &&
          choice.correct_answer.length > 0
        ) {
          let answerText = choice.answer_text.split('[]');
          let correctAnswer = choice.correct_answer;
          let values = '';
          answerText.forEach(function(item, index) {
            if (correctAnswer[index]) {
              values += `${item}[${correctAnswer[index]}]`;
            }
          });

          data.set('answer_text', values);
        }
        return data;
      });
    }
  }),
  //Actions
  actions: {
    //Action triggered when play audio
    onPlayAudio(container, url, index, exemplarIndex) {
      const component = this;
      if (this.get('question.type') === 'SERP_ID') {
        let _audio = component.get('audioRecorder');
        if (
          !_audio ||
          component.get('answerIndex') !== index ||
          component.get('playerIndex') !== exemplarIndex
        ) {
          _audio = new Audio(url);
          component.set('answerIndex', index);
          component.set('playerIndex', exemplarIndex);
        }
        component.set('audioRecorder', _audio);
        _audio.play();
        component.set('isPause', true);
        _audio.ontimeupdate = function() {
          component
            .$(
              `.answer-container .${container} .audio-progress .progress-filling`
            )
            .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
        };
        _audio.addEventListener('ended', () => {
          component.set('isPause', false);
        });
      } else {
        let _audio = component.get('audioRecorder');
        if (!_audio || component.get('answerIndex') !== index) {
          _audio = new Audio(url);
          component.set('answerIndex', index);
        }
        component.set('audioRecorder', _audio);
        _audio.play();
        component.set('isPause', true);
        _audio.ontimeupdate = function() {
          component
            .$(
              `.answer-container .${container} .audio-progress .progress-filling`
            )
            .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
        };
        _audio.addEventListener('ended', () => {
          component.set('isPause', false);
        });
      }
    },
    //Action triggered when pause audio
    onPauseAudio() {
      const component = this;
      const audio = component.get('audioRecorder');
      audio.pause();
      component.set('isPause', false);
    }
  },
  hightLightDefaultWord(text, answerIndex, selectedClass) {
    var component = this;
    let innerHTML = '';
    let html = `<span class="correct">${text}</span>`;
    if (component.$(`.${selectedClass} .answer-edit-${answerIndex}`)[0]) {
      component
        .$(`.${selectedClass} .answer-edit-${answerIndex}`)[0]
        .childNodes.forEach(childNode => {
          if (childNode.data) {
            innerHTML = innerHTML + childNode.data.replace(text, $.trim(html));
          } else if (childNode.data) {
            innerHTML = innerHTML + childNode.data;
          } else {
            innerHTML = innerHTML + childNode.outerHTML;
          }
        });
      component
        .$(`.${selectedClass} .answer-edit-${answerIndex}`)
        .html(innerHTML);
    }
  }
});
