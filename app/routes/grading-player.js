import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import RubricGrade from 'gooru-web/models/rubric/rubric-grade';

export default Ember.Route.extend(PrivateRouteMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {RubricService} Service to retrieve rubric information
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {ProfileService} Service to retrieve question information
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @type {Session} Session information
   */
  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Navigate to the previous route
     */
    navigateBack: function() {
      var route = !this.get('history.lastRoute.name')
        ? 'index'
        : this.get('history.lastRoute.url');
      this.transitionTo(route);
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get model for the controller
   */
  model: function(params) {
    const classId = params.classId;
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const collectionId = params.collectionId;
    const questionId = params.questionId;
    return Ember.RSVP
      .hash({
        question: this.get('questionService').readQuestion(questionId),
        users: this.get('rubricService').getStudentsForQuestion(
          questionId,
          classId,
          courseId,
          collectionId
        )
      })
      .then(({ users, question }) => {
        if (users.get('students') && users.get('students').length) {
          const studentId = users.get('students.firstObject');
          return Ember.RSVP.hash({
            answer: this.get('rubricService').getAnswerToGrade(
              studentId,
              classId,
              courseId,
              collectionId,
              questionId,
              unitId,
              lessonId
            ),
            question,
            rubric: question.get('rubric.id')
              ? this.get('rubricService').getRubric(question.get('rubric.id'))
              : null,
            userIds: users.get('students'),
            users: this.get('profileService')
              .readMultipleProfiles(users.get('students'))
              .then(profiles =>
                profiles.map(student =>
                  Ember.Object.create({
                    id: student.get('id'),
                    name: student.get('fullNameInformal'),
                    checked: false
                  })
                )
              ),
            currentUserId: studentId,
            classId,
            questionId,
            courseId,
            collectionId,
            unitId,
            lessonId
          });
        }
      });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set(
      'questionText',
      model.question.get('description') || model.question.get('title')
    );
    controller.set('questionThumbnail', model.question.get('thumbnail'));
    controller.set('classId', model.classId);
    controller.set('rubric', model.rubric);
    controller.set(
      'users',
      model.userIds.map(userId => model.users.findBy('id', userId))
    );
    let userMappings = model.users.reduce((mappings, user) => {
      mappings[user.id] = {
        user,
        answer: model.currentUserId === user.id ? model.answer : null,
        grade: RubricGrade.create(
          Ember.getOwner(this).ownerInjection(),
          model.rubric,
          {
            comment: '',
            studentId: user.id,
            classId: model.classId,
            courseId: model.courseId,
            unitId: model.unitId,
            lessonId: model.lessonId,
            collectionId: model.collectionId,
            resourceId: model.questionId,
            sessionId:
              model.currentUserId === user.id
                ? model.answer.get('sessionId')
                : null,
            createdDate: new Date(),
            rubricCreatedDate: model.rubric
              ? model.rubric.get('createdDate')
              : null,
            rubricUpdatedDate: model.rubric
              ? model.rubric.get('updatedDate')
              : null
          }
        )
      };
      return mappings;
    }, {});
    controller.set('currentUserId', model.currentUserId);
    controller.set('userMappings', Ember.Object.create(userMappings));
  }
});
