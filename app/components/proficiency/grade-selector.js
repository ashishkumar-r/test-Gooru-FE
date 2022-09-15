import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  session: Ember.inject.service('session'),
  classNames: ['grade-selector'],

  isSelectBaseLine: false,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didRender() {
    let component = this;
    component.$('.more').popover({
      html: true,
      trigger: 'hover',
      animation: true,
      placement: 'auto',
      content: () => {
        return component.$('.more-active-grades').html();
      }
    });
  },

  didInsertElement() {
    let component = this;
    let role = this.get('session.role');
    Ember.run.schedule('afterRender', component, function() {
      setTimeout(() => {
        if (component.get('classGrade')) {
          let taxonomyGrades = component.get('taxonomyGrades');
          let classGrade = taxonomyGrades.findBy(
            'id',
            component.get(
              role === 'student'
                ? 'classGrade'
                : 'studentDestination.grade_upper_bound'
            )
          );
          if (classGrade) {
            classGrade.set('isClassGrade', true);
            let profileDetails = this.get('studentProfile');
            let info =
              profileDetails && profileDetails.info
                ? profileDetails.info
                : null;
            let taxonomy = null;
            if (this.get('isPublic') && info) {
              component.set('studentGradeLevel', info.grade_level);
              taxonomy = taxonomyGrades.findBy('grade', info.grade_level);
              taxonomy.set('isClassGrade', true);
            }
            component.send('selectGrade', taxonomy ? taxonomy : classGrade);
          }
        }
      }, 1000);
    });
  },

  actions: {
    onDownloadCSV() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PROFICIENCY_CHARTS_DOWNLOAD
      );
      window.print();
    },

    selectGrade(grade) {
      let component = this;
      component.set('activeGrade', grade);
      component.sendAction('onSelectGrade', grade);
    },

    onToggleBaseline() {
      let component = this;
      component.toggleProperty('isSelectBaseLine');
      component.sendAction('onToggleBaseline');
    },

    onCloseGrade() {
      let component = this;
      component.set('activeGrade', null);
      component.sendAction('onSelectGrade', null);
    }
  }
});
