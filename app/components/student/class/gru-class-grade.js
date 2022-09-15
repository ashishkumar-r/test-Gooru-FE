import Ember from 'ember';

export default Ember.Component.extend({

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-class-grade'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {

    /**
     * Action triggered when click next
     */
    onMoveNext(step) {
      let component = this;
      component.sendAction('onMoveNext', step);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} classGradeLevel
   */
  classGradeLevel: Ember.computed('gradeLevel', function() {
    let component = this;
    //Class grade start from 1 instead of 0 so, minus one from class grade
    return component.get('gradeLevel') - 1;
  }),

  /**
   * @property {Array} gradeLevels
   */
  gradeLevels: Ember.computed('classGradeLevel', function() {
    let component = this;
    let gradeLevel = component.get('classGradeLevel');
    let startingLevel = gradeLevel > 3 ? gradeLevel - 3 : 1;
    let numberOfLevelsToShow = 6;
    let gradeLevelPoint = 1;
    let gradeLevels = Ember.A([]);
    while(gradeLevelPoint <= numberOfLevelsToShow) {
      gradeLevels.push(startingLevel);
      startingLevel++;
      gradeLevelPoint++;
    }
    return gradeLevels;
  })
});
