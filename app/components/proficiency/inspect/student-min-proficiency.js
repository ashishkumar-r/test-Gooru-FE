import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-min-proficiency'],

  reportService: Ember.inject.service('api-sdk/report'),

  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Properties

  studentList: Ember.A([]),

  classData: null,

  classMembers: Ember.A([]),

  summaryData: Ember.A(),

  isLoading: false,

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    this.fetchProficiencySummary();
  },

  //--------------------------------------------------------------------------
  //Actions
  actions: {
    goBacktoPerformance() {
      const component = this;
      const classId = component.get('classData.id');
      component.get('router').transitionTo('teacher.class.atc', classId);
    },

    onSearchStudent() {
      const terms = event.target.value;
      this.searchStudentList(terms);
    }
  },

  // ---------------------------------------------------------------------------
  // Methods
  fetchProficiencySummary() {
    const component = this;
    const classData = component.get('classData');
    const classMembers = component.get('classMembers');
    component.set('isLoading', true);
    const params = {
      classId: classData.id,
      courseId: classData.courseId
    };
    component
      .get('reportService')
      .fetchMinProficiencySummary(params)
      .then(proficiencyData => {
        proficiencyData.forEach(item => {
          const activeStudent = classMembers.findBy('id', item.userId);
          item.set('studentDetail', activeStudent);
        });
        component.set('isLoading', false);
        component.setProperties({
          summaryData: proficiencyData,
          studentList: proficiencyData
        });
      });
  },

  searchStudentList(terms) {
    const component = this;
    let convertText = text => (text ? text.toLowerCase() : text);
    const studentList = component.get('summaryData');
    const filteredStudent = Ember.copy(studentList).filter(student => {
      const studentDetail = student.studentDetail;
      return (
        convertText(studentDetail.lastName).startsWith(convertText(terms)) ||
        convertText(studentDetail.firstName).startsWith(convertText(terms))
      );
    });
    component.set('studentList', filteredStudent);
  }
});
