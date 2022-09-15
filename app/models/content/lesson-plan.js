import Ember from 'ember';

/**
 * Lesson plan model
 */

const LessonPlanModel = Ember.Object.extend({
  /**
   * @property {Number} id Unique row identifier
   */
  id: null,

  /**
   * @property {Number} course_id Course associated with the lesson pan
   */
  courseId: null,

  /**
   * @property {Number} unit_id Unit associated with  the lesson plan
   */
  unitId: null,

  /**
   * @property {Number} lesson_id lesson associated with the lesson plan
   */
  lessonId: null,

  /**
   * @property {String} description Description of the lesson plan, it can have an overview of lesson plan.
   */
  description: null,

  /**
   * @property {String} guiding_questions Interaction questions have to ask in class room section.
   */
  guidingQuestions: null,

  /**
   * @property {Array} prior_knowledge This will have list  of taxonomy codes which refers to the prior knowledge required for this lesson to learn.
   */
  priorKnowledge: [],

  /**
   * @property {Array} anticipated_struggles This will have list  of taxonomy codes which refers to the anticipated struggles  can take place.
   */
  anticipatedStruggles: [],

  /**
   * @property {string} pacing_guide_in_days Number of days needed  to complete the lesson
   */
  pacingGuideInDays: null,

  /**
   * @property {String} start_week This should have the week value of lessons have to take.
   */
  startWeek: null,

  /**
   * @property {Array} reference_links This will maintain the list of  external reference links
   */
  referenceLinks: [],

  /**
   * @property {JSONB} sessions session will have details like duration of each session, overview of session, contents required to take the session.
   */
  sessions: [],

  /**
   * @property {Timestamp} created_at Created Timestamp
   */
  createdAt: null,

  /**
   * @property {Timestamp} updated_at Updated Timestamp
   */
  updatedAt: null
});

export default LessonPlanModel;
