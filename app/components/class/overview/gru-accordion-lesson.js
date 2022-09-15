import Ember from 'ember';
import AccordionMixin from 'gooru-web/mixins/gru-accordion';
import {
  CONTENT_TYPES,
  CLASSROOM_PLAYER_EVENT_SOURCE
} from 'gooru-web/config/config';
import ModalMixin from 'gooru-web/mixins/modal';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';
import { getEndpointSecureUrl } from 'gooru-web/utils/endpoint-config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

// Whenever the observer 'parsedLocationChanged' is running, this flag is set so
// clicking on the lessons should not update the location
var isUpdatingLocation = false;

/**
 * Accordion Lesson
 *
 * Component responsible for behaving as an accordion and listing a set of collections/assessments.
 * It is meant to be used inside of an {@link ./gru-accordion-course|Accordion Unit}
 *
 * @module
 * @augments Ember/Component
 * @mixes mixins/gru-accordion
 */
export default Ember.Component.extend(
  AccordionMixin,
  ModalMixin,
  ConfigurationMixin,
  visibilitySettings,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @requires service:session
     */
    session: Ember.inject.service('session'),

    /**
     * @property {Service} I18N service
     */
    i18n: Ember.inject.service(),

    /**
     * @requires service:api-sdk/collection
     */
    collectionService: Ember.inject.service('api-sdk/collection'),

    /**
     * @requires service:api-sdk/performance
     */
    performanceService: Ember.inject.service('api-sdk/performance'),

    /**
     * @requires service:api-sdk/learner
     */
    learnerService: Ember.inject.service('api-sdk/learner'),

    /**
     * @requires service:api-sdk/course-map
     */
    courseMapService: Ember.inject.service('api-sdk/course-map'),

    /**
     * @requires service:api-sdk/analytics
     */
    analyticsService: Ember.inject.service('api-sdk/analytics'),

    /**
     * @requires service:api-sdk/profile
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @requires service:api-sdk/assessment
     */
    assessmentService: Ember.inject.service('api-sdk/assessment'),
    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @property {ClassActivityService}
     */
    classActivityService: Ember.inject.service('api-sdk/class-activity'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    lessonService: Ember.inject.service('api-sdk/lesson'),

    competencyService: Ember.inject.service('api-sdk/competency'),

    portfolioService: Ember.inject.service('api-sdk/portfolio'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @property {UUID} userId
     * Active userID should be student
     */
    userId: Ember.computed(function() {
      return this.get('session.userId');
    }),
    /**
     * @property {Boolean} isShowLessonPlan
     */
    isShowLessonPlan: false,
    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['gru-accordion-lesson', 'panel', 'panel-default'],

    classNameBindings: [
      'isExpanded:expanded',
      'curComponentId',
      'isDashboardView:hidden'
    ],

    tagName: 'li',

    showLocationReport: null,

    curComponentId: Ember.computed(function() {
      return `l-${this.get('model.id')}`;
    }),

    enableCollectionLiveLearning: function() {
      return true;
    }.property(),

    resetPerformance: false,

    reloadScore: Ember.observer('resetPerformance', function() {
      if (this.get('resetPerformance')) {
        this.loadData();
      }
    }),
    reloadLessonLevel: Ember.observer(
      'currentClass.performanceSummary',
      function() {
        if (this.get('currentClass.performanceSummary')) {
          this.loadData();
        }
      }
    ),

    /**
     * @property {String} source
     */
    source: CLASSROOM_PLAYER_EVENT_SOURCE.LEARNING_JOURNEY,

    unit0Lesson: null,

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      showLessonPlan: function(container) {
        let component = this;
        this.$(`.${container}`).slideToggle();
        component.set('isExpanded', true);
        component.set('isShowLessonPlan', true);
      },
      onAssessmentReport(content) {
        this.set('attemptContent', content);
        this.set('isShowPortfolioActivityReport', true);
      },
      showContentTypeBlock: function(container, itemId, item) {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_LESSON_INFO);
        const userId = component.get('userId');
        this.$(`.${container}`).slideToggle();
        const requestParam = {
          userId,
          itemId
        };
        let isActive;
        if (this.get('activeItem')) {
          isActive = this.get('activeItem.id') !== itemId;
          if (!isActive) {
            component.toggleProperty('isClose');
          }
        } else {
          isActive = true;
        }
        if (isActive) {
          component.set('isClose', true);
          component.set('activeItem', item);
          component
            .get('portfolioService')
            .getAllAttemptsByItem(requestParam)
            .then(function(activityAttempts) {
              component.set('isShowBlock', true);
              component.$('.collections .item-enabled').css('height', 'auto');
              if (!component.isDestroyed) {
                let result = activityAttempts.map(function(data, index) {
                  const activeIndex = index + 1;
                  data.set('index', activeIndex);
                  return data;
                });
                component.set('activityAttempts', result);
              }
            });
        }
      },
      /*
       * @function To open lesson level report
       */
      onOpenLessonReport: function() {
        let component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_LESSON);
        if (component.get('isTeacher')) {
          component.openTeacherLessonReport();
        } else {
          component.openStudentLessonReport();
        }
      },

      /**
       * Load the data for this lesson (data should only be loaded once) and trigger
       * the 'onLessonUpdate' event handler
       *
       * @function actions:selectLesson
       * @returns {undefined}
       */
      selectLesson: function(lesson) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_LJ_LESSON
        );
        this.set('isResourceSelected', false);
        const isExpanded = this.get('isExpanded');
        const items = this.get('items');
        if (!isExpanded && !items) {
          if (lesson.collections) {
            this.set('unit0Lesson', lesson);
          }
          this.loadData();
        }
        if (!this.get('isFromDCA')) {
          if (!isUpdatingLocation) {
            let updateValue = isExpanded ? '' : lesson.id;
            if (!this.get('isTeacher')) {
              this.get('onSelectLesson')(updateValue);
            }
            this.set('showLocation', false);
          }
        }
      },

      /**
       * @function goLive
       */
      goLive: function(collection) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_LJ_LESSON_LIVE
        );
        collection.classId = this.get('currentClass.id');
        collection.courseId = this.get('currentClass.courseId');
        collection.unitId = this.get('unitId');
        collection.lessonId = this.get('model.id');

        let options = {
          collectionId: collection.get('id'),
          collectionType: collection.get('collectionType'),
          content: collection
        };
        this.sendAction('onGoLive', options);
      },

      /**
       * @function actions:selectResource
       * @param {string} collection - (collection/assessment)
       */
      selectResource: function(collection) {
        if (this.get('isTeacher')) {
          let lessonId = this.get('model.id');
          this.get('onSelectResource')(lessonId, collection);
        } else {
          this.activeStudyPlayer(collection);
          this.set('isResourceSelected', true);
          this.isStudyNow('collection', collection);
        }
      },

      setOnAir: function(collectionId) {
        this.get('onLaunchOnAir')(collectionId);
      },

      /**
       * Opens the study player
       *
       * @function actions:studyNow
       * @param {string} type - collection or assessment
       * @param {string} item - collection, assessment, lesson or resource
       */
      studyNow: function(type, item) {
        let lessonId = this.get('model.id');
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_STUDENT_LJ_PLAY
        );

        if (type === 'lesson') {
          if (this.get('items') !== null) {
            const lessonItem =
              this.get('items') && this.get('items').find(item => item.visible);
            this.get('onStudyNow')(type, item.id, lessonItem);
          } else {
            this.get('onStudyNow')(type, item.id, item);
          }
        } else {
          this.get('onStudyNow')(type, lessonId, item);
        }
        const context = {
          classId: this.get('currentClass.id'),
          courseId: this.get('currentClass.courseId'),
          unitId: this.get('unitId'),
          lessonId: this.get('model.id'),
          type: item.format,
          title: item.title,
          collectionId: item.id,
          code: item.code,
          description: item.description
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.COURSE_MAP_LESSON_PLAY,
          context
        );
      },

      /**
       * Add to class activity
       *
       * @function actions:addToClassActivities
       */
      addToClassActivities: function(collection) {
        const classId = this.get('currentClass.id');
        const context = {
          courseId: this.get('currentClass.courseId'),
          unitId: this.get('unitId'),
          lessonId: this.get('model.id')
        };
        this.get('classActivityService')
          .addActivityToClass(
            classId,
            collection.get('id'),
            collection.get('collectionType'),
            context
          )
          .then(function() {
            collection.set('isAddedToClassActivities', true);
          });
      },
      /**
       * @function changeVisibility
       * @param {boolean} isChecked
       * @param {Assessment} item
       */
      changeVisibility: function(isChecked, item) {
        const component = this;
        const classId = component.get('currentClass.id');
        let type = item && item.format ? item.format : 'lesson';
        let contentId = item.get('id');
        component
          .get('classService')
          .updateContentVisibility(classId, contentId, isChecked, type)
          .then(function() {
            item.set('visible', isChecked);
            component.updateSetVisibility(isChecked, item, type);
            component.sendAction(
              'onUpdateContentVisibility',
              item.get('id'),
              isChecked
            );
            const context = {
              classId: classId,
              unitId: item.unit_id,
              lessonId: item.id
            };
            component
              .get('parseEventService')
              .postParseEvent(
                PARSE_EVENTS.CLICK_LJ_LESSON_CONTENT_VISIBILITY,
                context
              );
          });
      },

      /**
       * Load the report data for this collection / assessment
       * @function actions:CollectionReport
       * @returns {undefined}
       */
      studentReport: function(collection) {
        let component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_LJ_LESSON_PERFORMANCE);
        let currentClass = component.get('currentClass');
        let currentCourse = component.get('currentCourse');
        let userId = component.get('userId');
        let classId = currentClass ? currentClass.get('id') : null;
        let courseId = currentClass
          ? currentClass.get('courseId')
          : currentCourse
            ? currentCourse.get('id')
            : null;
        let unitId = component.get('unitId');
        let lessonId = component.get('model.id');
        let collectionId = collection.get('id');
        let type = collection.get('format');
        let params = {
          userId: userId,
          classId: classId,
          courseId: courseId,
          unitId: unitId,
          lessonId: lessonId,
          collectionId: collectionId,
          type: type,
          lesson: component.get('model'),
          isStudent: component.get('isStudent'),
          collection
        };
        component.sendAction('studentReport', params);
      },

      /**
       * Load the student report data for this collection
       * @function actions:StudentCollectionReportPullup
       */
      teacherCollectionReport(
        collection,
        collections,
        selectedQuestionId,
        selectedUserId
      ) {
        let component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_LJ_LESSON_REPORT);
        let currentClass = component.get('currentClass');
        let userId = component.get('session.userId');
        let classId = currentClass.get('id');
        let courseId = currentClass.get('courseId');
        let unitId = component.get('unitId');
        let lessonId = component.get('model.id');
        let items = collections ? collections : component.get('items');
        let params = {
          userId: userId,
          classId: classId,
          courseId: courseId,
          unitId: unitId,
          lessonId: lessonId,
          collection: collection,
          lessonModel: component.get('model'),
          unitModel: component.get('unit'),
          collections: items,
          classMembers: component.get('classMembers'),
          selectedQuestionId: selectedQuestionId,
          selectedUserId: selectedUserId
        };
        component.sendAction('teacherCollectionReport', params);
      },

      onPostAssignment(item) {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_LJ_LESSON_ASSIGN);
        component.set('isLoading', true);
        component.set('isShowConfirmPullup', true);
        component.set('activityTitle', item.get('title'));
        let currentClass = component.get('currentClass');
        let classId = currentClass.get('id');
        let courseId = currentClass.get('courseId');
        let unitId = component.get('unitId');
        let lessonId = component.get('model.id');
        let classroomId = currentClass.get('setting.google_classroom_id');
        let description = item.get('learningObjective');
        let descriptionOrTitle = description ? description : item.get('title');
        let standardDescription = item.gutCode
          ? item.gutCode[0]
            ? item.gutCode[0]
            : null
          : null;
        let standards = standardDescription
          ? `${component.get('i18n').t('common.standards').string}: ${
            item.gutCode[0]
          }\n\n`
          : '';
        let activityLabel = component.get('i18n').t('teacher-assigned-activity')
          .string;
        let descriptionLabel = component.get('i18n').t('common.description')
          .string;
        let activityUrlLabel = component.get('i18n').t('activity_url').string;
        let endpoint = getEndpointSecureUrl();
        component
          .get('classService')
          .getShortenerUrl(
            endpoint.concat(window.location.pathname, window.location.search)
          )
          .then(url => {
            let activityUrl = endpoint.concat('/share/', url);
            let formateDescription = `${activityLabel}\n\n ${descriptionLabel}: ${descriptionOrTitle}\n\n ${standards} ${activityUrlLabel}: ${activityUrl}`;

            let assignmentsInfo = {
              assignments: {
                title: item.get('title'),
                description: formateDescription
              },
              assignmentsReference: {
                ctxClassId: classId,
                ctxContentId: item.get('id'),
                contentType: item.get('format'),
                source: component.get('source'),
                ctxCourseId: courseId,
                ctxUnitId: unitId,
                ctxLessonId: lessonId
              }
            };
            component.postAssignment(classroomId, assignmentsInfo);

            Ember.run.later(
              component,
              function() {
                component.set('isLoading', false);
              },
              2000
            );
          });
      },

      closeConfirmPullup() {
        this.set('activityTitle', null);
        this.set('isShowConfirmPullup', false);
      }
    },

    // -------------------------------------------------------------------------
    // Events
    setupComponent: Ember.on('didInsertElement', function() {
      const component = this;
      component.setVisibility(this.get('model'), 'lesson');
      this.set('activeElement', this.get('currentResource'));
      this.$().on('hide.bs.collapse', function(e) {
        e.stopPropagation();
        component.set('isExpanded', false);
        component.set('isShowLessonPlan', false);
      });

      this.$().on('show.bs.collapse', function(e) {
        e.stopPropagation();
        component.set('isExpanded', true);
      });
      Ember.run.scheduleOnce('afterRender', this, this.parsedLocationChanged);
    }),

    didRender: function() {
      this.$('[data-toggle="tooltip"]').tooltip({
        placement: 'bottom'
      });
      this.$('[data-toggle="popover"]').popover({
        trigger: 'hover',
        placement: 'bottom'
      });
      this.sendAction('onSelectItem');
    },

    removeSubscriptions: Ember.on('willDestroyElement', function() {
      this.$().off('hide.bs.collapse');
      this.$().off('show.bs.collapse');
    }),

    /**
     * Opens the study player
     *
     * @function actions:isStudyNow
     * @param {string} type - collection or assessment
     * @param {string} item - collection, assessment, lesson or resource
     */
    isStudyNow: function(type, item) {
      let lessonId = this.get('model.id');
      if (type === 'lesson') {
        if (this.get('items') !== null) {
          const lessonItem =
            this.get('items') && this.get('items').find(item => item.visible);
          this.get('onStudyNow')(type, item.id, lessonItem);
        } else {
          this.get('onStudyNow')(type, item.id, item);
        }
      } else {
        this.get('onStudyNow')(type, lessonId, item);
      }
    },

    // -------------------------------------------------------------------------
    // Properties
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
     * @prop {String} - Id of the unit this lesson belongs to
     */
    unitId: null,

    /**
     * Contains only visible units
     * @property {Unit[]} units
     */
    collections: null,

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
     * @prop {Boolean} isStudent
     *
     */
    isStudent: Ember.computed.not('isTeacher'),

    /**
     * @prop {Boolean} isResourceSelected
     *
     */
    isResourceSelected: false,

    /**
     * Indicates if it is from daily class activities
     * @property {Boolean}
     */
    isFromDCA: false,

    isShowPortfolioActivityReport: false,

    attemptContent: null,

    /**
     * Check if study now button should be disabled
     * @type {Boolean}
     */
    studyNowDisabled: Ember.computed('items', function() {
      let items = this.get('items');
      return !(
        items != null &&
        items.length > 0 &&
        items.findBy('visible', true)
      );
    }),
    isShowFluency: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      return tenantSettings && tenantSettings.fluency_level === 'on';
    }),

    /**
     * @prop {Boolean} Indicate if the lesson is selected as active element to study
     */
    isLessonSelected: Ember.computed(
      'isExpanded',
      'isStudent',
      'isResourceSelected',
      'showLocation',
      'studyNowDisabled',
      function() {
        return (
          this.get('isStudent') &&
          this.get('isExpanded') &&
          !this.get('isResourceSelected') &&
          !this.get('showLocation') &&
          !this.get('studyNowDisabled')
        );
      }
    ),
    isDisabledLesson: Ember.computed('items', function() {
      const lessonItem = this.get('items');
      const isDisabledLesson =
        lessonItem && lessonItem.find(item => item.visible);
      return !!isDisabledLesson;
    }),

    /**
     * Indicates the status of the spinner
     * @property {Boolean}
     */
    loading: false,

    /**
     * Toggle Options
     * @property {Ember.Array}
     */
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

    showLessonReportPullUp: false,

    /**
     * Property is used to identify lesson have content to play or not.
     * @return {Boolean}
     */
    hasContentToPlay: Ember.computed('model', function() {
      let component = this;
      let lesson = component.get('model');
      let hasContentPlay =
        lesson.get('assessmentCount') > 0 || lesson.get('collectionCount') > 0;
      return hasContentPlay;
    }),

    /**
     * Property is used to show content visibility.
     * @return {Boolean}
     */
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

    isShowImpersonate: Ember.computed(function() {
      let impersonate;
      if (window.frameElement) {
        impersonate = window.parent.impersonate;
      }
      return impersonate;
    }),

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
          // Get the users for a specific lesson
          let entity = usersLocation.findBy('collection', item.get('id'));
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
      if (parsedLocation) {
        isUpdatingLocation = true;
        let lessonId = parsedLocation[1];
        this.updateAccordionById(lessonId);
        isUpdatingLocation = false;
      }
    }),
    /**
     * Observe changes when expands or collapse a lesson.
     */
    removedActiveLocation: Ember.observer('isExpanded', function() {
      if (this.get('isStudent') && !this.get('isExpanded')) {
        this.set('activeElement', '');
      }
    }),
    /**
     * Removed the selected element if the user decide to show the current location
     */
    showMyLocation: Ember.observer(
      'showLocation',
      'toggleLocation',
      function() {
        var divPosition =
          $('.panel.selected').offset() || $('.panel.study-active').offset();

        if (this.get('showLocation')) {
          if (divPosition) {
            this.set('showLocation', false);
            $('html, body').animate(
              {
                scrollTop: divPosition.top - 80
              },
              'slow'
            );
          }
          this.set('activeElement', '');
        }
      }
    ),

    isDashboardView: Ember.computed('model', function() {
      return (
        !this.get('model.isResumeLesson') && this.get('isStudentDashboard')
      );
    }),

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Load the collections for the lesson
     *
     * @function
     * @returns {undefined}
     */
    loadData: function() {
      const component = this;
      const userId = component.get('session.userId');
      const classId = component.get('currentClass.id');
      const courseId =
        component.get('currentClass.courseId') ||
        component.get('currentCourse.id');
      const unitId = component.get('unitId');
      const lessonId = component.get('model.id');
      const classMembers = component.get('classMembers');
      const isTeacher = component.get('isTeacher');
      const unit0Lesson = component.get('unit0Lesson')
        ? component.get('unit0Lesson')
        : this.get('unit') &&
          this.get('unit.lessons') &&
          this.get('unit.lessons')[0];
      let collections = Ember.A();
      let lessonPeers = Ember.A();
      component.set('loading', true);
      let peersPromise =
        classId && !this.get('unit.isUnit0')
          ? component
            .get('analyticsService')
            .getLessonPeers(classId, courseId, unitId, lessonId)
          : Ember.RSVP.resolve(lessonPeers);

      return Ember.RSVP.hash({
        lesson: !this.get('unit.isUnit0')
          ? component
            .get('courseMapService')
            .getLessonInfo(classId, courseId, unitId, lessonId, isTeacher)
          : unit0Lesson,
        peers: peersPromise
      })
        .then(({ lesson, peers }) => {
          collections = lesson.get('children') || lesson.get('collections');
          if (collections) {
            collections.map(collection => {
              collection.unit_id = unitId;
              collection.lesson_id = lessonId;
            });
          }
          lessonPeers = peers;
          let collectionIds = collections.mapBy('id');
          let lessonParam = {
            userId,
            collectionIds
          };
          let collectionComp = collections
            .mapBy('gutCode')
            .flat(1)
            .filter(item => item);
          if (collectionComp.length) {
            let classId = component.get('classId');
            let subjectCode = component.get('currentClass.preference.subject');
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
              Ember.RSVP.hash({
                statusList: component
                  .get('competencyService')
                  .fetchCompetency(param),
                lessonState: component
                  .get('lessonService')
                  .itemLesson(lessonParam)
              }).then(({ statusList, lessonState }) => {
                collections.forEach(item => {
                  let statusCode = statusList.filter(
                    list =>
                      item.gutCode &&
                      item.gutCode.indexOf(list.competencyCode) !== -1
                  );
                  let lowestStatus = '';
                  if (statusCode.length && lessonState[item.id]) {
                    let total = statusCode.length;
                    let completed = statusCode.filter(item => item.status > 1)
                      .length;
                    let notstaterd = statusCode.filter(item => !item.status)
                      .length;
                    lowestStatus =
                      total === completed ? 4 : notstaterd === total ? 0 : 1;
                  }
                  item.set('status', lowestStatus);
                });
              });
            }
          }
          let loadDataPromise = Ember.RSVP.resolve();
          if (classId) {
            isTeacher
              ? component
                .loadTeacherData(
                  classId,
                  courseId,
                  unitId,
                  lessonId,
                  classMembers,
                  lessonPeers,
                  collections
                )
                .then(function() {
                  loadDataPromise = component.loadCollectionData(
                    classId,
                    courseId,
                    unitId,
                    lessonId,
                    classMembers,
                    collections
                  );
                })
              : (loadDataPromise = component.loadStudentData(
                userId,
                classId,
                courseId,
                unitId,
                lessonId,
                classMembers,
                lessonPeers,
                collections
              ));
          } else {
            loadDataPromise = component.loadLearnerData(
              courseId,
              unitId,
              lessonId,
              classMembers,
              lessonPeers,
              collections
            );
          }
          return loadDataPromise;
        })
        .then(() => {
          if (!component.isDestroyed) {
            component.set('items', collections);
            collections.forEach(collection =>
              component.setVisibility(collection, collection.format)
            );

            Ember.run.later(function() {
              collections.forEach(collection =>
                component.showReportAtLocation(collection, collections)
              );
            }, 2000);
            component.set('loading', false);

            let selectedQuestionId = component.get('selectedQuestionId');
            let selectedUserId = component.get('selectedUserId');
            let selectedCollectionId = component.get('selectedCollectionId');
            let isTeacher = component.get('isTeacher');
            if (
              selectedQuestionId &&
              selectedUserId &&
              selectedCollectionId &&
              isTeacher
            ) {
              let collection = collections.filterBy('id', selectedCollectionId);
              if (collection && collection.length) {
                Ember.run.later(function() {
                  component.send(
                    'teacherCollectionReport',
                    collection[0],
                    collections,
                    selectedQuestionId,
                    selectedUserId
                  );
                }, 2000);
              }
            }
          }
        });
    },

    /**
     * @function loadTeacherData
     */
    loadTeacherData: function(
      classId,
      courseId,
      unitId,
      lessonId,
      classMembers,
      lessonPeers,
      collections
    ) {
      const component = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        component
          .get('performanceService')
          .findClassPerformanceByUnitAndLesson(
            classId,
            courseId,
            unitId,
            lessonId,
            classMembers
          )
          .then(function(performance) {
            const promises = collections.map(function(collection) {
              const isAssessment = collection.get('format') === 'assessment';
              const isExternalAssessment =
                collection.get('format') === 'assessment-external';
              const collectionId = collection.get('id');
              const peer = lessonPeers.findBy('id', collectionId);
              const assessmentDataPromise = isAssessment
                ? component
                  .get('assessmentService')
                  .readAssessment(collectionId, false)
                : isExternalAssessment
                  ? component
                    .get('assessmentService')
                    .readExternalAssessment(collectionId, false)
                  : Ember.RSVP.resolve(true);

              return assessmentDataPromise.then(function(assessmentData) {
                const averageScore = performance.calculateAverageScoreByItem(
                  collectionId
                );
                const timeSpent = performance.calculateAverageTimeSpentByItem(
                  collectionId
                );
                const completionDone = performance.calculateSumCompletionDoneByItem(
                  collectionId
                );
                const completionTotal = performance.calculateSumCompletionTotalByItem(
                  collectionId
                );

                const numberOfStudents = performance.findNumberOfStudentsByItem(
                  collectionId
                );
                collection.set(
                  'performance',
                  Ember.Object.create({
                    score: averageScore,
                    hasStarted: averageScore > 0 || timeSpent > 0,
                    isDisabled: isAssessment
                      ? !assessmentData.get('classroom_play_enabled')
                      : undefined,
                    isCompleted:
                      completionDone > 0 && completionDone >= completionTotal,
                    numberOfStudents
                  })
                );

                if (peer) {
                  return component
                    .get('profileService')
                    .readMultipleProfiles(peer.get('peerIds'))
                    .then(function(profiles) {
                      collection.set('members', profiles);
                    });
                }
              });
            });
            Ember.RSVP.all(promises).then(resolve, reject);
          });
      });
    },

    loadCollectionData: function(
      classId,
      courseId,
      unitId,
      lessonId,
      classMembers,
      collections
    ) {
      const component = this;
      return new Ember.RSVP.Promise(function() {
        component
          .get('performanceService')
          .findClassPerformanceByUnitAndLesson(
            classId,
            courseId,
            unitId,
            lessonId,
            classMembers,
            {
              collectionType: CONTENT_TYPES.COLLECTION
            }
          )
          .then(function(performance) {
            collections.map(function(collection) {
              const isCollection = collection.get('format') === 'collection';
              const isExternalCollection =
                collection.get('format') === 'collection-external';
              const timeSpent = performance.calculateAverageTimeSpentByItem(
                collection.get('id')
              );
              if (isCollection || isExternalCollection) {
                collection.set('performance.timeSpent', timeSpent);
                collection.set('performance.hasStarted', timeSpent > 0);
              }
            });
            Ember.RSVP.resolve(true);
          });
      });
    },

    loadStudentData: function(
      userId,
      classId,
      courseId,
      unitId,
      lessonId,
      classMembers,
      lessonPeers,
      collections
    ) {
      const component = this;
      const isResourceSelected = collections.findBy(
        'id',
        this.get('activeElement')
      );

      if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
        component.set('isResourceSelected', isResourceSelected);
      }

      return new Ember.RSVP.Promise(function(resolve, reject) {
        const classMinScore = component.get('currentClass.minScore');
        Ember.RSVP.hash({
          performanceAssessment: component
            .get('performanceService')
            .findStudentPerformanceByLesson(
              userId,
              classId,
              courseId,
              unitId,
              lessonId,
              collections,
              {
                collectionType: CONTENT_TYPES.ASSESSMENT
              }
            ),
          performanceCollection: component
            .get('performanceService')
            .findStudentPerformanceByLesson(
              userId,
              classId,
              courseId,
              unitId,
              lessonId,
              collections,
              {
                collectionType: CONTENT_TYPES.COLLECTION
              }
            )
        }).then(({ performanceAssessment, performanceCollection }) => {
          let assessments = performanceAssessment.filterBy(
            'type',
            'assessment'
          );

          let assessmentsStatus = assessments.filter(
            item =>
              item &&
              item.score === null &&
              (item.gradingStatus === 'in-progress' ||
                item.gradingStatus === 'completed')
          );

          if (assessmentsStatus.length) {
            component.set('inProgress', true);
          }

          let externalAssessment = performanceAssessment.filterBy(
            'type',
            'assessment-external'
          );
          let collection = performanceCollection.filterBy('type', 'collection');
          let externalCollection = performanceCollection.filterBy(
            'type',
            'collection-external'
          );

          let performance = assessments.concat(
            collection,
            externalAssessment,
            externalCollection
          );

          const promises = collections.map(function(collection) {
            const collectionId = collection.get('id');
            const isAssessment =
              collection.get('format') === CONTENT_TYPES.ASSESSMENT;
            const isExternalAssessment =
              collection.get('format') === CONTENT_TYPES.EXTERNAL_ASSESSMENT;
            const isResource =
              collection.get('format') !== CONTENT_TYPES.OFFLINE_ACTIVITY &&
              collection.get('format') !== CONTENT_TYPES.ASSESSMENT &&
              collection.get('format') !== CONTENT_TYPES.EXTERNAL_ASSESSMENT &&
              collection.get('format') !== CONTENT_TYPES.COLLECTION &&
              collection.get('format') !== CONTENT_TYPES.EXTERNAL_COLLECTION;
            const peer = lessonPeers.findBy('id', collectionId);
            if (peer) {
              component
                .get('profileService')
                .readMultipleProfiles(peer.get('peerIds'))
                .then(function(profiles) {
                  collection.set('members', profiles);
                });
            }

            collection.set('isResource', isResource);
            collection.set('isAssessment', isAssessment);
            collection.set('isExternalAssessment', isExternalAssessment);
            collection.set(
              'isOfflineActivity',
              collection.get('format') === CONTENT_TYPES.OFFLINE_ACTIVITY
            );

            const collectionPerformanceData = performance.findBy(
              'id',
              collectionId
            );
            if (collectionPerformanceData) {
              const score = collectionPerformanceData.get('score');
              const timeSpent = collectionPerformanceData.get('timeSpent');
              const isGraded = collectionPerformanceData.get('isGraded');
              const completionDone = collectionPerformanceData.get(
                'completionDone'
              );
              const completionTotal = collectionPerformanceData.get(
                'completionTotal'
              );

              const hasStarted = score > 0 || timeSpent > 0;
              const isCompleted =
                completionDone > 0 && completionDone >= completionTotal;
              const hasTrophy =
                score && score > 0 && classMinScore && score >= classMinScore;

              collectionPerformanceData.set('timeSpent', timeSpent);
              collectionPerformanceData.set('isGraded', isGraded);
              collectionPerformanceData.set('hasTrophy', hasTrophy);
              collectionPerformanceData.set('hasStarted', hasStarted);
              collectionPerformanceData.set('isCompleted', isCompleted);
              collection.set('performance', collectionPerformanceData);
              let showTrophy =
                collection.get('performance.hasTrophy') &&
                component.get('isStudent') &&
                !collection.get('collectionSubType');
              collection.set('showTrophy', showTrophy);
              return Ember.RSVP.resolve(true);
            }
          });
          Ember.RSVP.all(promises).then(resolve, reject);
        });
      });
    },

    /**
     * @function loadLearnerData
     */
    loadLearnerData: function(
      courseId,
      unitId,
      lessonId,
      classMembers,
      lessonPeers,
      collections
    ) {
      const component = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        const classMinScore = component.get('currentClass.minScore');
        Ember.RSVP.hash({
          performanceAssessment: component
            .get('learnerService')
            .fetchPerformanceLesson(
              courseId,
              unitId,
              lessonId,
              CONTENT_TYPES.ASSESSMENT
            ),
          performanceCollection: component
            .get('learnerService')
            .fetchPerformanceLesson(
              courseId,
              unitId,
              lessonId,
              CONTENT_TYPES.COLLECTION
            )
        }).then(({ performanceAssessment, performanceCollection }) => {
          let performance = performanceAssessment.concat(performanceCollection);
          const promises = collections.map(function(collection) {
            const collectionId = collection.get('id');
            const isAssessment = collection.get('format') === 'assessment';
            const isExternalAssessment =
              collection.get('format') === 'assessment-external';
            const isResource =
              collection.get('format') !== 'assessment' &&
              collection.get('format') !== 'assessment-external' &&
              collection.get('format') !== 'collection';
            const peer = lessonPeers.findBy('id', collectionId);
            if (peer) {
              component
                .get('profileService')
                .readMultipleProfiles(peer.get('peerIds'))
                .then(function(profiles) {
                  collection.set('members', profiles);
                });
            }

            collection.set('isResource', isResource);
            collection.set(
              'isOfflineActivity',
              collection.get('format') === CONTENT_TYPES.OFFLINE_ACTIVITY
            );

            const collectionPerformanceData = performance.findBy(
              'collectionId',
              collectionId
            );
            if (collectionPerformanceData) {
              const score = collectionPerformanceData.get('scoreInPercentage');
              const timeSpent = collectionPerformanceData.get('timeSpent');
              const completionDone = collectionPerformanceData.get(
                'completedCount'
              );
              const completionTotal = collectionPerformanceData.get(
                'totalCount'
              );
              const hasStarted = score > 0 || timeSpent > 0;
              const isCompleted =
                completionDone > 0 && completionDone >= completionTotal;
              const hasTrophy =
                score && score > 0 && classMinScore && score >= classMinScore;

              collectionPerformanceData.set('timeSpent', timeSpent);
              collectionPerformanceData.set('hasTrophy', hasTrophy);
              collectionPerformanceData.set('hasStarted', hasStarted);
              collectionPerformanceData.set('isCompleted', isCompleted);
              collection.set('performance', collectionPerformanceData);

              let showTrophy =
                collection.get('performance.hasTrophy') &&
                component.get('isStudent') &&
                !collection.get('collectionSubType');
              collection.set('showTrophy', showTrophy);

              const attempts = collectionPerformanceData.get('attempts');
              if (isAssessment) {
                return component
                  .get('assessmentService')
                  .readAssessment(collectionId, false)
                  .then(function(assessment) {
                    const attemptsSettings = assessment.get('attempts');
                    if (attemptsSettings) {
                      const noMoreAttempts =
                        attempts &&
                        attemptsSettings > 0 &&
                        attempts >= attemptsSettings;
                      collectionPerformanceData.set(
                        'noMoreAttempts',
                        noMoreAttempts
                      );
                      collectionPerformanceData.set(
                        'isDisabled',
                        !assessment.get('classroom_play_enabled')
                      );
                    }
                  });
              } else if (isExternalAssessment) {
                return component
                  .get('assessmentService')
                  .readExternalAssessment(collectionId, false)
                  .then(function(assessment) {
                    const attemptsSettings = assessment.get('attempts');
                    if (attemptsSettings) {
                      const noMoreAttempts =
                        attempts &&
                        attemptsSettings > 0 &&
                        attempts >= attemptsSettings;
                      collectionPerformanceData.set(
                        'noMoreAttempts',
                        noMoreAttempts
                      );
                      collectionPerformanceData.set(
                        'isDisabled',
                        !assessment.get('classroom_play_enabled')
                      );
                    }
                  });
              } else {
                return Ember.RSVP.resolve(true);
              }
            }
          });
          Ember.RSVP.all(promises).then(resolve, reject);
        });
      });
    },
    /**
     * Select an element as active element to study
     */
    activeStudyPlayer: function(item) {
      if (this.get('isStudent')) {
        if (this.get('activeElement') === item.id) {
          this.set('activeElement', '');
        } else {
          this.set('activeElement', item.id);
        }
        this.set('showLocation', false);
      }
    },
    setVisibility: function(collection, type = false) {
      if (
        this.get('contentVisibility') &&
        this.get('contentVisibility.course') &&
        this.get('contentVisibility.course.units')
      ) {
        this.get('contentVisibility.course.units').filter(unit => {
          if (unit.lessons) {
            unit.lessons.filter(lesson => {
              if (lesson.id === collection.id) {
                const visible = lesson.visible === 'on';
                collection.set('visible', visible);
              }
              const content =
                type === 'collection' ? lesson.collections : lesson.assessments;
              if (content) {
                content.filter(assessment => {
                  if (assessment.id === collection.id) {
                    const visible = assessment.visible === 'on';
                    collection.set('visible', visible);
                  }
                });
              }
            });
          }
        });
      }
    },
    updateSetVisibility(isChecked, item, type) {
      if (
        this.get('contentVisibility') &&
        this.get('contentVisibility.course') &&
        this.get('contentVisibility.course.units')
      ) {
        const unitId = item.unit_id;
        const lessonId = type === 'lesson' ? item.id : item.lesson_id;
        const unit = this.get('contentVisibility.course.units').findBy(
          'id',
          unitId
        );
        if (unit && unit.lessons) {
          const lesson = unit.lessons.findBy('id', lessonId);
          if (lesson) {
            if (type === 'lesson') {
              const visible = isChecked ? 'on' : 'off';
              lesson.visible = visible;
            } else if (type === 'collection') {
              const collection = lesson.collections.findBy('id', item.id);
              if (collection) {
                const visible = isChecked ? 'on' : 'off';
                collection.visible = visible;
              }
            } else {
              const assessment = lesson.assessments.findBy('id', item.id);
              if (assessment) {
                const visible = isChecked ? 'on' : 'off';
                assessment.visible = visible;
              }
            }
          }
        }
      }
    },

    showReportAtLocation(currentCollection, collections) {
      const component = this;
      if (component.get('showLocationReport') === 'assesmentreport') {
        let reportLocation = component.get('parsedLocation');

        if (reportLocation && reportLocation.length > 2) {
          let unitId = reportLocation[0],
            lessonId = reportLocation[1],
            collectionId = reportLocation[2],
            curUnitId = component.get('unitId'),
            curLessonId = component.get('model.id');

          if (
            curUnitId === unitId &&
            curLessonId === lessonId &&
            currentCollection.id === collectionId
          ) {
            if (component.get('isTeacher')) {
              component.send(
                'teacherCollectionReport',
                currentCollection,
                collections
              );
            } else {
              component.send('studentReport', currentCollection);
            }
            component.set('showLocationReport', null);
          }
        }
      }
    },

    openTeacherLessonReport() {
      let component = this;
      let currentClass = component.get('currentClass');
      let classId = currentClass.get('id');
      let courseId = currentClass.get('courseId');
      let unitId = component.get('unitId');
      let lessonId = component.get('model.id');

      let params = {
        classId: classId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId,
        lesson: component.get('model'),
        unit: component.get('unit'),
        classMembers: component.get('classMembers')
      };
      component.sendAction('onOpenLessonReport', params);
    },

    openStudentLessonReport() {
      let component = this;
      let params = {
        classId: component.get('currentClass.id'),
        courseId:
          component.get('currentClass.courseId') ||
          component.get('currentCourse.id'),
        unitId: component.get('unit.id'),
        lessonId: component.get('model.id'),
        lesson: component.get('model'),
        unit: component.get('unit'),
        lessons: component.get('lessons'),
        userId: component.get('session.userId')
      };
      component.sendAction('onOpenStudentLessonReport', params);
    }
  }
);
