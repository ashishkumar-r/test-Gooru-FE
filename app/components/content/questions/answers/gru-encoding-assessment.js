import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-encoding-assessment'],

  /*
   * Check is Audio Recorded or Stopped
   */
  isRecorded: true,
  recorder: null,
  /**
   * @property {Boolean} isPause
   */
  isPause: false,
  /*
   * Hold the audio details
   */
  audioRecorder: null,

  didInsertElement() {
    var ansLength = this.get('answers').length;
    if (ansLength === 0) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        audio: '',
        audioUrl: '',
        isRecorded: false,
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    }
  },
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        audio: '',
        audioUrl: '',
        isRecorded: false,
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    },
    //Remove existing answer
    removeChoice: function(answer) {
      this.get('answers').removeObject(answer);
    },

    encodingvoice: function(index) {
      const component = this;
      if (!this.get('isRecorded')) {
        this.get('answers')[index].set('audio', this.get('recorder').stop());
        component
          .$(`.recorder-${index}`)
          .removeClass('recording')
          .addClass('enable');
        this.set('isRecorded', true);
        this.get('answers')[index].set('isRecorded', true);
      } else {
        this.recordAudio().then(instance => {
          instance.start();
          component
            .$(`.recorder-${index}`)
            .removeClass('enable')
            .addClass('recording');
          this.set('recorder', instance);
          this.set('isRecorded', false);
        });
      }
    },

    playaudio: function(index) {
      const component = this;
      if (
        this.get('answers')[index].hasOwnProperty('isRecorded') &&
        this.get('answers')[index].isRecorded
      ) {
        this.get('answers')[index].audio.then(instance => {
          let audio = component.get('audioRecorder');
          let url = instance.audioUrl;
          if (
            !audio ||
            component.get('answerIndex') !== index ||
            component.get('playerUrl') !== url
          ) {
            audio = new Audio(url);
            component.set('answerIndex', index);
            component.set('playerUrl', url);
          }
          component.set('audioRecorder', audio);
          audio.play();
          component.set('isPause', true);
          audio.ontimeupdate = function() {
            component
              .$(`.play${index}`)
              .css('width', `${(audio.currentTime / audio.duration) * 100}%`);
          };
          audio.addEventListener('ended', () => {
            component.set('isPause', false);
          });
        });
      } else {
        let audio = component.get('audioRecorder');
        let url = this.get('answers')[index].audioUrl;
        if (
          !audio ||
          component.get('answerIndex') !== index ||
          component.get('playerUrl') !== url
        ) {
          audio = new Audio(url);
          component.set('answerIndex', index);
          component.set('playerUrl', url);
        }
        component.set('audioRecorder', audio);
        audio.play();
        component.set('isPause', true);
        audio.ontimeupdate = function() {
          component
            .$(`.play${index}`)
            .css('width', `${(audio.currentTime / audio.duration) * 100}%`);
          audio.addEventListener('ended', () => {
            component.set('isPause', false);
          });
        };
      }
    },
    //Action triggered when pause audio
    pauseAudio: function() {
      const component = this;
      const audio = component.get('audioRecorder');
      audio.pause();
      component.set('isPause', false);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: null,
  /**
   * Multiple Choice max answers
   * */
  maxAnswers: 10,

  /**
   * Is in edit mode
   */
  editMode: false,

  /**
   * @property {boolean}
   */
  disableEditorButtons: Ember.computed.not('showAdvancedEditor'),

  /**
   * @type {Ember.A}
   */
  hasLimitAnswers: Ember.computed('answers.[]', function() {
    return this.get('answers').length >= this.get('maxAnswers');
  }),

  recordAudio() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];
          mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
          });

          const start = () => mediaRecorder.start();

          const state = mediaRecorder.state;

          const stop = () =>
            new Promise(resolve => {
              mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, {
                  type: 'audio/mp3'
                });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                const play = () => audio.play();
                resolve({ audioBlob, audioUrl, play });
              });

              mediaRecorder.stop();
            });
          return { start, stop, state };
        });
    } else {
      return null;
    }
  }
});
