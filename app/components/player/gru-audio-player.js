import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-audio-player'],

  isRecord: false,

  audioUrl: null,

  recorder: null,

  isRecording: false,

  isPause: false,

  actions: {
    onRecord() {
      const component = this;
      var answerObject = component.get('audioUrl');
      if (component.get('isRecording')) {
        component
          .get('recorder')
          .stop()
          .then(audio => {
            component.set('isRecording', false);
            answerObject.audio = audio;
            component.sendAction('onAudioRecorded', audio);
          });
      } else {
        component.recordAudio().then(instance => {
          instance.start();
          component.set('isRecording', true);
          answerObject.isRecorded = true;
          component.set('recorder', instance);
        });
      }
    },

    onPlayAudio() {
      const component = this;
      var answerObject = component.get('audioUrl');
      if (answerObject != null) {
        if (
          answerObject.audio_file_url === null ||
          answerObject.audio_file_url === '' ||
          answerObject.audio
        ) {
          if (answerObject.audio) {
            component.onPlayAndPause(answerObject.audio.audioUrl);
          }
        } else {
          component.onPlayAndPause(answerObject.audio_file_url);
        }
      }
    },
    onPauseAudio() {
      const component = this;
      const audio = component.get('audioRecorder');
      audio.pause();
      component.set('isPause', false);
    }
  },

  onPlayAndPause(file) {
    const component = this;
    let _audio = component.get('audioRecorder');
    if (!_audio) {
      _audio = new Audio(file);
    }
    component.set('audioRecorder', _audio);
    _audio.play();
    component.set('isPause', true);
    _audio.ontimeupdate = function() {
      component
        .$('.audio-player .audio-progress .progress-filling')
        .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
    };
    _audio.addEventListener('ended', () => {
      component.set('isPause', false);
      component.set('audioRecorder', null);
    });
  },
  recordAudio() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks = [];
          window.streamReference = stream;
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
                if (window.streamReference) {
                  window.streamReference
                    .getAudioTracks()
                    .forEach(function(track) {
                      track.stop();
                    });
                }
                window.streamReference = null;
                return resolve({
                  audioBlob,
                  audioUrl,
                  play
                });
              });

              mediaRecorder.stop();
            });
          return {
            start,
            stop,
            state
          };
        });
    } else {
      return null;
    }
  }
});
