import Ember from 'ember';
import { NOTIFICATION_PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Display properties
  /**
   * Model is as is given by the API, extract display model data model
   * Update dataModel with each fetch
   * Compute display model for changes, setting moreItemsRemaining
   */
  notificationModel: {},

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Notification Actions mapping , create actions map and select action pivoting on notinItem
     */
    addressItemNotification(notinItem) {
      const component = this;
      let notifionAddresAction;
      if (notinItem.notificationType === 'teacher.suggestion') {
        notifionAddresAction = component.notificationAddressAction.notificationTypes.find(
          ntype => ntype.ctxOrigin === notinItem.ctxSource
        );
      } else {
        notifionAddresAction = component.notificationAddressAction.notificationTypes.find(
          ntype => ntype.type === notinItem.notificationType
        );
      }
      //Run post address hook, can refresh become part of post hook ?
      if (notifionAddresAction && notifionAddresAction.postActionHook) {
        component.postActionHook(notifionAddresAction, notinItem);
      }
      component.attrs.closeNotificationList();
    },

    /**
     * Action handler to show more data if presetn
     */
    showMore() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_NOTIFICATIONS_SHOW_MORE);
      component.attrs.showMore();
    },

    /**
     * Close notifiction popup , sync modal to empy such that when it opens next time its state is in sync with indicator
     */
    closeNotificationList() {
      this.attrs.closeNotificationList();
    }
  },
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Invokes post processing for notification action
   * @param {object} notifionAddresAction
   * @param {dataobject} item
   */
  postActionHook(notifionAddresAction, notin) {
    const component = this;
    if (
      notifionAddresAction.postActionHook.deletenotificationuponaction &&
      notifionAddresAction.postActionHook.deletenotificationuponaction === true
    ) {
      let dimissPromise = component.dismissNotification(notin);
      dimissPromise.then(() => {
        if (
          notifionAddresAction.postActionHook.refreshAfterDeleteNotification
        ) {
          component.refreshList();
        }
      });
    }
    if (
      notifionAddresAction.postActionHook.navigate &&
      notifionAddresAction.postActionHook.navigate === true
    ) {
      component.navigateNotification(
        notifionAddresAction.postActionHook.navigationDetails,
        notin
      ); //  let ngtnPromise =  chain ?
    }
    if (notifionAddresAction.postActionHook.dismissPopupAfterAction === true) {
      component.attrs.closeNotificationList();
    }
  },

  refreshList() {
    const component = this;
    component.attrs.showNotificationList();
  },

  /**
   * Concrete notification action
   * @param {notifiocationItem object} notin
   */
  dismissNotification(notin) {
    //Service call and dismiss item.
    this.attr.dismissNotification(notin);
  },

  navigateNotification(ngtnDetails, notin) {
    const component = this;
    //let { questionId , classId, courseId, unitId , lessonId, collectionId } = ngtnDetails.queryParams;
    let qpm, queryParams;
    var route = component.get('router');
    qpm = component.transfromQpms(notin, ngtnDetails.queryparams);
    if (ngtnDetails.setlocation === true) {
      let userlocation = `${qpm.unitId}+${qpm.lessonId}+${qpm.collectionId}+${qpm.milestoneId}+${notin.currentItemType}`;
      qpm.location = userlocation;
    }
    if (ngtnDetails.queryPType === 'qponly') {
      queryParams = {
        queryParams: qpm
      };
      route.transitionTo(ngtnDetails.route, queryParams);
    } else if (ngtnDetails.queryPType === 'paramonly') {
      queryParams = qpm;
      route.transitionTo(
        ngtnDetails.route,
        queryParams[ngtnDetails.exactparams]
      );
    } else if (ngtnDetails.queryPType === 'hybrid') {
      queryParams = qpm;
      if (queryParams.isIframeMode) {
        let playerContent = Ember.Object.create({
          title: notin.currentItemTitle,
          format: notin.currentItemType
        });
        queryParams.type = notin.currentItemType;
        let playerUrl = component
          .get('router')
          .generate(ngtnDetails.route, queryParams[ngtnDetails.exactparams], {
            queryParams
          });
        component.sendAction('playerContent', playerUrl, playerContent);
      } else {
        if (
          notin.notificationType === 'wpm.thresholds.exceeds' &&
          notin.ctxCollectionId &&
          notin.contentId &&
          notin.metadata &&
          notin.metadata.userId
        ) {
          queryParams.selectedUserId = notin.metadata
            ? notin.metadata.userId
            : null;
          queryParams.selectedQuestionId = notin.contentId;
          queryParams.selectedCollectionId = notin.ctxCollectionId;
        } else if (
          notin.notificationType === 'min.perf.on.activity' &&
          notin.ctxClassId
        ) {
          queryParams.selectedUserId = notin.metadata
            ? notin.metadata.userId
            : null;
          queryParams.activeMinProfReport = true;
        }
        route.transitionTo(
          ngtnDetails.route,
          queryParams[ngtnDetails.exactparams],
          {
            queryParams: queryParams
          }
        );
      }
    }
  },

  transfromQpms(srcObj, tgtQueryParams) {
    const component = this;
    const notifictionQueryMapper =
      component.notificationAddressAction.notifictionQueryMapper;
    var keys = Object.keys(srcObj);
    var result = {},
      fresult = {};
    var fix_key = function(key) {
      let retvar = '';
      if (key === 'ctxCaId') {
        retvar = 'caContentId';
      } else if (key.indexOf('ctx') > -1) {
        retvar = key.substring(3);
        retvar = retvar.camelize();
      } else if (key.indexOf('current') === 0) {
        retvar = key.substring(7);
        retvar = retvar.camelize();
      }
      return retvar;
    };
    for (let i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === 'ctxSource') {
        result[fix_key(key)] = NOTIFICATION_PLAYER_EVENT_SOURCE[srcObj[key]];
      } else if (notifictionQueryMapper[key]) {
        result[notifictionQueryMapper[key]] = srcObj[key];
      } else {
        result[fix_key(key)] = srcObj[key];
      }
    }
    var tgtkeys = Object.keys(tgtQueryParams);
    for (let i = 0; i < tgtkeys.length; i++) {
      var tkey = tgtkeys[i];
      fresult[tkey] = result[tkey] || tgtQueryParams[tkey];
    }
    return fresult;
  }
});
