import Ember from 'ember';
import { PLAYER_EVENT_MESSAGE } from 'gooru-web/config/config';
export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    let queryParams = {
      collectionId: params.collectionId,
      collectionType: params.collectionType,
      studentId: params.student_id,
      courseId: params.course_id,
      lessonId: params.lesson_id,
      contentScore: params.score,
      contentTimespent: params.minutes_played,
      token: params.token,
      contentStatusCompleted: params.completed
    };
    const data = {
      message: PLAYER_EVENT_MESSAGE.GRU_CALLBACK_SUCCESSFULLY,
      queryParams: queryParams
    };
    window.parent.postMessage(data, '*');
  }
});
