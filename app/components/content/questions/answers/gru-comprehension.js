import Ember from 'ember';
import { QUESTION_CONFIG } from 'gooru-web/config/question';
import ModalMixin from 'gooru-web/mixins/modal';
import BuilderMixin from 'gooru-web/mixins/content/builder';

export default Ember.Component.extend(ModalMixin, BuilderMixin, {
  // --------------------------------------------------------------------
  // Attributes
  classNames: ['gru-comprehension'],

  /**
   * @requires service:api-sdk/question
   */
  questionSevice: Ember.inject.service('api-sdk/question'),

  // ---------------------------------------------------------------------
  // Dependencies

  // ----------------------------------------------------------------------
  // Properties

  tempQuestion: Ember.computed('tempModel', function() {
    return this.get('tempModel');
  }),

  collection: null,

  /**
   * @property {Array} questionList hasList of question
   **/
  questionList: Ember.computed('tempQuestion.subQuestions.@each', function() {
    return this.get('tempQuestion.subQuestions') || Ember.A();
  }),

  model: Ember.computed.alias('tempQuestion'),

  items: Ember.computed.alias('questionList'),

  isComprehension: true,

  sortableSelector: '.gru-comprehension-panel-section.sortable',

  dragElSelector: ' > .comprehension-component > li',

  parentElSelector: ' > .comprehension-component',

  /**
   * @property{Array{}} questionTypes
   */
  questionTypes: Ember.computed(function() {
    let question = [];
    Object.keys(QUESTION_CONFIG).forEach(item => {
      if (!QUESTION_CONFIG[item].serpType) {
        question.push(item);
      }
    });
    return question;
  }),

  // -----------------------------------------------------------------------
  // Events

  // ----------------------------------------------------------------------
  // Actions
  actions: {
    onAddNew() {
      let component = this;
      let collection = component.get('collection');
      let model = Ember.Object.create({
        isComprehension: true,
        id: component.get('tempQuestion.id'),
        baseResource: collection
      });
      component.send('showModal', 'content.modals.gru-question-new', model);
    },

    onSelectQusType(question, type) {
      question.set('type', type);
      // this.set('tempQuestion.type', type);
    },

    onRemoveCollectionItem(question) {
      let questionList = this.get('questionList');
      questionList.removeObject(question);
    },

    /**
     * Save reorder collection items
     */
    saveCollectionItemsOrder: function() {
      var component = this;
      const orderList = component.get('orderList');
      const collection = component.get('collection');
      if (orderList) {
        component
          .get('questionSevice')
          .reorderQuestions(
            component.get('model.id'),
            component.get('orderList'),
            collection
          )
          .then(function() {
            component.actions.finishSort.call(component);
          });
      } else {
        component.actions.finishSort.call(component);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Methods
});
