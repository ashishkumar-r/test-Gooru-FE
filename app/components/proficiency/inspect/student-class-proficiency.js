import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['inspect', 'student-class-proficiency'],

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {Array} filteredWeekLocal
   * Property for filtered student list
   */
  filteredWeekLocal: Ember.A([]),
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onDownloadCSV() {
      window.print();
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CLASS_PROFICIENCY_DOWNLOAD
      );
    },

    onSearchWeeklyLocal(searchWeekLocal) {
      let testing = this.get('filteredWeekLocal');
      if (!testing.length) {
        this.set(
          'filteredWeekLocal',
          getObjectsDeepCopy(this.get('studentsDomainPerformance'))
        );
      }
      let filteredStudents = getObjectsDeepCopy(
        this.get('filteredWeekLocal')
      ).filter(student => {
        searchWeekLocal = searchWeekLocal.toLowerCase();
        return (
          (student.firstName &&
            student.firstName.toLowerCase().startsWith(searchWeekLocal)) ||
          (student.lastName &&
            student.lastName.toLowerCase().startsWith(searchWeekLocal))
        );
      });
      this.set('studentsDomainPerformance', filteredStudents);
    },
    //Action triggered when select a student card
    onSelectStudentCard(student) {
      let component = this;
      component.sendAction('onSelectStudent', student);
    }
  },

  // -------------------------------------------------------------------------
  // Propeties

  /**
   * @property {Number} totalCompetencies
   */
  totalCompetencies: 0
});
