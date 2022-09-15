import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Display properties

  /**
   * @description constants display css mapping
   */
  displayConstants: {
    notificationType: [
      {
        type: 'teacher.suggestion',
        iconClass: 'account_circle'
      },
      {
        type: 'teacher.override',
        iconClass: 'iconperformance'
      },
      {
        type: 'teacher.grading.complete',
        iconClass: 'iconperformance'
      },
      {
        type: 'student.self.report',
        iconClass: 'iconperformance'
      },
      {
        type: 'student.gradable.submission',
        iconClass: 'iconperformance'
      },
      {
        type: 'domain.diagnostic.teacher.notification',
        iconClass: 'grucount'
      },
      {
        type: 'domain.diagnostic.exceed.teacher.notification',
        iconClass: 'grucount'
      },
      {
        type: 'domain.diagnostic.dumpdown.teacher.notification',
        iconClass: 'grucount'
      },
      {
        type: 'cfu.failed.twice.teacher.notification',
        iconClass: 'grucount'
      },
      {
        type: 'wpm.thresholds.exceeds',
        iconClass: 'grucount'
      },
      {
        type: 'min.perf.on.activity',
        iconClass: 'grucount'
      },
      {
        type: 'pending.gradable.items',
        iconClass: 'grucount'
      }
    ],
    currentItemType: [
      {
        type: 'assessment',
        iconClass: 'grucount'
      },
      {
        type: 'collection',
        iconClass: 'view_comfy'
      },
      {
        type: 'assessment-external',
        iconClass: 'grucount'
      },
      {
        type: 'collection-external',
        iconClass: 'view_comfy'
      }
    ]
    /* ,'notificationTypeCurrentItem' : [ { '' } ] //TBD if required*/
  },

  /**
   * @description Property for getting list item notification class
   */
  notificationTypeClass: Ember.computed('', function() {
    const component = this;
    return component.displayConstants.notificationType.find(
      ntype => ntype.type === component.get('model.notificationType')
    ).iconClass;
  }),

  /**
   * @description Property for getting list item notification class
   */
  notificationTypeTitle: Ember.computed('', function() {
    const component = this;
    let titleType = component.model.notificationType.replace(/\./g, '-'),
      rawTitle = component.inClass
        ? `notifications.typeinclass.${titleType}-title`
        : `notifications.type.${titleType}-title`,
      classTitle = component.model.ctxClassCode,
      count = component.model.occurrence,
      itemTitle = null;

    if (component.model.notificationType === 'wpm.thresholds.exceeds') {
      let metadata = component.model.metadata;
      itemTitle = component.get('i18n').t(rawTitle, {
        studentName: metadata.firstName.concat(' ', metadata.lastName),
        contentTitle: metadata.contentTitle,
        wpmCount: metadata.wpmCount,
        level: metadata.level
      }).string;
    } else if (component.model.notificationType === 'min.perf.on.activity') {
      let metadata = component.model.metadata;
      itemTitle = component.get('i18n').t(rawTitle, {
        studentName: metadata.firstName.concat(' ', metadata.lastName),
        contentTitle: metadata.contentTitle,
        performance: metadata.performance,
        threshold: metadata.threshold
      }).string;
    } else {
      itemTitle = component.get('i18n').t(rawTitle, {
        classTitle: classTitle,
        occurrence: count
      }).string;
    }
    return itemTitle;
  }),

  /**
   * @description Property for getting current item  class [assessment/ collection]
   */
  currentItemType: Ember.computed('', function() {
    const component = this;
    return component.displayConstants.currentItemType.find(
      citype => citype.type === component.get('model.currentItemType')
    ).iconClass;
  }),

  // -------------------------------------------------------------------------
  // Data model property

  /**
   * @description Data model passed by parent
   * @example {
   *  /* {"id":9,"ctxClassId":"002b0b27-1b51-4343-a51f-76fae80534f8","ctxClassCode":"FZRC834","ctxCourseId":"5d2d7b02-540f-495b-9ce3-6f3ed5a99074","ctxUnitId":"495644c9-5814-4144-8a06-bb2d55d58e30","ctxLessonId":"21f1bdf8-f983-4cbe-9446-0b95fdeb6798","ctxCollectionId":"63d1e631-7560-4f02-9adf-9679a1f97b63","currentItemId":"4f3b3a9e-3475-464c-9579-e1e5b1ad5f46","currentItemType":"assessment","currentItemTitle":"CFU:  Lesson 24 -Exit Ticket","notificationType":"teacher.suggestion","ctxPathId":527,"ctxPathType":"teacher","updatedAt":1535587200000}
   */
  model: null,

  // -------------------------------------------------------------------------
  // Action
  actions: {
    /**
     * When an items is selected
     * @param {DropdownItem} item
     */
    addressNotification: function() {
      const component = this,
        item = component.model;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_NOTIFICATIONS_ITEM
      );
      this.get('addressNotification')(item);
    }
  }
});
