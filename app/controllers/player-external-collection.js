import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: [
    'student_id',
    'course_id',
    'lesson_id',
    'score',
    'minutes_played',
    'completed',
    'token'
  ]
});
