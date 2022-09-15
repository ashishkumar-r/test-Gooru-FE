import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-resource-results'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered to play the resource/question
     */
    playQuestion: function(question) {
      const transitionRoute =
        question.get('format') === CONTENT_TYPES.QUESTION
          ? 'content.questions.play'
          : 'content.resources.play';
      this.get('router').transitionTo(transitionRoute, question.get('id'));
    },

    /**
     * Action triggered to remix the question
     */
    remixQuestion: function(question) {
      var remixModel = {
        content: question
      };
      this.send('showModal', 'content.modals.gru-question-remix', remixModel);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Profile information
   * @property {Profile} profile
   */
  profile: null,

  /**
   * @property {array} Resource results for the search
   */
  resourceResults: null,

  /**
   * @property {array} Term used to search
   */
  term: '',

  /**
  * @property {boolean} isSearch component from search
  */
  isSearch: false
});
