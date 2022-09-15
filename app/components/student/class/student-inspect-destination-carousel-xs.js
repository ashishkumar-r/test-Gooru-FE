import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['student-inspect-carousel-slider'],

  type: 'proficiency',

  isAudioPlaying: false,

  descAudioURLXS: null,

  didInsertElement() {
    let component = this;
    this.$('#carouselExampleSlidesOnly').carousel();
    let taxonomyGradeList = this.get('activeGrade');
    if (
      taxonomyGradeList &&
      taxonomyGradeList.displayGuide &&
      taxonomyGradeList.displayGuide.getstarted_desc_audio_url
    ) {
      this.set(
        'descAudioURLXS',
        taxonomyGradeList.displayGuide.getstarted_desc_audio_url
      );
    }
    let olList = [];
    if (
      taxonomyGradeList &&
      taxonomyGradeList.displayGuide &&
      taxonomyGradeList.displayGuide.getstarted_desc_selector_animation_config
    ) {
      var customDiv = $('<ol/>').html(taxonomyGradeList.getStartedDescription);
      taxonomyGradeList.displayGuide.getstarted_desc_selector_animation_config.map(
        item => {
          const activeEl = customDiv.find(`${item.selector}`);
          olList.push(activeEl[0]);
        }
      );
    }
    this.set('getStartedDescriptionXS', olList);
    Ember.run.later(function() {
      component.doAnimation();
    }, 1000);
  },

  actions: {
    /**
     * On chart draw complete.
     */
    onChartDrawComplete() {
      let component = this;
      component.doAnimation();
    },
    onClickPrev() {
      this.$('#carouselExampleSlidesOnly').carousel('prev');
    },

    onClickNext() {
      this.$('#carouselExampleSlidesOnly').carousel('next');
    },
    onMoveNext(curStep) {
      let component = this;
      component.sendAction('onMoveNext', curStep);
    },

    playAudios() {
      const component = this;
      let isAudioPlaying = component.get('isAudioPlaying');
      let audio = document.getElementById('descAudioXS');
      if (audio) {
        if (!isAudioPlaying) {
          audio.play();
          component.set('isAudioPlaying', true);
        } else {
          audio.pause();
          component.set('isAudioPlaying', false);
        }
        audio.addEventListener(
          'ended',
          function() {
            component.set('isAudioPlaying', false);
          },
          false
        );
      }
    }
  },

  doAnimation() {
    let component = this;
    let displayGuide = component.get('activeGrade.displayGuide');
    let delay = 0;
    if (
      displayGuide &&
      displayGuide.getstarted_desc_selector_animation_config
    ) {
      if (component.get('descAudioURLXS') && component.get('isMobileView')) {
        component.send('playAudios');
      }
    }
    component.delay(component.$('.proficiency-info-6'), delay, 1);
  },

  delay(element, delay, index) {
    let component = this;
    Ember.run.later(function() {
      if (!component.get('isDestroyed')) {
        $(element).addClass('active');
        if (index !== 0) {
          component.$('#carouselExampleSlidesOnly').carousel('next');
        }
      }
    }, delay);
  },

  doReDraw: Ember.observer('reDrawChart', function() {
    let component = this;
    let reDrawChart = component.get('reDrawChart');
    if (reDrawChart) {
      Ember.run.later(function() {
        component.doAnimation();
      }, 500);
    }
  })
});
