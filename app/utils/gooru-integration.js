import Ember from 'ember';

/**
 * Utility methods to handle the integration with 3rd party app
 * @typedef {object} GooruIntegration
 */
export default Ember.Object.extend({
  /**
   * @property {*} integration params
   */
  params: {},

  /**
   * @property {string} application key
   */
  appKey: Ember.computed.alias('params.appKey'),

  /**
   * @property {string} authentication token
   */
  token: Ember.computed.alias('params.token'),

  /**
   * @property {string} application page
   */
  page: Ember.computed.alias('params.page'),

  /**
   * Indicates if the app is valid
   * @property {boolean}
   */
  validAppKey: Ember.computed('appKey', function() {
    return true; //TODO for now all keys are allowed
  }),

  /**
   * @property {boolean}
   */
  classInfoPage: Ember.computed.equal('page', 'class-info'),

  /**
   * @property {boolean}
   */
  teacherDataPage: Ember.computed.equal('page', 'teacher-data'),

  /**
   * @property {boolean}
   */
  studentDataPage: Ember.computed.equal('page', 'student-data'),

  /**
   * @property {boolean}
   */
  courseMapPage: Ember.computed.equal('page', 'course-map'),

  /**
   * @property {boolean}
   */
  playerPage: Ember.computed.equal('page', 'player'),

  /**
   * It returns the corresponding route params for a integration request
   * @property {*}
   */
  routeParams: Ember.computed(function() {
    let params = ['sign-in'];
    //TODO simplify this if statement
    if (this.get('classInfoPage')) {
      params = this.get('routeParamsForInfoPage');
    } else if (this.get('teacherDataPage')) {
      params = this.get('routeParamsForTeacherDataPage');
    } else if (this.get('studentDataPage')) {
      params = this.get('routeParamsForStudentDataPage');
    } else if (this.get('courseMapPage')) {
      params = this.get('routeParamsForCourseMapPage');
    } else if (this.get('playerPage')) {
      params = this.get('routeParamsForPlayerPage');
    }
    return params;
  }),

  /**
   * Returns the route params for the info page
   * @property {*}
   */
  routeParamsForInfoPage: Ember.computed(function() {
    return ['class.info', this.get('params.classId')];
  }),

  /**
   * Returns the route params for the teacher data page
   * @property {*}
   */
  routeParamsForTeacherDataPage: Ember.computed(function() {
    return [
      'class.analytics.performance.teacher.course',
      this.get('params.classId')
    ];
  }),

  /**
   * Returns the route params for the student data page
   * @property {*}
   */
  routeParamsForStudentDataPage: Ember.computed(function() {
    return ['class.analytics.performance.student', this.get('params.classId')];
  }),

  /**
   * Returns the route params for the player page
   * @property {*}
   */
  routeParamsForPlayerPage: Ember.computed(function() {
    const queryParams = {
      sourceId: this.get('params.sourceId'),
      type: this.get('params.collectionType'),
      role: 'student'
    };
    return [
      'player',
      this.get('params.collectionId'),
      { queryParams: queryParams }
    ];
  }),

  /**
   * Returns the route params for the course map page
   * @property {*}
   */
  routeParamsForCourseMapPage: Ember.computed(function() {
    let unitId = this.get('params.unitId');
    let lessonId = this.get('params.lessonId');
    let collectionId = this.get('params.collectionId');
    let location = undefined;
    if (unitId) {
      location = unitId;
      if (lessonId) {
        location = `${unitId}-${lessonId}`;
        if (collectionId) {
          location = `${unitId}-${lessonId}-${collectionId}`;
        }
      }
    }

    let params = location
      ? [
        'class.overview',
        this.get('params.classId'),
        { queryParams: { location: location } }
      ]
      : ['class.overview', this.get('params.classId')];

    return params;
  })
});
