import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {ClassActivityService}
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @property {classService}
   */
  classService: Ember.inject.service('api-sdk/class'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-add-to-classroom'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Select classroom
     */
    selectClassroom: function(classroom) {
      this.set('selectedClassroom', classroom);
      let subject = classroom.get('preference.subject');
      let framework = classroom.get('preference.framework');
      let cSubject = this.get('model.content.subject');
      let cFramework = null;
      let setting = classroom.get('setting');
      if (setting && !setting['course.premium']) {
        let splitSubject = cSubject && cSubject.split('.');
        if (splitSubject && splitSubject.length === 3) {
          cFramework = splitSubject[0];
          cSubject = `${splitSubject[1]}.${splitSubject[2]}`;
        }
        if (
          (subject &&
            (!cSubject || cSubject === subject) &&
            framework &&
            (!cFramework || cFramework === framework)) ||
          !subject ||
          !cSubject
        ) {
          this.set('isNotAllow', false);
          return;
        }
        this.set('isNotAllow', true);
      }
    },

    /**
     * Add to classroom or daily class activity
     */
    addTo: function() {
      let component = this;
      let content = component.get('model.content');
      let isClassActivity = component.get('model.classActivity');
      let selectedClassroom = component.get('selectedClassroom');
      let classId = selectedClassroom.get('id');
      let addedDate = moment().format('YYYY-MM-DD');
      let collectionType =
        content.get('format') === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
        CONTENT_TYPES.EXTERNAL_COLLECTION
          ? content.get('format')
          : content.get('collectionType');
      if (isClassActivity) {
        component
          .get('classActivityService')
          .addActivityToClass(
            classId,
            content.get('id'),
            collectionType,
            addedDate
          )
          .then(function() {
            component.triggerAction({ action: 'closeModal' });
          });
      } else {
        component
          .get('classService')
          .associateCourseToClass(content.get('id'), classId)
          .then(function() {
            let callback = component.get('model.callback');
            selectedClassroom.set('courseId', content.get('id'));
            callback.success();
            component.triggerAction({ action: 'closeModal' });
          });
      }
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_MYCONTENT_ADD_COURSE);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Model with the values to use in the modal
   */
  model: null,

  isNotAllow: false
});
