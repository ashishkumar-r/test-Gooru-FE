import Ember from 'ember';
import { isEmptyValue } from '../../utils/utils';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(InstructionalCoacheMixin, {
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['competency-content-info'],

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  actions: {
    // Action triggered when select a content type
    onSelectActivityContent(content) {
      let component = this;
      if (content.count > 0) {
        component.sendAction('onSelectActivityContent', content.type);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} contentCounts
   */
  contentCounts: Ember.computed('learningMapData.contents', function() {
    let component = this;
    let competencyContents = component.get('learningMapData.contents');
    return Ember.A([
      {
        type: 'course',
        count:
          !isEmptyValue(competencyContents.courses) &&
          !isEmptyValue(competencyContents.courses.stats) &&
          !isEmptyValue(competencyContents.courses.stats.totalHitCount)
            ? competencyContents.courses.stats.totalHitCount
            : 0
      },
      {
        type: 'unit',
        count:
          !isEmptyValue(competencyContents.units) &&
          !isEmptyValue(competencyContents.units.stats) &&
          !isEmptyValue(competencyContents.units.stats.totalHitCount)
            ? competencyContents.units.stats.totalHitCount
            : 0
      },
      {
        type: 'lesson',
        count:
          !isEmptyValue(competencyContents.lessons) &&
          !isEmptyValue(competencyContents.lessons.stats) &&
          !isEmptyValue(competencyContents.lessons.stats.totalHitCount)
            ? competencyContents.lessons.stats.totalHitCount
            : 0
      },
      {
        type: 'collection',
        count:
          !isEmptyValue(competencyContents.collections) &&
          !isEmptyValue(competencyContents.collections.stats) &&
          !isEmptyValue(competencyContents.collections.stats.totalHitCount)
            ? competencyContents.collections.stats.totalHitCount
            : 0
      },
      {
        type: 'assessment',
        count:
          !isEmptyValue(competencyContents.assessments) &&
          !isEmptyValue(competencyContents.assessments.stats) &&
          !isEmptyValue(competencyContents.assessments.stats.totalHitCount)
            ? competencyContents.assessments.stats.totalHitCount
            : 0
      },
      {
        type: 'resource',
        count:
          !isEmptyValue(competencyContents.resources) &&
          !isEmptyValue(competencyContents.resources.stats) &&
          !isEmptyValue(competencyContents.resources.stats.totalHitCount)
            ? competencyContents.resources.stats.totalHitCount
            : 0
      },
      {
        type: 'question',
        count:
          !isEmptyValue(competencyContents.questions) &&
          !isEmptyValue(competencyContents.questions.stats) &&
          !isEmptyValue(competencyContents.questions.stats.totalHitCount)
            ? competencyContents.questions.stats.totalHitCount
            : 0
      },
      {
        type: 'rubric',
        count:
          !isEmptyValue(competencyContents.rubrics) &&
          !isEmptyValue(competencyContents.rubrics.stats) &&
          !isEmptyValue(competencyContents.rubrics.stats.totalHitCount)
            ? competencyContents.rubrics.stats.totalHitCount
            : 0
      }
    ]);
  }),

  /**
   * @property {Array} preRequisites
   */
  preRequisites: Ember.computed('learningMapData.prerequisites', function() {
    let component = this;
    let competencyPreRequisites = component.get(
      'learningMapData.prerequisites'
    );
    return competencyPreRequisites || null;
  }),

  /**
   * @property {Array} signatureAssessments
   */
  signatureAssessments: Ember.computed(
    'learningMapData.signatureContents',
    function() {
      let component = this;
      let signatureContents = component.get(
        'learningMapData.signatureContents'
      );
      let signatureAssessments =
        signatureContents && signatureContents.assessments
          ? signatureContents.assessments
          : null;
      return signatureAssessments;
    }
  ),

  /**
   * @property {Array} signatureCollections
   */
  signatureCollections: Ember.computed(
    'learningMapData.signatureContents',
    function() {
      let component = this;
      let signatureContents = component.get(
        'learningMapData.signatureContents'
      );
      let signatureCollections =
        signatureContents && signatureContents.collections
          ? signatureContents.collections
          : null;
      return signatureCollections;
    }
  ),
  isInstructionalCoache: Ember.computed(function() {
    return this.instructionalCoache();
  })
});
