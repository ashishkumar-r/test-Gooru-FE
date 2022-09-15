import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-comprehension'],

  // ------------------------------------------------------------------------
  // Properties

  showCorrect: false,

  subQuestions: Ember.A([]),

  isPreviewCard: false,

  isShowAnswerSection: Ember.computed(
    'showCorrect',
    'isShowReportCorrectAnswer',
    function() {
      return (
        (!this.get('isPreviewCard') && this.get('showCorrect')) ||
        (this.get('isPreviewCard') && this.get('isShowReportCorrectAnswer'))
      );
    }
  )

  // -----------------------------------------------------------------------
  // Events

  // ----------------------------------------------------------------------
  // Methods
});
