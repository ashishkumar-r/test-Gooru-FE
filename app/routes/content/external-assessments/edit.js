import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import LearningUpgradeMixin from 'gooru-web/mixins/learning-upgrade-mixin';

export default Ember.Route.extend(PrivateRouteMixin, LearningUpgradeMixin, {
  queryParams: {
    editing: {
      refreshModel: true
    },
    editingContent: {
      refreshModel: true
    },
    isLibraryContent: false,
    isPreviewReferrer: false
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Session} current session
   */
  session: Ember.inject.service('session'),

  externalAssessmentService: Ember.inject.service(
    'api-sdk/external-assessment'
  ),

  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @requires service:api-sdk/question
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @requires service:century-skill/century-skill
   */
  centurySkillService: Ember.inject.service('century-skill'),

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    this.set('isPreviewReferrer', params.isPreviewReferrer);
    const route = this;
    return route
      .get('externalAssessmentService')
      .readExternalAssessment(params.collectionId)
      .then(function(assessment) {
        const courseId = assessment.get('courseId');
        const learningToolId = assessment.get('learningToolId');
        const isEditing = params.editing;
        const editingContent = params.editingContent
          ? params.editingContent
          : null;
        const isLibraryContent = params.isLibraryContent;
        var course = null;
        let toolDetails = null;
        const isLUContent = !!learningToolId;

        if (courseId) {
          course = route.get('courseService').fetchById(courseId);
        }

        if (learningToolId) {
          toolDetails = route
            .get('learningToolService')
            .getLearningToolInformation(learningToolId);
        }

        let questionPromiseList = assessment
          .get('children')
          .map(question =>
            route.get('questionService').readQuestion(question.get('id'))
          );

        return Ember.RSVP.hash({
          questions: Ember.RSVP.all(questionPromiseList),
          assessment: assessment,
          course: course,
          isEditing: isEditing === 'true',
          editingContent: editingContent,
          isLibraryContent,
          isPreviewReferrer: params.isPreviewReferrer,
          isLUContent: isLUContent,
          toolDetails: toolDetails
        });
      });
  },

  setupController(controller, model) {
    const route = this;
    const isLUContent = model.isLUContent;
    const toolDetails = model.toolDetails;
    // Since assessment is a collection with only questions, we'll reuse the same components
    // for collections (for example, see: /app/components/content/assessments/gru-assessment-edit.js)
    // and that is why the property 'collection' is being reused here, too.
    model.assessment.set('children', model.questions);
    controller.set('collection', model.assessment);
    controller.set('course', model.course);
    controller.set('isEditing', model.isEditing);
    controller.set('editingContent', model.editingContent);
    controller.set('isExternalAssessment', true);
    controller.set('isLibraryContent', model.isLibraryContent);
    controller.set('isPreviewReferrer', model.isPreviewReferrer);
    controller.set('isLUContent', isLUContent);
    controller.set('toolDetails', toolDetails);

    route
      .get('centurySkillService')
      .findCenturySkills()
      .then(function(centurySkillsArray) {
        controller.set('centurySkills', centurySkillsArray.toArray());
      });

    if (model.isEditing || model.editingContent) {
      controller.set('tempCollection', model.assessment.copy());
    }

    if (isLUContent) {
      route.GenerateLUContentURL(model.assessment, toolDetails);
    }
  },
  resetController(controller) {
    controller.set('isPreviewReferrer', undefined);
    this.get('controller').set('isEditing', 'false');
  }
});
