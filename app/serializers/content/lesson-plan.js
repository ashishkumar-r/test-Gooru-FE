import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import LessonPlanModel from 'gooru-web/models/content/lesson-plan';

/**
 *  Serializer for lesson plan
 * @typedef {Object} LessonPlanSerializer
 */

export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),
  /**
   * Normalize the lesson plan
   * @param payload  The endpoint response in JSON format
   * @return {LessonPlanModel}
   */
  normalizeLessonPlan: function(payload) {
    if (payload) {
      return LessonPlanModel.create({
        id: payload.id,
        courseId: payload.course_id,
        unitId: payload.unit_id,
        lessonId: payload.lesson_id,
        description: payload.description,
        guidingQuestions: payload.guiding_questions,
        priorKnowledge: payload.prior_knowledge,
        anticipatedStruggles: payload.anticipated_struggles,
        pacingGuideInDays: payload.pacing_guide_in_days,
        startWeek: payload.start_week,
        referenceLinks: payload.reference_links,
        sessions: payload.sessions,
        createdAt: payload.created_at,
        updatedAt: payload.updated_at
      });
    }
    return [];
  }
});
