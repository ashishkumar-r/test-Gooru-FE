import Ember from 'ember';
import AccordionMixin from 'gooru-web/mixins/gru-accordion';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
// Whenever the observer 'parsedLocationChanged' is running, this flag is set so
// clicking on the units should not update the location
var isUpdatingLocation = false;

/**
 * Accordion Unit
 *
 * Component responsible for behaving as an accordion and listing a set of lessons.
 * It is meant to be used inside of an {@link ./gru-accordion-course|Accordion Course}
 *
 * @module
 * @augments Ember/Component
 * @mixes mixins/gru-accordion
 */
export default Ember.Component.extend(AccordionMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @requires service:api-sdk/unit
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @requires service:api-sdk/learner
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  classService: Ember.inject.service('api-sdk/class'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-accordion-unit'],

  classNameBindings: [
    'isExpanded:expanded',
    'curComponentId',
    'isDashboardView:hidden'
  ],

  tagName: 'li',

  curComponentId: Ember.computed(function() {
    return `u-${this.get('model.id')}`;
  }),

  showLocationReport: null,
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    changeVisibility: function(isChecked, item) {
      const component = this;
      const classId = component.get('currentClass.id');
      let type = 'unit';
      let contentId = item.get('id');
      component
        .get('classService')
        .updateContentVisibility(classId, contentId, isChecked, type)
        .then(function() {
          item.set('visible', isChecked);
          component.updateSetVisibility(isChecked, item);
          component.send('updateContentVisibility', item.get('id'), isChecked);
          const context = {
            classId: component.get('currentClass.id'),
            unitId: item.id
          };
          component
            .get('parseEventService')
            .postParseEvent(
              PARSE_EVENTS.CLICK_LJ_UNIT_CONTENT_VISIBILITY,
              context
            );
        });
    },
    /**
     * Launch an unit report pullup
     *
     * @function actions:onOpenUnitLevelReport
     */
    onOpenUnitLevelReport(model) {
      let component = this;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_STUDENT_LJ_UNIT
      );
      if (component.get('isTeacher')) {
        component.onOpenTeacherUnitLevelReport(model);
      } else {
        component.onOpenStudentUnitReport(model);
      }
    },

    /**
     * Launch an assessment on-air
     *
     * @function actions:launchOnAir
     */
    launchOnAir: function(collectionId) {
      this.get('onLaunchOnAir')(collectionId);
    },

    /**
     * @function goLive
     */
    goLive: function(collectionId) {
      this.sendAction('onGoLive', collectionId);
    },

    /**
     * Load the data for this unit (data should only be loaded once) and trigger
     * the 'onLocationUpdate' event handler with the unit information
     *
     * @function actions:selectUnit
     */
    selectUnit: function(unit, elementId = null) {
      this.get('parseEventService').postParseEvent(PARSE_EVENTS.CLICK_LJ_UNIT);
      this.$(`#${elementId}-heading`).removeClass('expandPanel');
      const courseId =
        this.get('currentClass.courseId') || this.get('currentCourse.id');
      if (unit.isUnit0) {
        this.set('selectedUnit', unit);
      }
      if (this.get('isFromDCA')) {
        if (!this.get('isExpanded')) {
          this.loadData(courseId, unit.id);
        }
      } else {
        if (!isUpdatingLocation) {
          let newLocation = this.get('isExpanded') ? '' : unit.id;
          this.get('onLocationUpdate')(newLocation);
        } else if (!this.get('isExpanded')) {
          this.loadData(courseId, unit.id);
        }
      }
    },

    /**
     * @function actions:selectItem
     * @param {string} collection - collection or assessment
     * @see components/class/overview/gru-accordion-lesson
     */
    selectResource: function(lessonId, collection) {
      let unitId = this.get('model.id');
      this.get('onSelectResource')(unitId, lessonId, collection);
    },

    /**
     * @function studyNow
     * @param {string} type - lesson or collection
     * @param {string} lesson - lesson id
     * @param {string} item - collection, assessment, lesson or resource
     * @see components/class/overview/gru-accordion-lesson
     */
    studyNow: function(type, lesson, item) {
      let unitId = this.get('model.id');
      this.get('onStudyNow')(type, unitId, lesson, item);
    },

    /**
     * Trigger the 'onLocationUpdate' event handler with the unit and lesson information
     *
     * @function actions:updateLesson
     */
    updateLesson: function(lessonId) {
      const newLocation = lessonId
        ? `${this.get('model.id')}+${lessonId}`
        : this.get('model.id');
      this.get('onLocationUpdate')(newLocation);
    },
    /**
     * Trigger action to update content visibility list
     */
    updateContentVisibility: function(contentId, visible) {
      this.sendAction('onUpdateContentVisibility', contentId, visible);
    },

    onSelectItem(contentType) {
      this.sendAction('onSelectItem', contentType);
    },

    /**
     * Action triggered when the user click outside of pullup.
     **/
    onClosePullUp() {
      this.set('showPathWayPullUp', false);
      this.set('showReportPullUp', false);
      this.set('showLessonReportPullUp', false);
      this.set('showUnitReportPullUp', false);
    },
    /**
     * Action triggered when the user close the pull up.
     **/
    closeAll: function() {
      this.sendAction('onClosePullUp');
    },

    /**
     * Trigger when lesson level  report clicked
     */
    onOpenLessonReport(params) {
      params.lessons = this.get('items');
      this.sendAction('onOpenLessonReport', params);
    },

    /**
     * Trigger when student lesson level  report clicked
     */
    onOpenStudentLessonReport(params) {
      this.sendAction('onOpenStudentLessonReport', params);
    },

    /**
     * Trigger when collection level student report clicked
     */
    studentReport(params) {
      this.sendAction('studentReport', params);
    },

    /**
     * Trigger when collection level teacher report clicked
     */
    teacherCollectionReport(params) {
      this.sendAction('teacherCollectionReport', params);
    },
    showUnitPlan(container, elementId) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_UNIT_INFO);
      this.$(`.${container}`).slideToggle();
      component.$(`#${elementId}-heading`).toggleClass('expandPanel');
      component.set('isExpanded', true);
      component.set('showUnitPlan', true);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  setupComponent: Ember.on('didInsertElement', function() {
    const component = this;
    this.$().on('hide.bs.collapse', function(e) {
      e.stopPropagation();
      component.set('isExpanded', false);
      component.set('showUnitPlan', false);
    });

    this.$().on('show.bs.collapse', function(e) {
      e.stopPropagation();
      component.set('isExpanded', true);
    });
    Ember.run.scheduleOnce('afterRender', this, this.parsedLocationChanged);
    component.setVisibility(this.get('model'));
  }),

  removeSubscriptions: Ember.on('willDestroyElement', function() {
    this.$().off('hide.bs.collapse');
    this.$().off('show.bs.collapse');
  }),

  didRender() {
    let component = this;
    component.sendAction('onSelectItem');
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    $('.panel-group .gru-accordion-lesson').attr('role', 'listitem');
  },
  setVisibility: function(collection) {
    if (
      this.get('contentVisibility') &&
      this.get('contentVisibility.course') &&
      this.get('contentVisibility.course.units')
    ) {
      this.get('contentVisibility.course.units').filter(unit => {
        if (unit.id === collection.id) {
          const visible = unit.visible === 'on';
          collection.set('visible', visible);
        }
      });
    }
  },
  updateSetVisibility(isChecked, item) {
    if (
      this.get('contentVisibility') &&
      this.get('contentVisibility.course') &&
      this.get('contentVisibility.course.units')
    ) {
      const unit = this.get('contentVisibility.course.units').findBy(
        'id',
        item.id
      );
      if (unit) {
        const visible = isChecked ? 'on' : 'off';
        unit.visible = visible;
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {Function} onLocationUpdate - Event handler
   */
  onLocationUpdate: null,

  /**
   * @prop {String[]} parsedLocation - Location the user has navigated to
   * parsedLocation[0] - unitId
   * parsedLocation[1] - lessonId
   * parsedLocation[2] - resourceId
   */
  parsedLocation: [],

  /**
   * @property {string} go live action name
   */
  onGoLive: 'goLive',

  /**
   * Contains only visible units
   * @property {Unit[]} units
   */
  lessons: null,

  /**
   * @prop {String} userLocation - Location of a user in a course
   */
  userLocation: null,

  /**
   * @prop {Ember.RSVP.Promise} usersLocation - Users enrolled in the course
   * Will resolve to {Location[]}
   */
  usersLocation: Ember.A([]),

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  loading: false,

  /**
   * Indicates if the current user is a student
   * @property {Boolean}
   */
  isStudent: null,

  /**
   * Indicates if it is from daily class activities
   * @property {Boolean}
   */
  isFromDCA: null,

  showUnitReportPullUp: false,

  resetPerformance: false,

  /**
   * @property {Boolean}
   */
  showUnitPlan: false,

  reloadScore: Ember.observer('resetPerformance', function() {
    if (this.get('resetPerformance')) {
      this.loadData();
    }
  }),

  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.on',
      value: true
    }),
    Ember.Object.create({
      label: 'common.off',
      value: false
    })
  ]),

  /**
   * rescoped class average performance hide for teacher's
   * @property {Ember.Array}
   */
  isPremiumClassForTeacher: Ember.computed('isPremiumClass', function() {
    let component = this;
    let isPremiumClass = component.get('isPremiumClass');
    let isTeacher = component.get('isTeacher');
    if (isPremiumClass && isTeacher) {
      return true;
    }
    return false;
  }),
  isShowContentVisibility: Ember.computed('currentClass', function() {
    let tenantSetting = this.get('tenantService').getStoredTenantSetting();
    let parsedTenantSettings = JSON.parse(tenantSetting);
    if (
      parsedTenantSettings &&
      parsedTenantSettings.allow_to_change_class_course_content_visibility !==
        undefined
    ) {
      return (
        parsedTenantSettings &&
        parsedTenantSettings.allow_to_change_class_course_content_visibility ===
          'on'
      );
    } else {
      return true;
    }
  }),

  /**
   * Help to know is is this loaded from student dashboard
   * @type {Boolean}
   */
  isStudentDashboard: false,

  isDashboardView: Ember.computed('model', function() {
    return !this.get('model.isResumeUnit') && this.get('isStudentDashboard');
  }),

  selectedUnit: null,

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observe when the 'items' promise has resolved and proceed to add the
   * corresponding users information (coming from a separate service) to each
   * one of the items so they are resolved in one single loop in the template.
   */
  addUsersToItems: Ember.observer('items', 'usersLocation', function() {
    if (this.get('items.length')) {
      let component = this;
      let visibleItems = this.get('items');
      let usersLocation = component.get('usersLocation');
      visibleItems.forEach(item => {
        // Get the users for a specific unit
        let entity = usersLocation.findBy('lesson', item.get('id'));
        if (entity) {
          entity.get('locationUsers').then(locationUsers => {
            item.set('users', locationUsers);
          });
        }
      });
    }
  }),

  /**
   * Observe changes to 'parsedLocation' to update the accordion's status
   * (expanded/collapsed).
   */
  parsedLocationChanged: Ember.observer('parsedLocation.[]', function() {
    const parsedLocation = this.get('parsedLocation');

    if (parsedLocation.length) {
      isUpdatingLocation = true;
      let unitId = parsedLocation[0];
      this.updateAccordionById(unitId);
      isUpdatingLocation = false;
    }
  }),

  /**
   * Help to hold the dashboard location
   * @type {Object}
   */
  dashboardLocation: null,

  hasUnit0Content: Ember.computed('units', function() {
    return this.get('units').findBy('isUnit0', true);
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Load data for the unit
   *
   * @function actions:loadData
   * @returns {undefined}
   */
  loadData: function() {
    // Load the lessons and users in the course when the component is instantiated
    let component = this;
    component.set('loading', true);
    component.getLessons().then(function(lessons) {
      if (!component.isDestroyed) {
        component.set('items', lessons);
        component.set('loading', false);
      }
    });
  },

  /**
   * Get all the lessons by unit
   *
   * @function
   * @requires api-sdk/lesson#findByClassAndCourseAndUnit
   * @returns {Lesson[]}
   */
  getLessons: function() {
    const component = this;
    const userId = component.get('session.userId');
    const classId = component.get('currentClass.id');
    const courseId =
      component.get('currentClass.courseId') ||
      component.get('currentCourse.id');
    const unitId = component.get('model.id');
    const classMembers = component.get('classMembers');
    const isTeacher = component.get('isTeacher');
    const contentVisibility = component.get('contentVisibility');
    const selectedUnit = component.get('selectedUnit');
    let lessons = Ember.A();
    let unitPeers = Ember.A();

    let peersPromise = classId
      ? component
        .get('analyticsService')
        .getUnitPeers(classId, courseId, unitId)
      : Ember.RSVP.resolve(unitPeers);
    return Ember.RSVP.hash({
      unit: selectedUnit
        ? selectedUnit
        : component.get('unitService').fetchById(courseId, unitId),
      peers: peersPromise
    })
      .then(({ unit, peers }) => {
        lessons = unit.get('children') || unit.get('lessons');
        let userLoc = component.get('dashboardLocation');
        if (userLoc && userLoc.split('+').length < 2) {
          component.send('updateLesson', lessons.get(0).id);
        }
        if (
          component.get('isStudentDashboard') &&
          component.get('dashboardLocation')
        ) {
          const locationItem = userLoc.split('+');
          let currentIndex = lessons.findIndex(
            lesson => lesson.id === locationItem[1]
          );
          const lessonDefaultProp = lessonItem => {
            lessonItem.setProperties({
              isDisabled: true,
              isResumeLesson: true
            });
          };
          const filteredLessons = lessons.filter(
            (lessonItem, index) =>
              currentIndex - 1 <= index && currentIndex + 1 >= index
          );
          filteredLessons.forEach(lessonDefaultProp);
        }
        let collectionComp = lessons
          .map(item => item.gutCode && Object.keys(item.gutCode))
          .flat(1)
          .filter(item => item);
        let subjectCode = component.get('currentClass.preference.subject');

        if (collectionComp.length) {
          let userId = component.get('session.userId');
          let classId = component.get('currentClass.id');
          let param = {
            data: {
              competencyCodes: new Set([...collectionComp]),
              subject: subjectCode,
              userId,
              classId
            }
          };
          let userRole = component.get('session.role');
          if (userRole === 'student' && subjectCode) {
            component
              .get('competencyService')
              .fetchCompetency(param)
              .then(competencyState => {
                lessons.forEach(item => {
                  let activeCollection = competencyState.filter(
                    colItem =>
                      item.gutCode && item.gutCode[colItem.competencyCode]
                  );
                  let lowestStatus = '';
                  if (activeCollection.length) {
                    let total = activeCollection.length;
                    let completed = activeCollection.filter(
                      item => item.status > 1
                    ).length;
                    let notstaterd = activeCollection.filter(
                      item => !item.status
                    ).length;
                    lowestStatus =
                      total === completed ? 4 : notstaterd === total ? 0 : 1;
                  }
                  item.set('status', lowestStatus);
                });
              });
          }
        }
        unitPeers = peers;
        return new Ember.RSVP.Promise(function(resolve, reject) {
          let performancePromise = Ember.RSVP.resolve();
          if (classId) {
            performancePromise = isTeacher
              ? Ember.RSVP.hash({
                lessonAssessmentPerformance: component
                  .get('performanceService')
                  .findClassPerformanceByUnit(
                    classId,
                    courseId,
                    unitId,
                    classMembers,
                    lessons,
                    {
                      collectionType: CONTENT_TYPES.ASSESSMENT
                    }
                  ),
                lessonCollectionPerformance: component
                  .get('performanceService')
                  .findClassPerformanceByUnit(
                    classId,
                    courseId,
                    unitId,
                    classMembers,
                    lessons,
                    {
                      collectionType: CONTENT_TYPES.COLLECTION
                    }
                  )
              }).then(
                ({
                  lessonAssessmentPerformance,
                  lessonCollectionPerformance
                }) => {
                  const lessonPerformanceData = Ember.A([]);
                  lessons.forEach(lesson => {
                    let lessonPerformance = lessonAssessmentPerformance.findBy(
                      'id',
                      lesson.id
                    );
                    if (
                      lessonPerformance === undefined ||
                        lessonPerformance.score === null
                    ) {
                      lessonPerformance = lessonCollectionPerformance.findBy(
                        'id',
                        lesson.id
                      );
                      if (
                        lessonPerformance &&
                          lessonPerformance.score !== null
                      ) {
                        lessonPerformance.set(
                          'isCollectionPerformance',
                          true
                        );
                      }
                    }
                    if (lessonPerformance) {
                      lessonPerformanceData.push(lessonPerformance);
                    }
                  });

                  return Ember.RSVP.resolve(lessonPerformanceData);
                }
              )
              : Ember.RSVP.hash({
                lessonCollectionPerformance: component
                  .get('performanceService')
                  .findStudentPerformanceByUnit(
                    userId,
                    classId,
                    courseId,
                    unitId,
                    lessons,
                    {
                      collectionType: CONTENT_TYPES.COLLECTION
                    }
                  ),
                lessonAssessmentPerformance: component
                  .get('performanceService')
                  .findStudentPerformanceByUnit(
                    userId,
                    classId,
                    courseId,
                    unitId,
                    lessons,
                    {
                      collectionType: CONTENT_TYPES.ASSESSMENT
                    }
                  )
              }).then(
                ({
                  lessonCollectionPerformance,
                  lessonAssessmentPerformance
                }) => {
                  const lessonPerformanceData = Ember.A([]);
                  lessons.forEach(lesson => {
                    let lessonPerformance = lessonAssessmentPerformance.findBy(
                      'id',
                      lesson.id
                    );

                    if (
                      lessonPerformance &&
                        lessonPerformance.score === null &&
                        lessonPerformance.type === CONTENT_TYPES.ASSESSMENT
                    ) {
                      component.set('inProgress', true);
                    }

                    if (
                      lessonPerformance === undefined ||
                        lessonPerformance.score === null
                    ) {
                      lessonPerformance = lessonCollectionPerformance.findBy(
                        'id',
                        lesson.id
                      );
                      if (
                        lessonPerformance &&
                          lessonPerformance.score !== null
                      ) {
                        lessonPerformance.set(
                          'isCollectionPerformance',
                          true
                        );
                      }
                    }
                    if (lessonPerformance) {
                      lessonPerformanceData.push(lessonPerformance);
                    }
                  });
                  return Ember.RSVP.resolve(lessonPerformanceData);
                }
              );

            Ember.RSVP.resolve(performancePromise).then(resolve, reject);
          } else {
            Ember.RSVP.hash({
              lessonPerformance: component
                .get('learnerService')
                .fetchPerformanceUnit(
                  courseId,
                  unitId,
                  CONTENT_TYPES.ASSESSMENT
                )
            }).then(({ lessonPerformance }) => {
              Ember.RSVP.resolve(lessonPerformance).then(resolve, reject);
            });
          }
        });
      })
      .then(performance => {
        lessons.forEach(function(lesson) {
          const peer = unitPeers.findBy('id', lesson.get('id'));
          if (peer) {
            lesson.set('membersCount', peer.get('peerCount'));
          }
          if (performance) {
            if (isTeacher) {
              let lessonPerformance = performance.findBy('id', lesson.id);
              lesson.set('performance', lessonPerformance);
            } else {
              let lessonPerformance;
              if (classId) {
                lessonPerformance = performance.findBy('id', lesson.get('id'));
              } else {
                lessonPerformance = performance.findBy(
                  'lessonId',
                  lesson.get('id')
                );

                if (lessonPerformance) {
                  const score = lessonPerformance.get('scoreInPercentage');
                  const timeSpent = lessonPerformance.get('timeSpent');
                  const completionDone = lessonPerformance.get(
                    'completedCount'
                  );
                  const completionTotal = lessonPerformance.get('totalCount');
                  const hasStarted = score > 0 || timeSpent > 0;
                  const isCompleted =
                    completionDone > 0 && completionDone >= completionTotal;
                  lessonPerformance.set('hasStarted', hasStarted);
                  lessonPerformance.set('isCompleted', isCompleted);
                  lessonPerformance.set('completionDone', completionDone);
                  lessonPerformance.set('completionTotal', completionTotal);
                }
              }
              lesson.set('performance', lessonPerformance);
            }
            if (classId && lesson.performance && contentVisibility) {
              const completionTotal = contentVisibility.getTotalAssessmentsByUnitAndLesson(
                unitId,
                lesson.get('id')
              );
              if (!lesson.get('performance.isDeleted')) {
                lesson.set('performance.completionTotal', completionTotal);
              }
            }
          }
        });
        return lessons;
      });
  },

  onOpenTeacherUnitLevelReport(model) {
    const component = this;
    let params = {
      classId: component.get('currentClass.id'),
      courseId:
        component.get('currentClass.courseId') ||
        component.get('currentCourse.id'),
      unit: model,
      course: component.get('currentCourse'),
      unitId: model.get('id'),
      classMembers: component.get('classMembers')
    };
    component.set('showUnitReportPullUp', true);
    this.sendAction('onOpenUnitLevelReport', params);
  },

  onOpenStudentUnitReport(model) {
    let component = this;
    let params = {
      classId: component.get('currentClass.id'),
      courseId:
        component.get('currentClass.courseId') ||
        component.get('currentCourse.id'),
      unitId: model.get('id'),
      unit: model,
      units: component.get('units'),
      userId: component.get('session.userId')
    };
    component.sendAction('onOpenStudentUnitLevelReport', params);
  }
});
