import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'reports',
    'backdrop-pull-ups',
    'pull-up-diagnostic-question-report'
  ],

  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onToggleAnswerSection(element) {
      let component = this;
      if (!component.$(element).hasClass('slide-up')) {
        component
          .$(element)
          .find('.user-answer-list')
          .slideUp();
        component.$(element).addClass('slide-up');
      } else {
        component
          .$(element)
          .find('.user-answer-list')
          .slideDown();
        component.$(element).removeClass('slide-up');
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events
  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
  },
  // -------------------------------------------------------------------------
  // Properties
  /**
   * Selected question for this report
   * @type {Object}
   */
  selectedQuestion: Ember.computed.alias('context.selectedQuestion'),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  evidenceData: Ember.A([]),

  /**
   * This will have details about selected question report
   * @return {Object}
   */
  studentCorrectAns: Ember.computed('context.contents', function() {
    let component = this;
    let correctAns = component.get('context.contents').filter(content => {
      return content.status === 'correct';
    });
    return correctAns;
  }),

  studentWrongAns: Ember.computed('context.contents', function() {
    let component = this;
    const wrongAns = component.get('context.contents').filter(content => {
      return content.status === 'incorrect';
    });
    return wrongAns;
  }),
  selectedQuestionReport: Ember.computed(
    'context.contents',
    'context.selectedQuestion',
    function() {
      let component = this;
      let studentReportData = component.get('context.contents');
      let selectedQuestion = component.get('context.selectedQuestion');
      const reportData = studentReportData.findBy('status', 'correct') || {};
      Ember.set(reportData, 'question', Ember.Object.create(selectedQuestion));
      return reportData;
    }
  ),

  evidenceDatas: Ember.computed('evidenceData', function() {
    let component = this;
    return !!(
      component.get('evidenceData') && component.get('evidenceData').length
    );
  }),
  //--------------------------------------------------------------------------

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  }
});
