import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['teacher-class-ca-course-map'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/course-map
   */
  courseMapService: Ember.inject.service('api-sdk/course-map'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains the state of data loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * Class Id extract from context
   * @type {String}
   */
  classId: null,

  /**
   * Course Id which is mapped to this class.
   * @type {String}
   */
  courseId: null,

  /**
   * This property have details of course object
   * @type {Object}
   */
  course: null,

  /**
   * Selected collection for scheduling
   * @type {Object}
   */
  selectedContentForSchedule: null,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Handle toggle functionality of hide/show unit items
     * @return {Object}
     */
    toggleUnitItems(selectedUnit) {
      let component = this;
      let unitId = selectedUnit.get('id');
      let element = `#dca-unit-${unitId}`;
      let courseId = component.get('courseId');
      if (selectedUnit.get('isActive')) {
        component.$(element).slideUp(400, function() {
          selectedUnit.set('isActive', false);
        });
      } else {
        component.$(element).slideDown(400, function() {
          selectedUnit.set('isActive', true);
        });
      }
      component
        .get('unitService')
        .fetchById(courseId, unitId)
        .then(unit => {
          if (!component.isDestroyed) {
            selectedUnit.set('children', unit.get('children'));
            selectedUnit.set('hasLessonFetched', true);
          }
        });
    },

    /**
     * Handle toggle functionality of hide/show lesson items
     * @return {Object}
     */
    toggleLessonItems(selectedUnit, selectedLesson) {
      let component = this;
      selectedLesson.set('isFetchingContent', true);
      let classId = selectedUnit.get('classId');
      let unitId = selectedUnit.get('id');
      let lessonId = selectedLesson.get('id');
      let element = `#dca-lesson-${lessonId}`;
      let courseId = component.get('courseId');
      let collectionIds = this.get('todayActivitiesContentIds');
      if (selectedLesson.get('isActive')) {
        component.$(element).slideUp(400, function() {
          selectedLesson.set('isActive', false);
        });
      } else {
        component.$(element).slideDown(400, function() {
          selectedLesson.set('isActive', true);
        });
      }
      component
        .get('courseMapService')
        .getLessonInfo(classId, courseId, unitId, lessonId, true)
        .then(lesson => {
          if (!component.isDestroyed) {
            if (component.get('isShowLessonPlan')) {
              selectedLesson.set('lessonPlan', lesson.get('lessonPlan'));
            } else {
              let lessonItems = lesson.get('children');
              let collections = Ember.A();
              lessonItems.forEach(collection => {
                let id = collection.get('id');
                if (collectionIds.includes(id)) {
                  collection.set('isAdded', true);
                }
                let isExternalContent = collection
                  .get('format')
                  .includes('external');
                if (
                  isExternalContent ||
                  collection.get('resourceCount') > 0 ||
                  collection.get('questionCount') > 0 ||
                  collection.get('isOfflineActivity')
                ) {
                  collections.pushObject(collection);
                }
              });
              selectedLesson.set('children', collections);
              selectedLesson.set('hasCollectionFetched', true);
            }
          }
          selectedLesson.set('isFetchingContent', false);
        });
    },

    /**
     * Action get triggered when add content to DCA got clicked
     */
    onAddContentToDCA(content) {
      let component = this;
      component.sendAction('onAddContentToDCA', content);
    },

    /**
     * Open the player with the specific collection/assessment
     *
     * @function actions:playContent
     * @param {string} unitId - Identifier for a unit
     * @param {string} lessonId - Identifier for lesson
     * @param {string} collection - collection or assessment
     */
    playContent: function(unitId, lessonId, collection) {
      let component = this;
      let classId = component.get('classId');
      let courseId = component.get('courseId');
      let collectionId = collection.get('id');
      let collectionType = collection.get('collectionType');
      let url = `${window.location.origin}/player/course/${courseId}/unit/${unitId}/lesson/${lessonId}/collection/${collectionId}?role=teacher&type=${collectionType}&classId=${classId}`;
      if (collection.get('isExternalAssessment')) {
        url = collection.get('url');
      }
      window.open(url);
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content, event) {
      this.sendAction('onScheduleContentToDCA', content, event);
    },

    onAddActivity(content) {
      this.sendAction('onAddActivity', content);
    },

    onScheduleActivity(content) {
      this.sendAction('onScheduleActivity', content);
    },

    onShowContentPreview(content) {
      this.sendAction('onShowContentPreview', content);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.loadData();
    this.closeCADatePickerOnScroll();
  },

  didRender() {
    let component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  observerClassChanges: Ember.observer('classId', function() {
    this.loadData();
  }),

  //--------------------------------------------------------------------------
  // Methods

  loadData() {
    let component = this;
    let courseId = component.get('courseId');
    component.set('isLoading', true);
    component
      .get('courseService')
      .fetchById(courseId)
      .then(course => {
        if (!component.isDestroyed) {
          component.set('course', course);
          component.set('isLoading', false);
        }
      });
  },

  serializerSearchContent(content, contentId, date, forMonth, forYear) {
    return Ember.Object.create({
      id: contentId,
      added_date: date,
      collection: content,
      activityDate: date,
      forMonth,
      forYear,
      usersCount: -1,
      isActive: false
    });
  },

  closeCADatePickerOnScroll() {
    let component = this;
    component.$('.dca-course-map-unit-container').on('scroll', function() {
      if (Ember.$('.ca-datepicker-popover-container').is(':visible')) {
        Ember.$('.ca-datepicker-popover-container').hide();
        Ember.$('.ca-datepicker-popover').removeClass('active');
      }
    });
  }
});
