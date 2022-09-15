import Ember from 'ember';

export default Ember.Component.extend({

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['domain-competency-report'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    let domainDataSet = component.get('domainSet');
    component.set('studentCompetencyData', domainDataSet.studentCompetencies.sortBy('lastName'));
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {

    /**
     * Action triggered when click sort by first name
     */
    sortByFirstName() {
      let component = this;
      let studentCompetencyData = component.get('studentCompetencyData');
      component.set('studentCompetencyData', studentCompetencyData.sortBy('firstName'));
      component.set('sortByFirstnameEnabled', true);
      component.set('sortByLastnameEnabled', false);
    },

    /**
     * Action triggered when click sort by last name
     */
    sortByLastName() {
      let component = this;
      let studentCompetencyData = component.get('studentCompetencyData');
      component.set('studentCompetencyData', studentCompetencyData.sortBy('lastName'));
      component.set('sortByLastnameEnabled', true);
      component.set('sortByFirstnameEnabled', false);
    },

    /**
     * Action triggered when click next/previous arrows
     */
    onClickArrow(direction) {
      let component = this;
      let studentCompetenciesListContainer = component.$('.competencies-list');
      let curPos = studentCompetenciesListContainer.scrollLeft();
      let nextPos = direction === 'previous' ? curPos - 120 : curPos + 120;
      studentCompetenciesListContainer.animate({
        scrollLeft: nextPos
      }, 400);
    },

    /**
     * Action triggered when select a competency from competency report
     */
    onSelectCompetency(competency, userId) {
      let component = this;
      component.sendAction('onSelectCompetency', competency, userId);
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {sortByFirstnameEnabled}
   * Property to enable/disable sort by first name
   */
  sortByFirstnameEnabled: false,

  /**
   * @property {sortByLastnameEnabled}
   * Property to enable/disable sort by last name
   */
  sortByLastnameEnabled: true
});
