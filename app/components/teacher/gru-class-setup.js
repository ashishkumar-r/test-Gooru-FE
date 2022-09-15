import Ember from 'ember';
import PullUpMixin from 'gooru-web/mixins/reports/pull-up/pull-up-mixin';

export default Ember.Component.extend(PullUpMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-class-setup'],

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    this.openPullUp();
    this.loadData();
  },

  // -------------------------------------------------------------------------
  // Events
  actions: {
    //Action trigger when select a class grade
    onChangeClassGrade(grade) {
      this.set('activeClassGrade', grade);
      this.mapStudentGradeBoundValues(grade.get('id'));
    },

    //Action trigger when select a student's lower boundary
    updateStudentLowerBound(grade, studentId) {
      this.get('students')
        .findBy('id', studentId)
        .set('gradeLowerBound', grade.get('id'));
      this.setStudentGradeBoundary(
        studentId,
        grade.get('id'),
        'grade_lower_bound'
      );
    },

    //Action trigger when select a student's upper boundary
    updateStudentUpperBound(grade, studentId) {
      this.get('students')
        .findBy('id', studentId)
        .set('gradeUpperBound', grade.get('id'));
      this.setStudentGradeBoundary(
        studentId,
        grade.get('id'),
        'grade_upper_bound'
      );
    },

    //Action trigger when click confirm class setup
    onCompleteClassSetup() {
      let classGradePromise = Ember.RSVP.resolve({});
      let classStudentsGradePromise = Ember.RSVP.resolve({});
      let skylineCalculatePromise = Ember.RSVP.resolve({});
      if (
        this.get('activeClassGrade.id') !== this.get('classData.gradeCurrent')
      ) {
        classGradePromise = this.updateClassSettings();
      }
      if (this.get('updatedStudentsGradeBounds.length')) {
        classStudentsGradePromise = this.updateStudentGradeBoundaries();
      }
      if (this.get('classData.forceCalculateILP')) {
        skylineCalculatePromise = this.calculateSkyline();
      }
      Promise.all([
        classGradePromise,
        classStudentsGradePromise,
        skylineCalculatePromise,
        this.updateClassSetupFlag()
      ]).then(() => {
        this.set('isClassSetupDone', true);
        Ember.run.later(() => {
          this.sendAction('classSetupDone', this.get('classData'));
        }, 1500);
      });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} activeClassGrade
   * Property for currently tagged class grade
   */
  activeClassGrade: Ember.computed('taxonomyGrades', 'classData', function() {
    return this.get('taxonomyGrades').findBy(
      'id',
      this.get('classData.gradeCurrent')
    );
  }),

  /**
   * @property {Array} updatedStudentsGradeBounds
   * Property for list of updated students lower and or upper bounds
   */
  updatedStudentsGradeBounds: Ember.A([]),

  /**
   * @property {Object} classData
   * Property for active class data which needs to be verified
   */
  classData: Ember.Object.create({}),

  /**
   * @property {Array} taxonomyGrades
   * Property for list of taxonomy grades based on class subject
   */
  taxonomyGrades: Ember.A([]),

  /**
   * @property {Array} students
   * Property for list of students available under the class
   */
  students: Ember.A([]),

  /**
   * @property {Array} studentGradeBounds
   * Property for list of active students grade boundaries
   */
  studentGradeBounds: Ember.A([]),

  /**
   * @property {UUID} classId
   * Property for active class id
   */
  classId: Ember.computed.alias('classData.id'),

  /**
   * @property {Boolean} isClassSetupDone
   * Property to determine that the class setup is done or not
   */
  isClassSetupDone: false,

  isLoading: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadData
   * Method to load all dependency data
   */
  loadData() {
    const component = this;
    component.set('isLoading', true);
    Ember.RSVP.hash({
      taxonomyGrades: this.loadTaxonomyGrades(),
      classMembers: this.loadClassMembers()
    }).then(({ taxonomyGrades, classMembers }) => {
      component.set('taxonomyGrades', taxonomyGrades);
      component.set('students', classMembers.get('members'));
      component.set(
        'studentGradeBounds',
        classMembers.get('memberGradeBounds')
      );
      component.mapStudentGradeBoundValues().then(() => {
        component.set('isLoading', false);
      });
    });
  },

  /**
   * @function loadClassMembers
   * Method to load class members
   */
  loadClassMembers() {
    return this.get('classService').readClassMembers(this.get('classId'));
  },

  /**
   * @function loadTaxonomyGrades
   * Method to load taxonomy grades based on class subject
   */
  loadTaxonomyGrades() {
    const component = this;
    const filters = {
      subject: this.get('classData.preference.subject'),
      fw_code: this.get('classData.preference.framework') || undefined
    };
    return component.get('taxonomyService').fetchGradesBySubject(filters);
  },

  /**
   * @function updateStudentGradeBoundaries
   * Method to update selected grade boundaries for students
   */
  updateStudentGradeBoundaries() {
    const studentGradeBoundaries = {
      users: this.get('updatedStudentsGradeBounds')
    };
    return this.get('classService').classMembersSettings(
      this.get('classId'),
      studentGradeBoundaries
    );
  },

  /**
   * @function calculateSkyline
   * Method to calculate initial skyline for lower bound updated students
   */
  calculateSkyline() {
    return this.get('skylineInitialService').calculateSkyline(
      this.get('classId'),
      this.get('students').mapBy('id')
    );
  },

  /**
   * @function updateClassSettings
   * Method to update class's reroute settings
   */
  updateClassSettings() {
    const settings = {
      grade_lower_bound: this.get('classData.gradeLowerBound'),
      grade_upper_bound: this.get('activeClassGrade.id'),
      grade_current: this.get('activeClassGrade.id'),
      route0: this.get('classData.route0Applicable'),
      force_calculate_ilp: this.get('classData.forceCalculateILP'),
      preference: this.get('classData.preference')
    };
    return this.get('classService').classSettings(
      this.get('classId'),
      settings
    );
  },

  /**
   * @function updateClassSetupFlag
   * Method to update class setup complete flag to true
   */
  updateClassSetupFlag() {
    this.classData.setting['class.setup.complete'] = true;
    const classSetting = {
      setting: this.get('classData.setting')
    };
    return this.get('classService').updateClassSetupFlag(
      this.get('classId'),
      classSetting
    );
  },

  /**
   * @function mapStudentGradeBoundValues
   * Method to map all student's grade boundaries
   */
  mapStudentGradeBoundValues(classGradeLevel = null) {
    const students = this.get('students');
    const studentGradeBounds = this.get('studentGradeBounds');
    const studentPromises = students.map(student => {
      let studentId = student.get('id');
      let grade = studentGradeBounds.findBy(studentId);
      if (grade) {
        let gradeBounds = grade[studentId];
        student.set('gradeLowerBound', gradeBounds.grade_lower_bound);
        student.set(
          'gradeUpperBound',
          classGradeLevel && classGradeLevel !== gradeBounds.grade_upper_bound
            ? classGradeLevel
            : gradeBounds.grade_upper_bound
        );
      }
      return Ember.RSVP.resolve(student);
    });
    return Ember.RSVP.Promise.all(studentPromises);
  },

  /**
   * @function setStudentGradeBoundary
   * Method to set grade boundary for selected student
   */
  setStudentGradeBoundary(studentId, gradeId, boundaryValue) {
    let studentGradeBound = this.get('updatedStudentsGradeBounds').findBy(
      'user_id',
      studentId
    );
    if (studentGradeBound) {
      studentGradeBound[boundaryValue] = gradeId;
    } else {
      studentGradeBound = {
        user_id: studentId
      };
      studentGradeBound[boundaryValue] = gradeId;
      this.get('updatedStudentsGradeBounds').push(studentGradeBound);
    }
  }
});
