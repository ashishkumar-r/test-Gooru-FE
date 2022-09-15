import Ember from 'ember';
import { getObjectCopy } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // ----------------------------------------------------------------------
  // Attributes

  classNames: ['milestone-report'],

  // ----------------------------------------------------------------------
  // Dependencies

  dashboardService: Ember.inject.service('api-sdk/dashboard'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  i18n: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // ----------------------------------------------------------------------
  // Properties

  classId: Ember.computed('currentClass', function() {
    return this.get('currentClass.id');
  }),

  milestoneList: Ember.A([]),

  activeMilestone: null,

  isShowNavigatorMilestone: false,

  studentProfile: null,

  taxonomyCategories: Ember.A(),

  userStandardPreference: null,

  isShowProficiency: false,

  studentList: Ember.computed('activeMilestone', function() {
    return this.get('activeMilestone.students');
  }),

  navMilestoneItems: Ember.computed('milestoneList', function() {
    let milestone = {
      domainCount: 0,
      topicCount: 0,
      competencyCount: 0,
      students: Ember.A(),
      gradeSeq: 0,
      gradeName: '',
      title: this.get('i18n')
        .t('milestone-report:class-journery-report')
        .toString()
    };
    let milestoneList = this.get('milestoneList');
    milestoneList.forEach(item => {
      milestone.domainCount += item.domainCount;
      milestone.topicCount += item.topicCount;
      milestone.competencyCount += item.competencyCount;
      item.students.forEach(student => {
        let existingStudent = milestone.students.findBy('id', student.id);
        if (existingStudent) {
          let activeGradeSeq =
            item.gradeSeq > milestone.gradeSeq
              ? item.gradeSeq
              : milestone.gradeSeq;
          existingStudent.setProperties({
            averageScore: parseInt(
              (existingStudent.averageScore + student.averageScore) / 2,
              0
            ),
            totalCompetencies: parseInt(
              existingStudent.totalCompetencies + student.totalCompetencies,
              0
            ),
            completedCompetencies: parseInt(
              existingStudent.completedCompetencies +
                student.completedCompetencies,
              0
            ),
            highestCompetency: (activeGradeSeq === item.gradeSeq &&
            student.highestCompetency
              ? student
              : existingStudent
            ).highestCompetency,
            highestCompetencyTitle: (activeGradeSeq === item.gradeSeq &&
            student.highestCompetency
              ? student
              : existingStudent
            ).highestCompetencyTitle
          });
          milestone.gradeSeq = activeGradeSeq;
          milestone.gradeName =
            activeGradeSeq === item.gradeSeq
              ? item.gradeName
              : milestone.gradeName;
        } else {
          milestone.gradeSeq = item.gradeSeq;
          milestone.gradeName = item.gradeName;
          milestone.students.push(getObjectCopy(student));
        }
      });
    });
    return milestone;
  }),

  // ----------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.fetchMilestoneStats();
  },

  didRender() {
    this.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // ----------------------------------------------------------------------
  // Actions

  actions: {
    onSelectMilestone(milestone) {
      if (milestone) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PO_DATA_BY_MILESTONE_SELECTED
        );
        this.set('activeMilestone', milestone);
        this.set('studentList', milestone.students);
        this.set('isShowNavigatorMilestone', false);
      }
    },

    onNavigatorMilestone() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_MILESTONE_ALL
      );
      this.set('isShowNavigatorMilestone', true);
      this.set('activeMilestone', this.get('navMilestoneItems'));
      this.set('studentList', this.get('navMilestoneItems.students'));
    },

    onCloseNavMilestone() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_MILESTONE_CLEAR
      );
      let activeMilestone = this.get('milestoneList').get(0);
      this.send('onSelectMilestone', activeMilestone);
    },

    onSelectStudent(student) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_DATA_BY_MILESTONE_SORT);
      let queryParams = {
        activeStudentId: student.id
      };
      component
        .get('router')
        .transitionTo('teacher.class.course-map', { queryParams });
    },

    onGoBack() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_MILESTONE_BACK
      );
      this.sendAction('onGoBack');
    },

    onSearchStudent() {
      let terms = event.target.value;
      this.searchStudentList(terms);
    }
  },
  // ----------------------------------------------------------------------
  // Methods

  fetchMilestoneStats() {
    const component = this;
    const dashboardService = component.get('dashboardService');
    const classId = component.get('classId');
    const classFramework = component.get('classFramework');
    const isDefaultShowFW = component.get('isDefaultShowFW');
    let params = {
      classId
    };
    dashboardService
      .fetchMilestoneStats(params, classFramework, isDefaultShowFW)
      .then(milestoneList => {
        component.set('milestoneList', milestoneList);
        this.send('onSelectMilestone', milestoneList.get(0));
      });
  },

  loadStudentData(studentData) {
    const component = this;
    Ember.RSVP.hash({
      taxonomyCategories: component.get('taxonomyService').getCategories(),
      userPreference: component.get('profileService').getProfilePreference(),
      studentProfile: component
        .get('profileService')
        .readUserProfile(studentData.id)
    }).then(hash => {
      component.set('taxonomyCategories', hash.taxonomyCategories);
      component.set('userStandardPreference', hash.userPreference);
      component.set('studentProfile', hash.studentProfile);
      component.set('isShowProficiency', true);
    });
  },

  searchStudentList(terms) {
    const component = this;
    let convertText = text => (text ? text.toLowerCase() : text);
    const studentList = component.get('activeMilestone.students');
    const filteredStudent = Ember.copy(studentList).filter(student => {
      return (
        convertText(student.lastName).startsWith(convertText(terms)) ||
        convertText(student.firstName).startsWith(convertText(terms))
      );
    });
    component.set('studentList', filteredStudent);
  }
});
