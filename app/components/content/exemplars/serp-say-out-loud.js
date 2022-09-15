import Ember from 'ember';
import { removeHtmlTags } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  classNames: ['exemplars', 'serp-say-out-loud'],

  isEdit: true,

  isDisableAddExemplar: Ember.computed.gte(
    'exemplars.length',
    'answers.length'
  ),

  /**
   * @requires service:api-sdk/media
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  seq: 0,

  isExemplaravail: Ember.computed.gte('isExemplaravail'),

  didInsertElement() {
    this.initializeExemplarItems();
    let component = this;
    this.$('.serp-exemplar').on(
      'click',
      '.exmplar-input-container .record-actions',
      function() {
        component
          .$(this)
          .closest('.exmplar-input-container')
          .find('.audio-uploaded')
          .hide();
      }
    );
  },

  actions: {
    onAddExemplar() {
      const component = this;
      const exemplarIndex = component.get('exemplars.length');
      let text = '';
      let correctAnswer = '';
      if (component.get('answers').length > 0) {
        for (let index = 0; index < component.get('answers').length; index++) {
          const result = component.get('answers')[index];
          var data = component
            .get('exemplars')
            .findBy('audio_text', result.text);
          if (!data) {
            text = component.get('answers')[index].text;
            correctAnswer = component.get('answers')[index].correctAnswer;
            break;
          }
        }
      }
      if (text) {
        component.get('exemplars').pushObject({
          audio_url: null,
          audio_text: removeHtmlTags(text)
        });
        const baseAnswers = [
          {
            answer_text: removeHtmlTags(text),
            correct_answer: correctAnswer,
            answer_seq: exemplarIndex + 1
          }
        ];
        component.injectSerpTool(
          `say-out-loud-${exemplarIndex}`,
          baseAnswers,
          true,
          exemplarIndex
        );
      }
    },
    onRemoveExemplar(index) {
      this.get('exemplars').removeObject(this.get('exemplars')[index]);
      this.set('isExemplaravail', false);
    }
  },

  initializeExemplarItems() {
    const component = this;
    component.get('exemplars').map((exemplar, index) => {
      if (exemplar) {
        const baseAnswers = [
          {
            answer_text: removeHtmlTags(component.get('answers')[index].text),
            correct_answer: component.get('answers')[index].correctAnswer,
            answer_seq: index + 1,
            audio_url: exemplar.audio_url
          }
        ];
        component.injectSerpTool(
          `say-out-loud-${index}`,
          baseAnswers,
          true,
          index
        );
        Ember.run.later(
          this,
          function() {
            component
              .$(`.say-out-loud-${index}`)
              .find('.confirm-text')
              .addClass('audio-saved');
            component
              .$(`.say-out-loud-${index}`)
              .find('.audio-uploaded')
              .show();
          },
          1000
        );
      }
    });
  },

  // -------------------------------------------------------------------------
  // Methods

  injectSerpTool(conatiner, baseAnswers, isPreview = undefined, index) {
    const component = this;
    var user = {
      userId: this.get('userId')
    };
    let accessibilitySettings = JSON.parse(
      window.localStorage.getItem('accessibility_settings')
    );
    var content = {
      contentId: this.get('question.id'),
      contentTitle: this.get('question.title'),
      answer_type: 'say_out_loud',
      answers: baseAnswers,
      isPreview,
      isHighContrast:
        accessibilitySettings && accessibilitySettings.is_high_contrast_enabled
          ? accessibilitySettings.is_high_contrast_enabled
          : false
    };
    window.serp
      .languageDecode()
      .select(
        `.serp-say-out-loud .serp-examplar-accordion-${component.get(
          'seq'
        )} .${conatiner}`
      )
      .dataIn(user, null, content)
      .decoding()
      .render()
      .listener(function(eventData) {
        component.handleDecodingEvent(eventData, index);
      });
  },

  handleDecodingEvent(eventData, index) {
    const component = this;
    if (eventData.decoding_answers && eventData.decoding_answers.length) {
      component
        .$(`.loading-${index}`)
        .find('.loading-spinner')
        .show();
      eventData.decoding_answers.map(decodingAnswer => {
        var data = component.get('exemplars');
        const exemplar = data.findBy('audio_text', decodingAnswer.audio.text);
        if (exemplar) {
          component.$(`.load-${index}`).addClass('de-active');
          return component
            .get('mediaService')
            .uploadContentFile(decodingAnswer.audio.blob, true)
            .then(fileUrl => {
              if (fileUrl) {
                exemplar.audio_text = decodingAnswer.audio.text;
                exemplar.audio_url = fileUrl;
                component
                  .$(`.loading-${index}`)
                  .find('.loading-spinner')
                  .hide();
                component
                  .$(`.say-out-loud-${index}`)
                  .find('.audio-uploaded')
                  .show();
                component
                  .$(`.say-out-loud-${index}`)
                  .find('.confirm-text')
                  .addClass('audio-saved');
              } else {
                component.set('isAudioFail', true);
                return;
              }
            });
        } else {
          return component
            .get('mediaService')
            .uploadContentFile(decodingAnswer.audio.blob, true)
            .then(fileUrl => {
              if (fileUrl) {
                component.get('exemplars').pushObject({
                  audio_url: fileUrl,
                  audio_text: decodingAnswer.audio.text
                });
                component
                  .$(`.loading-${index}`)
                  .find('.loading-spinner')
                  .hide();
                component
                  .$(`.say-out-loud-${index}`)
                  .find('.audio-uploaded')
                  .show();
                component
                  .$(`.say-out-loud-${index}`)
                  .find('.confirm-text')
                  .addClass('audio-saved');
              } else {
                component.set('isAudioFail', true);
                return;
              }
            });
        }
      });
    }
  }
});
