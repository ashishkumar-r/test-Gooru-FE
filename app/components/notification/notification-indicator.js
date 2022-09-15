import Ember from 'ember';
import {
  NOTIFICATION_SETTINGS,
  PLAYER_EVENT_SOURCE,
  ROLES
} from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import { isSwitchedLearner } from 'gooru-web/utils/utils';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

const notificationAccesor = {
  class: 'active-study',
  global: 'active-common'
};

export default Ember.Component.extend(tenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  notificationService: Ember.inject.service('api-sdk/app-notification'),
  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * Logged in user session object
   * @type {Session}
   */
  session: Ember.inject.service(),

  classNames: ['notification'],

  // -------------------------------------------------------------------------
  // Dispaly properties

  /**
   * @property {string} current page index string returned by notification.boundry
   * needed by notifion api for calulating next page and has more data, is a factor of limit
   */
  currentPageIndex: Ember.computed.alias('notificationModel.boundary'),

  /**
   * @property {Number} number of rows to be returned by notification
   */
  rowsPerPage: NOTIFICATION_SETTINGS.page_size,

  hasActiveNotifications: Ember.computed(
    'notificationModel',
    'notificationModel.notifications',
    'notificationModel.moreItemsRemaining',
    function() {
      let actvnot =
        this.notificationModel &&
        this.notificationModel.notifications &&
        this.notificationModel.notifications.length > 0;
      return actvnot;
    }
  ),

  /**
   * @property {boolean}, controls display of notification list
   */
  displayNotificationList: false,

  notifcationCountIndicator: '',

  notifcationCount: Ember.computed(
    'notificationModel.moreItemsRemaining',
    function() {
      const component = this;
      let actvnot =
          component.notificationModel &&
          component.notificationModel.notifications &&
          component.notificationModel.notifications.length > 0
            ? component.notificationModel.notifications.length
            : 0,
        notnCnt = 0,
        displyNotn = '';

      // More than rows per page limit, display rows per page
      if (
        component.get('moreItemsRemaining') &&
        component.get('hasActiveNotifications')
      ) {
        notnCnt = component.get('rowsPerPage');
        displyNotn = `${notnCnt}+`;
      } else if (
        !component.get('moreItemsRemaining') &&
        component.get('hasActiveNotifications')
      ) {
        // // More than rows per page limit, but has a few row, display actual rows
        notnCnt = actvnot;
        displyNotn = `${notnCnt}`;
      }
      if (!component.get('isShowMore')) {
        component.set('notifcationCountIndicator', displyNotn);
      }
      return notnCnt;
    }
  ),

  /**@constant {mapobject}
   * Provides mappings between notifications and there addressable actions, such as navigate
   * also provides config if dismissed after action taken
   */
  notificationAddressAction: {
    notificationTypes: [
      {
        type: 'teacher.suggestion',
        action: 'explore',
        ctxOrigin: 'course-map',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: true,
          refreshAfterDeleteNotification: false,
          navigate: true,
          navigationDetails: {
            route: 'study-player',
            exactparams: 'courseId',
            queryPType: 'hybrid',
            queryparams: {
              courseId: null,
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              role: ROLES.STUDENT,
              source: PLAYER_EVENT_SOURCE.COURSE_MAP,
              type: null,
              itemId: null,
              itemType: '',
              subtype: null,
              pathId: 0,
              collectionSource: 'course_map',
              isStudyPlayer: true,
              milestoneId: null,
              pathType: '',
              isNotification: true,
              isIframeMode: true,
              ctxPathId: 0,
              ctxPathType: null
            }
          }
        }
      },
      {
        type: 'teacher.suggestion',
        action: 'explore',
        ctxOrigin: 'class-activity',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: true,
          refreshAfterDeleteNotification: false,
          navigate: true,
          navigationDetails: {
            route: 'player',
            exactparams: 'itemId',
            queryPType: 'hybrid',
            queryparams: {
              itemId: null,
              caContentId: null,
              collectionId: null,
              classId: null,
              pathId: null,
              pathType: null,
              type: null,
              source: PLAYER_EVENT_SOURCE.DAILY_CLASS,
              resourceId: null,
              role: ROLES.STUDENT,
              isNotification: true,
              isIframeMode: true,
              ctxPathId: 0,
              ctxPathType: null
            }
          }
        }
      },
      {
        type: 'teacher.suggestion',
        action: 'explore',
        ctxOrigin: 'proficiency',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: true,
          refreshAfterDeleteNotification: false,
          navigate: true,
          navigationDetails: {
            route: 'player',
            exactparams: 'itemId',
            queryPType: 'hybrid',
            queryparams: {
              itemId: null,
              collectionId: null,
              classId: null,
              pathId: null,
              pathType: null,
              type: null,
              source: PLAYER_EVENT_SOURCE.MASTER_COMPETENCY,
              resourceId: null,
              role: ROLES.STUDENT,
              isNotification: true,
              isIframeMode: true,
              ctxPathId: 0,
              ctxPathType: null
            }
          }
        }
      },
      {
        type: 'teacher.override',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: true,
          refreshAfterDeleteNotification: false,
          navigate: true,
          navigationDetails: {
            route: 'student.class.course-map',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              tab: 'assesmentreport',
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType',
              refresh: true
            }
          }
        }
      },
      {
        type: 'teacher.grading.complete',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: true,
          refreshAfterDeleteNotification: false,
          navigate: true,
          navigationDetails: {
            route: 'student.class.course-map',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              tab: 'none',
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType'
            }
          }
        }
      },
      {
        type: 'student.self.report',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: true,
          refreshAfterDeleteNotification: false,
          navigate: true,
          navigationDetails: {
            route: 'teacher.class.course-map',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              tab: 'assesmentreport',
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType'
            }
          }
        }
      },
      {
        type: 'student.gradable.submission',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: false,
          navigate: true,
          navigationDetails: {
            route: 'teacher.class.course-map',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType'
            }
          }
        }
      },
      {
        type: 'wpm.thresholds.exceeds',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: false,
          navigate: true,
          navigationDetails: {
            route: 'teacher.class.course-map',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType'
            }
          }
        }
      },
      {
        type: 'min.perf.on.activity',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: false,
          navigate: true,
          navigationDetails: {
            route: 'teacher.class.students-proficiency',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType'
            }
          }
        }
      },
      {
        type: 'pending.gradable.items',
        action: 'explore',
        actionType: 'navigate',
        postActionHook: {
          dismissPopupAfterAction: true,
          deletenotificationuponaction: false,
          navigate: true,
          navigationDetails: {
            route: 'teacher.class.course-map',
            queryPType: 'hybrid',
            exactparams: 'classId',
            setlocation: true,
            queryparams: {
              classId: null,
              unitId: null,
              lessonId: null,
              collectionId: null,
              milestoneId: null,
              location:
                'unitId+lessonId+collectionId+milestoneId+currentItemType'
            }
          }
        }
      }
    ],
    notifictionQueryMapper: {
      ctxMainPathId: 'ctxPathId',
      ctxMainPathType: 'ctxPathType',
      ctxClassId: 'classId',
      currentItemType: 'type'
    }
  },

  /**
   * @property {string} current page index string returned by notification.boundry
   * needed by notifion api for calulating next page and has more data, is a factor of limit
   */
  moreItemsRemaining: Ember.computed.alias(
    'notificationModel.moreItemsRemaining'
  ),

  /**
   * Model is as is given by the API, extract display model data model
   * Update dataModel with each fetch
   * Compute display model for changes, setting moreItemsRemaining
   */
  notificationModel: {},

  init() {
    this._super(...arguments);
    this.model = this.model || {
      notificationlocation: notificationAccesor.global
    };

    const component = this;
    component.getNotifications(component.getDefaultFilter()); // Initial call, all the rest calls would be made with the setinterval
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Location based setting [starts]
  // -------------------------------------------------------------------------

  /**
   * @property {string}
   * Context in which notification is loaded student/teacher
   */
  notificationCtxRole: Ember.computed(function() {
    const component = this;
    let userrole = component.get('session').get('role');
    userrole =
      userrole === 'teacher' || userrole === 'student' ? userrole : null; // Don't show notifications of user role is not student or teacher
    return userrole;
  }),

  model: null,

  /**
   * Takes action on the notification
   * Refresh UI upon success, to remove the acted notification
   * @param notification item model
   */
  //updateNotification(notiticationItem) {},

  activeNotificationsChanged: Ember.computed(
    'hasActiveNotifications',
    function() {
      this.model.hasActiveNotifications = this.get('hasActiveNotifications');
    }
  ),

  /**
   * @property {boolean} Indicates if the accessor path
   */
  accessorClass: Ember.computed('model.notificationlocation', {
    get() {
      return notificationAccesor[this.get('model.notificationlocation')];
    },
    set(key, value) {
      if (!this.get('model')) {
        this.set('model', {});
      }
      this.set('model.isClass', value);
      this.set('inClass', true);
      return this.set('model.notificationlocation', notificationAccesor[value]);
    }
  }),

  // -------------------------------------------------------------------------
  // Location based setting [ends]
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // actions
  actions: {
    showNotificationList() {
      const component = this;
      component.set('displayNotificationList', true);
      component
        .getNotifications(component.getDefaultFilter()) //Force default filter for first time load
        .then(() => {
          let context;
          if (this.get('classId')) {
            context = {
              classId: this.get('classId'),
              notificationType: this.get('notificationModel').notifications[0]
                .notificationType
            };
          }
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.NOTIFICATION,
            context
          );
        });
    },
    /**
     * Concrete notification action
     * @param {notifiocationItem object} notin
     */
    dismissNotification(notin) {
      const component = this;
      if (notin && component.get('notificationCtxRole')) {
        let serviceEndpoint =
          component.get('notificationCtxRole') === 'student'
            ? component
              .get('notificationService')
              .resetStudentNotification(notin.id)
            : component
              .get('notificationService')
              .resetTeacherNotification(notin.id);
        return serviceEndpoint;
        //}
      }
    },

    /**
     * Get fetch data, and updates current data model. Data is fetched based existing filters

     */
    showMore() {
      const component = this;
      component.set('isShowMore', true);
      return component.getNotifications();
    },

    closeNotificationList() {
      const component = this;
      let dataModel = component.get('notificationModel');
      if (dataModel && dataModel.notifications) {
        dataModel.notifications.clear();
      }
      component.set('isShowMore', false);
      component.set('notificationModel', dataModel);
      component.set('displayNotificationList', false);
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
    },

    playerContent(playerUrl, content) {
      const component = this;
      component.set('playerUrl', playerUrl);
      component.set('isOpenPlayer', true);
      component.set('playerContent', content);
    }
  },
  // -------------------------------------------------------------------------
  // actions -handlers
  /**
   * Makes Service Call refresh the list of notifications,
   * This should also update the indicator, by computing number of items to be displayed on indicator
   */
  getNotifications(dataFilter) {
    const component = this;
    if (!component.get('notificationCtxRole')) {
      return; //Don't fetch any notifications if user role is null
    }
    let notinPromise;
    let showMoreFlow = !dataFilter;
    dataFilter = dataFilter || component.getDataFilter();

    if (
      component.get('notificationCtxRole') === 'student' ||
      isSwitchedLearner(component.get('session.userId'))
    ) {
      notinPromise = component
        .get('notificationService')
        .studentFetch(dataFilter);
    } else {
      notinPromise = component
        .get('notificationService')
        .teacherFetch(dataFilter);
    }
    return notinPromise.then(function(data) {
      let notndatamodel = {},
        notndetail = [];
      Object.assign(notndatamodel, component.get('notificationModel') || {});
      Object.assign(
        notndetail,
        component.get('notificationModel') &&
          component.get('notificationModel').notifications
          ? component.get('notificationModel').notifications
          : {}
      );
      let newDataModel = {},
        newNotificationDetails = [];

      Object.assign(newNotificationDetails, data.notifications);
      Object.assign(newDataModel, data);
      let concatAndDeDuplicateObjects = (p, ...arrs) =>
        []
          .concat(...arrs)
          .reduce(
            (a, b) => (!a.filter(c => b[p] === c[p]).length ? [...a, b] : a),
            []
          );

      var ndt = showMoreFlow
        ? concatAndDeDuplicateObjects('id', notndetail, newNotificationDetails)
        : newNotificationDetails;

      if (!(component.get('isDestroyed') || component.get('isDestroying'))) {
        newDataModel.notifications = ndt;
        component.set('notificationModel', newDataModel);
      }
    });
  },

  /**
   * Gets active data filter options and return data fitler object
   * @returns{object  { classId: '', limit: 10, boundary: null } } filters
   */
  getDataFilter() {
    const component = this;
    let filter = {
      classId: '',
      limit: 2,
      boundary: ''
    };
    filter.boundary =
      component.notificationModel && component.notificationModel.boundary
        ? component.notificationModel.boundary
        : '';
    filter.limit = component.get('rowsPerPage');
    filter.classId =
      component.get('model.isClass') && component.get('classId')
        ? component.get('classId')
        : ''; // from page Options passed to instance

    return filter;
  },

  /**
   * Gets active data filter options and return data fitler object
   * @returns{object  { classId: '', limit: 10, boundary: null } } filters
   */
  getDefaultFilter() {
    const component = this;
    let filter = {
      classId: '',
      limit: 2,
      boundary: ''
    };
    filter.classId =
      component.get('model.isClass') && component.get('classId')
        ? component.get('classId')
        : ''; // from page Options passed to instance
    filter.limit = component.get('rowsPerPage');
    return filter;
  }
});
