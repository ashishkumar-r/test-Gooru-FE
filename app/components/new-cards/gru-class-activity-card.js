import Ember from 'ember';
import {
  CONTENT_TYPES,
  HOVERCAM_USER_OPTION,
  CAST_EVENTS,
  CLASSROOM_PLAYER_EVENT_SOURCE,
  MEETING_TOOLS,
  SIGNATURE_CONTENTS
} from 'gooru-web/config/config';
import { formatTimeReadable } from 'gooru-web/helpers/format-time-readable';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import { dateTimeToTime } from 'gooru-web/utils/utils';
import ModalMixin from 'gooru-web/mixins/modal';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import { getEndpointSecureUrl } from 'gooru-web/utils/endpoint-config';
import ClassroomMixin from 'gooru-web/mixins/classroom-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(
  ModalMixin,
  UIHelperMixin,
  ClassroomMixin,
  TenantSettingsMixin,
  InstructionalCoacheMixin,
  {
    classNames: ['class-activities', 'gru-class-activity-card'],

    classNameBindings: ['isShowListView:list-view:card-view'],

    hovercamUserOptions: HOVERCAM_USER_OPTION,

    session: Ember.inject.service('session'),

    /**
     * @requires service:api-sdk/class-activity
     */
    classActivityService: Ember.inject.service('api-sdk/class-activity'),

    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @requires service:api-sdk/course
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @requires service:api-sdk/offline-activity
     */
    offlineActivityService: Ember.inject.service(
      'api-sdk/offline-activity/offline-activity'
    ),

    /**
     * @property {Service} I18N service
     */
    i18n: Ember.inject.service(),

    /**
     * @property {Service} tenant service
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    /**
     * @requires service:api-sdk/search
     */
    searchService: Ember.inject.service('api-sdk/search'),

    /**
     * @return videConferenceService
     */
    videConferenceService: Ember.inject.service('api-sdk/video-conference'),

    passwordData: '1234567890',

    didInsertElement() {
      const component = this;
      component.set('selectedFilters', Ember.A([])); //initialize
      component.loadClassData();
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
      this.setupTooltip();
      this.handleResize();
    },

    actions: {
      /**
       * @function goLive
       */
      goLive(content) {
        if (!this.get('isSecondaryClass')) {
          if (
            this.get('dateRangeType') === 'isDaily' ||
            this.get('dateRangeType') === undefined
          ) {
            this.get('parseEventService').postParseEvent(
              PARSE_EVENTS.CLICK_CA_DAILY_VIEW_GOLIVE
            );
          } else if (this.get('dateRangeType') === 'isWeekly') {
            this.get('parseEventService').postParseEvent(
              PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_GOLIVE
            );
          } else if (this.get('dateRangeType') === 'isMonthly') {
            this.get('parseEventService').postParseEvent(
              PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_GOLIVE
            );
          }

          let options = {
            collectionId: content.get('contentId'),
            collectionType: content.get('contentType'),
            caContentId: content.get('id'),
            content: content
          };
          this.sendAction('onGoLive', options);
          this.setTitle('Go Live', null);
          const context = {
            classId: content.classId,
            courseId: content.activityClasses[0].courseId
          };
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.GO_LIVE_CA,
            context
          );
        }
      },

      onShowStudentsList(classData) {
        const component = this;

        if (
          component.get('dateRangeType') === 'isDaily' ||
          component.get('dateRangeType') === undefined
        ) {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIEW_USER);
        } else if (component.get('dateRangeType') === 'isWeekly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_USER);
        } else if (component.get('dateRangeType') === 'isMonthly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_USER);
        }

        classData.set('tabindex', component.get('tabindex'));
        component.sendAction('onShowStudentsList', classData);
      },

      onShowSuggestionList(classData) {
        return classData;
      },

      onDeleteActivity(classData) {
        return classData;
      },

      onToggleActivityVisibility() {
        const component = this;
        component.updateActivityVisibility();
      },

      onOpenPerformanceEntry(activityClass) {
        activityClass.set('tabindex', this.get('tabindex'));
        const component = this;
        let activity = component.get('activity');
        if (activity.get('isActive') || component.get('isAutoAssign')) {
          component.updateActivity();
          component.openPerformanceEntry(activityClass);
        } else {
          var model = {
            componentName: 'auto-assign',
            onStart: function() {
              component.updateActivity();
              component.openPerformanceEntry(activityClass);
            },
            onCancel: function() {
              component.openPerformanceEntry(activityClass);
            }
          };

          component.actions.showModal.call(
            component,
            'content.modals.ca-auto-assign-confirmation',
            model,
            null,
            'ca-auto-assign'
          );
        }
      },

      onRescheduleActivity() {
        const component = this;
        const context = {
          classId: component.get('activity').classId,
          dcaId: component.get('activity').collection.id,
          contentType: component.get('activity').contentType
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_RESCHEDULE,
          context
        );
        component.sendAction('onRescheduleActivity', component.get('activity'));
      },

      onEnableMastery() {
        const component = this;

        if (
          component.get('dateRangeType') === 'isDaily' ||
          component.get('dateRangeType') === undefined
        ) {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIEW_MASTERY);
        } else if (component.get('dateRangeType') === 'isWeekly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_MASTERY);
        } else if (component.get('dateRangeType') === 'isMonthly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_MASTERY);
        }

        const classActivity = component.get('activity');
        component.sendAction('onEnableMastery', classActivity);
      },

      onShowContentPreview() {
        const component = this;
        const classActivity = component.get('activity');
        classActivity.set('tabindex', this.get('tabindex'));
        const context = {
          classId: classActivity.classId,
          dcaId: classActivity.collection.id,
          contentType: classActivity.contentType
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_PREVIEW,
          context
        );
        component.sendAction('onShowContentPreview', classActivity);
      },

      onShowContentReport(activityClass) {
        const component = this;
        const classActivity = Ember.Object.create({
          classId: activityClass.get('id'),
          id: activityClass.get('activity.id'),
          collection: activityClass.get('content'),
          contentId: activityClass.get('content.id'),
          contentType: activityClass.get('content.collectionType'),
          activation_date: activityClass.get('activity.activation_date')
            ? activityClass.get('activity.activation_date')
            : activityClass.get('activity.added_date'),
          end_date: activityClass.get('activity.end_date'),
          tabindex: this.get('tabindex'),
          isDiagnostic: this.get('activity.isDiagnostic'),
          activityClass
        });
        component.sendAction('onShowContentReport', classActivity);
        const context = {
          classId: activityClass.courseId,
          dcaId: activityClass.id
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.VIEW_REPORT_CA,
          context
        );
      },

      /**
       * @function removeClassActivity
       */
      removeClassActivity(activityClass, content, activity) {
        const component = this;

        if (
          component.get('dateRangeType') === 'isDaily' ||
          component.get('dateRangeType') === undefined
        ) {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIEW_DELETE);
        } else if (component.get('dateRangeType') === 'isWeekly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_DELETE);
        } else if (component.get('dateRangeType') === 'isMonthly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_DELETE);
        }

        if (content && activity) {
          activityClass = activityClass.find(item => {
            return item.id === activity.classId;
          });
        }
        const classActivity = component.get('activity');
        let activityClassesLength = classActivity.get('activityClasses').length;
        let isRemoveClassActivity = activityClassesLength === 1;
        this.sendAction(
          'onRemoveActivityClass',
          classActivity,
          activityClass,
          isRemoveClassActivity
        );
      },

      onMarkCompleted() {
        const component = this;
        component.markActivityAsComplete();
      },

      onMobileViewClick() {
        const component = this;
        const isSecondaryClass = component.get('isSecondaryClass');
        const isMobileView = component.get('isMobileView');

        if (isSecondaryClass && isMobileView) {
          component.set(
            'isMobileViewTooltip',
            !component.get('isMobileViewTooltip')
          );
        }
      },

      //Action triggered when click on grading icon at the activity card
      onEnableOaGrading(activityClass) {
        const component = this;
        const classActivity = component.get('activity');
        if (classActivity.get('isCompleted')) {
          const gradingItemObject = Ember.Object.create({
            classId: activityClass.get('id'),
            dcaContentId: activityClass.get('activity.id'),
            contentType: CONTENT_TYPES.OFFLINE_ACTIVITY,
            studentCount: activityClass.get('activity.usersCount'),
            activityDate: activityClass.get('activity.activation_date')
          });
          component
            .getOfflineActivity(activityClass.get('content.id'))
            .then(offlineActivity => {
              gradingItemObject.set('content', offlineActivity);
              gradingItemObject.set('collection', offlineActivity);
              gradingItemObject.set('tabindex', this.get('tabindex'));
              component.sendAction(
                'onGradeItem',
                gradingItemObject,
                activityClass
              );
            });
        }
      },

      onConference(activity) {
        activity.set('tabindex', this.get('tabindex'));
        this.sendAction('onUpdateVideConference', activity);
      },

      onUpdateVideConference(activity) {
        let component = this;

        if (
          component.get('dateRangeType') === 'isDaily' ||
          component.get('dateRangeType') === undefined
        ) {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIEW_VIDEO);
        } else if (component.get('dateRangeType') === 'isWeekly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_VIDEO);
        } else if (component.get('dateRangeType') === 'isMonthly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_VIDEO);
        }

        activity.set('tabindex', this.get('tabindex'));

        this.sendAction('onUpdateVideConference', activity);
      },

      //Help to show secondary class
      onShowSecondaryClass() {
        this.toggleProperty('isShowSecondaryClass');
      },

      toggleShowMoreAction() {
        this.$('.more-container-list').slideToggle();
      },

      onCAPresent(activity, option) {
        let content = {
          collectionId: activity.get('collection.id'),
          contentType: activity.get('contentType')
        };
        if (option === 'common.present') {
          content.classId = activity.get('classId');
          this.sendAction('onCAPresent', CAST_EVENTS.CA_PRESENT, content);
        } else if (option === 'common.build') {
          this.sendAction('onCAPresent', CAST_EVENTS.COLLECTION_BUILD, content);
        } else if (option === 'common.record-mini-lesson') {
          this.sendAction(
            'onCAPresent',
            CAST_EVENTS.COLLECTION_RECORD_MINI_LESSON,
            content
          );
        }
      },
      moreContainer(index) {
        if (event.type === 'keypress' || event.which === 13) {
          if (
            $(`.activity-actions .more-container-${index} .dropdown`).hasClass(
              'open'
            )
          ) {
            $(
              `.activity-actions .more-container-${index} .dropdown`
            ).removeClass('open');
          } else {
            $(`.activity-actions .more-container-${index} .dropdown`).addClass(
              'open'
            );
          }
        }
      },

      onPostAssignment() {
        const component = this;
        let classSetting = component.get('primaryClass.setting');
        let classroomId = classSetting.get('google_classroom_id');
        let acticity = component.get('activity');
        let description = acticity.get('collection.description');
        let descriptionOrTitle = description
          ? description
          : acticity.get('collection.title');
        let standardDescription = acticity.standards
          ? acticity.standards[0].description
            ? acticity.standards[0].description
            : acticity.standards[0].title
          : null;
        let standards = standardDescription
          ? `${component.get('i18n').t('common.standards').string}: ${
            acticity.standards[0].code
          }, ${standardDescription}\n\n`
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
                title: acticity.get('title'),
                description: formateDescription
              },
              assignmentsReference: {
                ctxCaId: acticity.get('id').toString(),
                ctxClassId: component.get('primaryClass.id'),
                ctxContentId: acticity.get('collection.id'),
                contentType: acticity.get('collection.collectionType'),
                source: component.get('source')
              }
            };
            component.postAssignment(classroomId, assignmentsInfo);
            component.sendAction(
              'onShowConfirmPullup',
              true,
              acticity.get('title'),
              component.get('googleClassroomName')
            );
          });
      },

      onShowProficiency(taxonomyTags) {
        let component = this;
        if (
          component.get('dateRangeType') === 'isDaily' ||
          component.get('dateRangeType') === undefined
        ) {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIEW_COMPEDENCY);
        } else if (component.get('dateRangeType') === 'isWeekly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_COMPEDENCY);
        } else if (component.get('dateRangeType') === 'isMonthly') {
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_COMPEDENCY);
        }

        this.sendAction('onShowProficiency', taxonomyTags);
      },

      onCloseDaterangePicker() {
        const component = this;
        component.set('isShowDaterangePicker', false);
      },

      onScheduleByDate(startDate, endDate, conferenceContent = null) {
        const component = this;
        const content = conferenceContent
          ? Object.assign(
            component.get('selectedClassActivity'),
            conferenceContent
          )
          : component.get('selectedClassActivity');
        component.set('isShowDaterangePicker', false);
        component.onAddActivity(content, startDate, endDate);
        const context = {
          classId: content.id,
          courseId: content.ownerId,
          additionalText: {
            title: content.title
          }
        };
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.ASSIGN_ACTIVITY, context);
      },

      onScheduleByMonth(month, year) {
        const component = this;
        const content = component.get('content');
        const isScheduleByMonth = true;
        component.set('isShowDaterangePicker', false);
        component.onAddActivity(
          content,
          null,
          null,
          month,
          year,
          isScheduleByMonth
        );
      }
    },

    // -------------------------------------------------------------------------
    // Methods

    openPerformanceEntry: function(activityClass) {
      const component = this;
      const context = {
        classId: activityClass.id,
        courseId: activityClass.courseId,
        startDate: activityClass.activity.activation_date,
        endDate: activityClass.activity.end_date
      };

      component.sendAction(
        'onOpenPerformanceEntry',
        activityClass,
        component.get('activityContent')
      );
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.ADD_DATA_CA,
        context
      );
    },

    setupTooltip: function() {
      let component = this;
      let $anchor = this.$('.content');
      let isMobile = window.matchMedia('only screen and (max-width: 768px)');
      let tagPopoverDefaultPosition = this.get('tagPopoverDefaultPosition');
      $anchor.attr('data-html', 'true');
      $anchor.popover({
        placement: tagPopoverDefaultPosition,
        content: function() {
          return component.$('.tag-tooltip').html();
        },
        trigger: 'manual',
        container: 'body'
      });

      if (isMobile.matches) {
        $anchor.on('click', function() {
          let $this = $(this);
          if (!$this.hasClass('list-open')) {
            // Close all tag tooltips by simulating a click on them
            $('.gru-class-activity-card > .content.list-open').click();
            $this.addClass('list-open').popover('show');
          } else {
            $this.removeClass('list-open').popover('hide');
          }
        });
      } else {
        $anchor.on('mouseenter', function() {
          $(this).popover('show');
        });

        $anchor.on('mouseleave', function() {
          $(this).popover('hide');
        });
      }
    },

    handleResize() {
      let curDeviceVW = window.screen.width;
      if (curDeviceVW <= 991) {
        this.set('isMobileView', true);
      } else {
        this.set('isMobileView', false);
      }
    },

    /**
     * Maintains the value of popover position
     * @type {String}
     */
    tagPopoverDefaultPosition: 'bottom',

    activityContent: Ember.computed.alias('activity.collection'),

    startTime: Ember.computed('activity', function() {
      return this.get('activity.meeting_url')
        ? dateTimeToTime(this.get('activity.meeting_starttime'))
        : moment().format('hh:mm A');
    }),

    endTime: Ember.computed('activity', function() {
      return this.get('activity.meeting_url')
        ? dateTimeToTime(this.get('activity.meeting_endtime'))
        : moment()
          .add(1, 'hours')
          .format('hh:mm A');
    }),

    isAssessment: Ember.computed.equal(
      'activityContent.format',
      CONTENT_TYPES.ASSESSMENT
    ),

    isOfflineActivity: Ember.computed.equal(
      'activityContent.format',
      CONTENT_TYPES.OFFLINE_ACTIVITY
    ),

    isCollection: Ember.computed.equal(
      'activityContent.format',
      CONTENT_TYPES.COLLECTION
    ),

    isExternalCollection: Ember.computed.equal(
      'activityContent.format',
      CONTENT_TYPES.EXTERNAL_COLLECTION
    ),

    activityClasses: Ember.computed.alias('activity.activityClasses'),

    activityDate: Ember.computed.alias('activity.date'),

    selectedClassData: {},

    contentDescription: Ember.computed('activityContent', function() {
      const component = this;
      const activityContent = component.get('activityContent');
      return (
        activityContent.get('description') ||
        (activityContent.get('standards').length
          ? activityContent.get('standards').objectAt(0).title
          : '')
      );
    }),

    isShowMasteryAccrual: Ember.computed('activity', function() {
      const component = this;
      const activity = component.get('activity');
      const isUnScheduledActivity = component.get('isUnscheduledActivity');
      return (
        !isUnScheduledActivity &&
        activity.get('collection.format') !== 'collection' &&
        activity.get('collection.format') !== 'collection-external' &&
        !component.get('isGuestAccount')
      );
    }),
    isShowPresent: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      return (
        tenantSettings &&
        tenantSettings.ui_element_visibility_settings &&
        tenantSettings.ui_element_visibility_settings
          .show_actions_dropdown_ca_card &&
        tenantSettings.ui_element_visibility_settings
          .show_actions_dropdown_ca_card === true
      );
    }),

    isAutoAssign: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      return (
        tenantSettings && tenantSettings.ca_auto_assign_to_student === 'on'
      );
    }),

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

    enableCollectionLiveLearning: true,

    /**
     * @return {Boolean} isEnabledVideoConferenece
     */
    isEnabledVideoConferenece: Ember.computed.alias(
      'session.tenantSetting.enabledVideoConference'
    ),

    userId: Ember.computed.alias('session.userId'),

    /**
     * It is used to find activity is today or not
     * @return {Boolean}
     */
    isToday: Ember.computed('activity', function() {
      let activityDate = this.get('activity.added_date');
      let currentDate = moment().format('YYYY-MM-DD');
      return currentDate === activityDate;
    }),

    /**
     * Maintains the flag to show go live or not
     * @type {Boolean}
     */
    showGolive: Ember.computed('isToday', function() {
      return this.get('isToday');
    }),

    /**
     * It is used to find activity is past or not
     * @return {Boolean}
     */
    isActivityPast: Ember.computed('activity', function() {
      let activityDate =
        this.get('activity.end_date') || this.get('activity.added_date');
      let currentDate = moment().format('YYYY-MM-DD');
      return moment(activityDate).isBefore(currentDate);
    }),

    /**
     * @property {Boolean} isFutureActivity
     * Property to check whether it's a future data activity or not
     */
    isFutureActivity: Ember.computed('activity', function() {
      let activityDate =
        this.get('activity.contentType') === 'offline-activity'
          ? this.get('activity.added_date')
          : this.get('activity.end_date') || this.get('activity.added_date');
      let currentDate = moment().format('YYYY-MM-DD');

      return moment(activityDate).isAfter(currentDate);
    }),

    /**
     * @property {Boolean} isCheckFutureActivity
     * Property to check whether it's a future data activity or not
     */
    isCheckFutureActivity: Ember.computed('activity', function() {
      let currentDate = moment().format('YYYY-MM-DD');
      let currDate = currentDate <= this.get('activity.end_date');
      let endDate = currDate
        ? this.get('activity.added_date') <= this.get('activity.end_date')
        : false;
      return endDate;
    }),

    isShowListView: false,

    isShowSecondaryClass: false,

    isMobileViewTooltip: false,
    /**
     * Checking is demo account
     */
    isGuestAccount: Ember.computed.alias('session.isGuest'),

    videoUpdateContent: Ember.computed(
      'activity.meeting_starttime',
      'activity.meeting_endtime',
      'activity',
      function() {
        const value = this.get('activity');
        const startTime = value.meeting_starttime
          ? moment
            .utc(value.meeting_starttime)
            .local()
            .format('hh:mm A')
          : moment().format('hh:mm A');
        const endTime = value.meeting_endtime
          ? moment
            .utc(value.meeting_endtime)
            .local()
            .format('hh:mm A')
          : moment()
            .add(1, 'hours')
            .format('hh:mm A');
        const videoUpdateDate = `${startTime} - ${endTime}`;
        return videoUpdateDate;
      }
    ),

    tooltipContent: Ember.computed(
      'activity.meeting_starttime',
      'activity',
      function() {
        let component = this;
        let tooltipContent = component.get('activity.meeting_url')
          ? formatTimeReadable([this.get('activity')])
          : component.get('i18n').t('vc.click-setup').string;
        return tooltipContent;
      }
    ),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    taxonomyTags: Ember.computed('activityContent.standards.[]', function() {
      var standards = this.get('activityContent.standards');
      if (standards) {
        standards = standards.filter(function(standard) {
          // Filter out learning targets (they're too long for the card)
          return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
        });
      }
      return TaxonomyTag.getTaxonomyTags(standards);
    }),

    /**
     * @property {String} source
     */
    source: CLASSROOM_PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,

    enableVideoConference: Ember.computed.alias(
      'session.enabledVideoConference'
    ),

    isInstructionalCoache: Ember.computed(function() {
      return this.instructionalCoache();
    }),

    allowTwoDateRangePicker: true,

    /**
     * @property {Array} secondaryClasses it has list of secondaryClasses
     */
    secondaryClasses: Ember.A(),

    loadClassData() {
      const component = this;
      const activityClasses = component.get('activityClasses');
      if (activityClasses) {
        activityClasses.map(activityClass => {
          activityClass.setProperties({
            course: {},
            members: Ember.A([])
          });
        });
      }
    },

    updateActivity() {
      const component = this;
      const classActivity = component.get('activity');
      if (!classActivity.isActive) {
        component.updateActivityVisibility();
        classActivity.set('isActive', true);
      }
    },

    updateActivityVisibility() {
      const component = this;

      if (
        component.get('dateRangeType') === 'isDaily' ||
        component.get('dateRangeType') === undefined
      ) {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIEW_ACTIVATE);
      } else if (component.get('dateRangeType') === 'isWeekly') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW_ACTIVATE);
      } else if (component.get('dateRangeType') === 'isMonthly') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW_ACTIVATE);
      }

      const classActivity = component.get('activity');
      let activityDate =
        classActivity.get('activation_date') || moment().format('YYYY-MM-DD');
      const isStartDateSameOrBefore = moment(
        classActivity.get('added_date')
      ).isSameOrAfter(activityDate, 'day');
      activityDate = isStartDateSameOrBefore
        ? classActivity.get('added_date')
        : activityDate;
      const activityClasses = classActivity.get('activityClasses');
      const activityState = classActivity.get('isActive');
      activityClasses.map(activityClass => {
        const classId = activityClass.get('id');
        component
          .get('classActivityService')
          .enableClassActivity(
            classId,
            activityClass.get('activity.id'),
            activityDate,
            activityState
          )
          .then(function() {
            if (!component.get('isDestroyed')) {
              activityClass.set('activity.activation_date', activityDate);
              component.sendAction('onRefreshActivity');
            }
          });
      });
    },

    markActivityAsComplete() {
      const component = this;
      const classActivity = component.get('activity');
      const activityClasses = classActivity.get('activityClasses');
      let classSetting = component.get('primaryClass.setting');
      activityClasses.map(activityClass => {
        const classId = activityClass.get('id');
        const activityId = activityClass.get('activity.id');
        component
          .get('classActivityService')
          .completeOfflineActivity(classId, activityId)
          .then(() => {
            classActivity.set('isCompleted', true);
            if (
              component.get('isCollection') &&
              classSetting['ca.auto.assign.content']
            ) {
              Ember.RSVP.hash({
                searchResults: component.getSignatureContentByType()
              }).then(({ searchResults }) => {
                if (searchResults.length) {
                  component.getSearchResult(searchResults);
                } else {
                  component.getSearchServiceByType().then(searchResult => {
                    component.getSearchResult(searchResult);
                  });
                }
              });
            }
            component.sendAction('markOACompleted');
            const context = {
              classId: classActivity.classId,
              dcaId: classActivity.collection.id,
              contentType: classActivity.contentType
            };
            this.get('parseEventService').postParseEvent(
              PARSE_EVENTS.CLICK_CA_MARK_AS_CLOSED,
              context
            );
          });
      });
    },

    getOfflineActivity(offlineActivityId) {
      const component = this;
      return component
        .get('offlineActivityService')
        .readActivity(offlineActivityId);
    },
    getSearchResult(searchResults) {
      const component = this;
      let selectedClassActivity = searchResults.get('firstObject');
      if (selectedClassActivity) {
        component.set('isShowDaterangePicker', true);
        component.set('activityId', selectedClassActivity.get('id'));
        component.set('selectedClassActivity', selectedClassActivity);
      }
    },

    getSearchServiceByType() {
      let component = this;
      let params = component.getSearchParams();
      let term = '*';
      params.isShowDiagnosticAssessent = true;
      return component.get('searchService').searchAssessments(term, params);
    },

    getSignatureContentByType() {
      let component = this;
      let signatureContent = SIGNATURE_CONTENTS.SIGNATURE_ASSESSMENT;
      let contentType = [CONTENT_TYPES.ASSESSMENT, signatureContent];
      let standards = component.get('activityContent.standards');
      let competencyCode;
      if (standards && standards.length) {
        competencyCode = standards
          .map(standard => standard.get('id'))
          .toString();
      }
      let params = {
        page: 0,
        pageSize: 10,
        contentType: contentType,
        competencyCode: competencyCode,
        isCollection: false
      };
      let term = '*';
      return component
        .get('searchService')
        .searchSignatureContent(term, params);
    },

    getSearchParams() {
      let component = this;
      let params = {
        taxonomies: null,
        page: 0,
        pageSize: 10
      };
      let filters = {};
      if (component.get('courseId')) {
        filters['flt.courseId'] = component.get('courseId');
      } else {
        filters.scopeKey = 'open-all';
        filters['flt.publishStatus'] = 'published';
      }
      let tags = component.get('taxonomyTags');
      let taxonomies = null;
      if (tags) {
        taxonomies = tags.map(tag => {
          return tag.data.id;
        });
      }
      params.taxonomies =
        taxonomies != null && taxonomies.length > 0 ? taxonomies : null;
      return params;
    },

    // function tigger when click add activity from the popup
    onAddActivity(
      content,
      scheduleDate = null,
      endDate = null,
      month,
      year,
      isScheduleByMonth = false
    ) {
      const component = this;
      scheduleDate = isScheduleByMonth
        ? null
        : scheduleDate || moment().format('YYYY-MM-DD');
      component.assignActivityToMultipleClass(
        content,
        scheduleDate,
        endDate,
        month,
        year
      );
    },

    // Method help to assign the class activity content to all the class
    assignActivityToMultipleClass(
      content,
      scheduleDate,
      endDate,
      month = undefined,
      year = undefined
    ) {
      const component = this;
      content.set('isScheduledActivity', !!scheduleDate);
      content.set('isUnscheduledActivity', month && year);
      const secondaryClasses = component.get('secondaryClasses');
      const classesToBeAdded = Ember.A([component.get('primaryClass')]).concat(
        secondaryClasses
      );
      let promiseList = classesToBeAdded.map(classes => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          component
            .addActivityToClass(
              classes.get('id'),
              content,
              scheduleDate,
              month,
              year,
              endDate
            )
            .then(function(activityId) {
              const activityClasses =
                content.get('activityClasses') || Ember.A([]);
              let activityClass = Ember.Object.create({
                id: classes.get('id'),
                activity: Ember.Object.create({
                  id: activityId,
                  date: scheduleDate,
                  month,
                  year
                })
              });
              activityClasses.pushObject(activityClass);
              content.set('activityClasses', activityClasses);
              if (content.get('hasVideoConference')) {
                return component.fetchActivityUsers(
                  activityClass,
                  content,
                  classes,
                  resolve
                );
              } else {
                resolve();
              }
            }, reject);
        });
      });
      Ember.RSVP.all(promiseList).then(() => {
        if (moment().isSame(scheduleDate, 'day')) {
          content.set('isAdded', true);
        } else {
          content.set('isScheduled', true);
        }
        component.set('newlyAddedActivity', content);
      });
    },

    // Methods help to schedule class activities
    addActivityToClass(classId, content, scheduleDate, month, year, endDate) {
      const component = this;
      const contentId = content.get('id');
      const contentType = content.get('format');
      return component
        .get('classActivityService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          scheduleDate,
          month,
          year,
          endDate
        );
    },

    // Method help to fetch user list for the activity
    fetchActivityUsers(activities, content, classes, resolve) {
      let component = this;
      return Ember.RSVP.hash({
        activityMembers: component
          .get('classActivityService')
          .fetchUsersForClassActivity(
            classes.get('id'),
            activities.get('activity.id')
          )
      }).then(({ activityMembers }) => {
        let emailIDs = activityMembers.filterBy('email').mapBy('email') || [];
        if (emailIDs.length) {
          return component
            .createConferenceEvent(classes, content, emailIDs)
            .then(eventDetails => {
              if (eventDetails.meetingUrl) {
                let updateParams = {
                  classId: classes.get('id'),
                  contentId: activities.get('activity.id'),
                  data: {
                    meeting_id: eventDetails.meetingId,
                    meeting_url: content.meetingUrl
                      ? content.meetingUrl
                      : eventDetails.meetingUrl,
                    meeting_endtime: content.meetingEndTime,
                    meeting_starttime: content.meetingStartTime,
                    meeting_timezone: moment.tz.guess()
                  }
                };
                let activity = activities.get('activity');
                activities.set(
                  'activity',
                  Object.assign(activity, updateParams.data)
                );
                component
                  .get('videConferenceService')
                  .updateConferenceEvent(updateParams)
                  .then(() => {
                    resolve();
                  });
              } else {
                return resolve();
              }
            });
        } else {
          return resolve();
        }
      });
    },

    createConferenceEvent(classes, content, emailIDs) {
      const component = this;
      if (component.preferredMeetingTool() === MEETING_TOOLS.zoom) {
        let params = {
          topic: `${classes.title} : ${content.title}`,
          type: 2,
          start_time: content.meetingStartTime,
          duration: moment(content.meetingEndTime).diff(
            moment(content.meetingStartTime),
            'minutes'
          ),
          timezone: moment.tz.guess(),
          password: component.get('passwordData')
        };
        return component.get('videConferenceService').createZoomMeeting(params);
      } else {
        let params = {
          summary: `${classes.title} : ${content.title}`,
          startDateTime: content.meetingStartTime,
          endDateTime: content.meetingEndTime,
          attendees: emailIDs,
          timeZone: moment.tz.guess()
        };

        if (params.attendees.length) {
          return component
            .get('videConferenceService')
            .createConferenceEvent(params);
        }
      }
    }
  }
);
