import Ember from 'ember';
import { isNumeric } from 'gooru-web/utils/math';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-student-class-card'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Opens the study player
     *
     * @function actions:playCollection
     * @param {string} type - collection or assessment
     * @param {string} item - collection, assessment, lesson or resource
     */
    playCollection: function() {
      const component = this;
      const currentLocation = component.get('class.currentLocation');
      let classData = component.get('class');
      let course = component.get('course');
      let setting = classData.get('setting');
      let isPremiumCourse = setting
        ? setting['course.premium'] && setting['course.premium'] === true
        : false;
      let isGradeAdded = classData.get('gradeCurrent');
      if (course) {
        if (isPremiumCourse && !currentLocation && isGradeAdded) {
          component
            .get('router')
            .transitionTo('student.class.course-map', classData.get('id'));
        } else {
          component.sendAction('onPlayCollection', currentLocation, classData);
        }
      } else {
        component
          .get('router')
          .transitionTo('student.class.class-activities', classData.get('id'));
      }
    },

    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    selectItem: function(item) {
      const classId = this.get('class.id');
      const courseId = this.get('course.id');
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', item, classId, courseId);
        // Trigger parse event
        let parseValue, context;
        if (item === 'class-activities') {
          parseValue = PARSE_EVENTS.CLASS_ACTIVITY;
          context = {
            classId: classId,
            courseId: courseId,
            gradeLevel: this.get('class.grade')
          };
        }
        if (item === 'course-map') {
          parseValue = PARSE_EVENTS.LEARNING_JOURNEY;
        }
        if (item === 'profile-prof') {
          parseValue = PARSE_EVENTS.MY_PROFICIENCY;
        }

        this.get('parseEventService').postParseEvent(parseValue, context);
      }
    },

    /**
     * Action triggered when clear alert message
     */
    onClearAlert() {
      let component = this;
      let classData = component.get('class');
      classData.set('isNotAbleToStartPlayer', false);
    }
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Class} class information
   */
  class: null,

  /**
   * @property {Course} course information
   */
  course: null,

  /**
   * @property {Boolean}
   */
  isPublicClass: Ember.computed.alias('class.isPublic'),

  /**
   * @property {Boolean} isCompleted
   */
  isCompleted: Ember.computed('showCurrentLocation', function() {
    let controller = this;
    let showCurrentLocation = controller.get('showCurrentLocation');
    let currentLocation = controller.get('class.currentLocation');
    return showCurrentLocation && currentLocation.get('status') === 'complete';
  }),

  /**
   * @property {String} current location title
   * Computed property for current Location Title
   */
  currentLocationTitle: Ember.computed('class.currentLocation', function() {
    const currentLocation = this.get('class.currentLocation');
    let pathType = currentLocation.get('pathType');
    let prepandText = pathType === 'route0' ? 'Pre-study: ' : '';
    return currentLocation
      ? `${prepandText}${currentLocation.get('collectionTitle')}`
      : '';
  }),

  collectionType: Ember.computed('class.currentLocation', function() {
    let component = this;
    let currentLocation = component.get('class.currentLocation');
    let collectionType = currentLocation.get('collectionType');
    return collectionType === 'collection' ? 'collection' : 'assessment';
  }),

  /**
   * The class is premium
   * @property {String}
   */
  isPremiumClass: Ember.computed('class', function() {
    const controller = this;
    let currentClass = controller.get('class');
    let classSetting = currentClass.get('setting');
    return classSetting ? classSetting['course.premium'] : false;
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class  CM is started or not
   */
  hasCMStarted: Ember.computed('class.performanceSummary', function() {
    const scorePercentage = this.get('class.performanceSummary.score');
    return scorePercentage !== null && isNumeric(scorePercentage);
  }),

  /**
   * @property {Boolean}
   * Computed property  to identify class CA is started or not
   */
  hasCAStarted: Ember.computed('class.performanceSummaryForDCA', function() {
    const scorePercentage = this.get(
      'class.performanceSummaryForDCA.scoreInPercentage'
    );
    return scorePercentage !== null && isNumeric(scorePercentage);
  }),

  /**
   * @property {Boolean} cardBackgroundImage
   * Property help to maintain card images
   */
  cardBackgroundImage: Ember.computed('course', function() {
    const appRootPath = this.get('appRootPath');
    const coverImage = this.get('class.coverImage');
    const thumbnail = coverImage ? coverImage : this.get('course.thumbnailUrl');
    let thumbnailImage = appRootPath + DEFAULT_IMAGES.CLASS_DEFAULT;
    if (thumbnail) {
      thumbnailImage =
        thumbnail === `/${DEFAULT_IMAGES.COURSE}`
          ? appRootPath + DEFAULT_IMAGES.CLASS_DEFAULT
          : thumbnail;
    }
    return thumbnailImage;
  })
});
