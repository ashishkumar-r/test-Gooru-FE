import Ember from 'ember';
import { ROLES, PLAYER_EVENT_SOURCE, SCORES } from 'gooru-web/config/config';
import { roundFloat } from 'gooru-web/utils/math';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['diagnostic-competency-report-pull-up'],
  // -------------------------------------------------------------------------
  // Dependencies
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * Propery of collection
   * @property {Object}
   */
  isCompetencyReport: false,

  isSelectOverallSuggestion: false,

  showSuggestionPullup: false,

  sortByScoreEnabled: false,

  /**
   * Maintains the origin value
   * @type {Object}
   */
  origin: PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,

  /**
   * defaultSuggestContentType
   * @type {String}
   */
  defaultSuggestContentType: 'collection',

  /**
   * Maintains the context object
   * @type {Object}
   */
  contextParams: Ember.computed('context', function() {
    let context = this.get('context');
    let params = Ember.Object.create({
      classId: this.get('classId'),
      collectionId: context.get('contentId'),
      collectionType: context.get('contentType'),
      suggestionOriginatorId: this.get('session.userId'),
      suggestionOrigin: ROLES.TEACHER,
      suggestionTo: ROLES.STUDENT,
      suggestionArea: this.get('origin'),
      caContentId: context.get('id')
    });
    return params;
  }),

  /**
   * Propery of collection
   * @property {Object}
   */
  collection: Ember.computed('context', function() {
    return this.get('context.collection');
  }),

  tags: Ember.computed('context.collection.standards.[]', function() {
    let standards = this.get('context.collection.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),
  courseId: Ember.computed('context', function() {
    return this.get('context.activityClass.courseId');
  }),
  competencyScore: Ember.computed('context', function() {
    let component = this;
    component.set('competencyScore', SCORES.VERY_GOOD);
    component
      .get('tenantService')
      .getActiveTenantSetting()
      .then(function(competencyDetails) {
        if (
          competencyDetails &&
          competencyDetails.competency_completion_min_score
        ) {
          let competencyScore =
            competencyDetails.competency_completion_min_score;
          let competencyDefaultScore =
            competencyDetails.competency_completion_default_min_score;
          if (
            component.get('primaryClass') &&
            component.get('primaryClass.preference')
          ) {
            const classDeatils = component.get('primaryClass.preference');
            const frameworkCode = classDeatils.get('framework');
            const subjectCode = classDeatils.get('subject');
            let minScore = competencyScore[`${frameworkCode}.${subjectCode}`]
              ? competencyScore[`${frameworkCode}.${subjectCode}`]
              : competencyDefaultScore
                ? competencyDefaultScore
                : SCORES.VERY_GOOD;
            component.set('competencyScore', minScore);
          } else {
            component.set('competencyScore', competencyDefaultScore);
          }
        } else if (
          competencyDetails &&
          competencyDetails.competency_completion_default_min_score
        ) {
          component.set(
            'competencyScore',
            competencyDetails.competency_completion_default_min_score
          );
        }
      });
    return component.get('competencyScore')
      ? component.get('competencyScore')
      : null;
  }),

  actions: {
    onStudentBasedScore(type) {
      let component = this;
      component.set('selectedStudentBasedScore', type);
      const students = component.get('students');
      let competencyScore = component.get('competencyScore');
      if (students && students.length) {
        if (type.name === 'Mastered') {
          const mastered = students.filter(student => {
            if (
              student &&
              student.performance &&
              student.performance.score >= competencyScore
            ) {
              return student;
            }
          });
          component.set('studentData', mastered);
        } else if (type.name === 'Inprogress') {
          const inprogressData = students.filter(student => {
            if (
              student &&
              student.performance &&
              student.performance.score < competencyScore
            ) {
              return student;
            }
          });
          component.set('studentData', inprogressData);
        } else {
          component.set('studentData', students.sortBy('score'));
        }
      }
    },
    onPullUpClose(closeAll) {
      let component = this;
      component.closePullUp(closeAll);
    },
    onSelectSuggestion(student) {
      Ember.set(student, 'selectedForSuggestion', true);
      this.get('studentsSelectedForSuggest').pushObject(student);
    },
    onDeSelectStudentForSuggestion(student) {
      this.get('studentsSelectedForSuggest').removeObject(student);
      Ember.set(student, 'selectedForSuggestion', false);
      if (this.get('studentsSelectedForSuggest').length === 0) {
        this.set('isSelectOverallSuggestion', false);
      }
    },
    onCloseSuggest() {
      this.set('studentsSelectedForSuggest', Ember.A());
      this.get('studentData')
        .filterBy('isChecked', true)
        .map(data => {
          Ember.set(data, 'isChecked', false);
        });
      this.set('isSelectOverallSuggestion', false);
    },
    onOpenCompetencyReport() {
      this.set('isCompetencyReport', true);
      this.sendAction('competencyReport');
    },
    onoverallSelectSuggest() {
      if (this.get('isSelectOverallSuggestion')) {
        this.set('isSelectOverallSuggestion', false);
      } else {
        this.set('isSelectOverallSuggestion', true);
      }
      this.get('studentData').map(data => {
        if (data.performance) {
          Ember.set(data, 'isChecked', this.get('isSelectOverallSuggestion'));
          this.get('studentsSelectedForSuggest').pushObject(data);
        }
      });
    },
    onOpenSuggestionPullup() {
      this.set('showSuggestionPullup', true);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CA_DIAG_ASSESSMENT_SUGGEST
      );
    },
    onSelectStudent(student) {
      let component = this;
      component.set('isShowStudentActivityReport', true);
      component.set('selectedStudent', student);
    },
    pullUpClose(closeAll) {
      let component = this;
      component.set('isShowStudentActivityReport', false);
      component.closePullUp(closeAll);
    },
    sortByScore() {
      let component = this;
      component.toggleProperty('sortByScoreEnabled');
      let studentReportData;
      if (component.get('sortByScoreEnabled')) {
        studentReportData = component
          .get('studentData')
          .sortBy('score')
          .reverse();
      } else {
        studentReportData = component.get('studentData').sortBy('score');
      }
      component.set('studentData', studentReportData);
    },
    onToggleButton(student) {
      let isChecked = !student.isChecked;
      student.set('isChecked', isChecked);
      if (isChecked) {
        this.onSelectSuggestion(student);
      } else {
        this.onDeSelectStudentForSuggestion(student);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events
  onSelectSuggestion(student) {
    Ember.set(student, 'selectedForSuggestion', true);
    this.get('studentsSelectedForSuggest').pushObject(student);
  },
  onDeSelectStudentForSuggestion(student) {
    this.get('studentsSelectedForSuggest').removeObject(student);
    Ember.set(student, 'selectedForSuggestion', false);
    if (this.get('studentsSelectedForSuggest').length === 0) {
      this.set('isSelectOverallSuggestion', false);
    }
  },

  didInsertElement() {
    this.openPullUp();
    const collectionId = this.get('context.collection.id');
    const collectionType = this.get('context.collection.format');
    const activityDate = this.get(
      'context.activityClass.activity.activation_date'
    );
    const endDate = this.get('context.activityClass.activity.end_date');
    this.get('analyticsService')
      .getDCAPerformance(
        this.get('classId'),
        collectionId,
        collectionType,
        activityDate,
        endDate
      )
      .then(response => {
        const students = this.get('members').map(member => {
          const performance = response.findBy('user', member.id);
          if (performance) {
            let competencyId = this.get('competencyData.id');
            const performanceScore = performance.resourceResults.findBy(
              'resourceId',
              competencyId
            );

            performance.set('resources', performance.resourceResults);
            performance.set('score', performanceScore.score);
            this.set('competencyId', competencyId);
          }
          let student = Ember.Object.create({
            id: member.id,
            firstName: member.firstName,
            lastName: member.lastName,
            name: `${member.lastName}, ${member.firstName}`,
            avatarUrl: member.get('avatarUrl'),
            performance: performance ? performance : null,
            score: performance ? performance.score : null,
            isChecked: false
          });
          return student;
        });

        let totPerformanceScore = 0;
        let totCompletedStudent = 0;

        students.forEach(function(student) {
          if (student.performance) {
            totPerformanceScore += student.performance.score;
            totCompletedStudent++;
          }
        });
        let competencyAvgScore = roundFloat(
          totPerformanceScore / totCompletedStudent
        );

        this.set('competencyAvgScore', competencyAvgScore);
        this.set('studentData', students.sortBy('score'));
        this.set('students', students.sortBy('score'));
      });
    this.set('studentsSelectedForSuggest', Ember.A());
    let studentScore = [
      {
        name: 'All',
        isSelected: true
      },
      {
        name: 'Mastered',
        isSelected: false
      },
      {
        name: 'Inprogress',
        isSelected: false
      }
    ];
    this.set('studentBasedScore', studentScore);
    const selectedStudentBasedScore = studentScore.find(content => {
      return content.isSelected;
    });
    this.set('selectedStudentBasedScore', selectedStudentBasedScore);
  },

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    component.$('[data-toggle="popover"]').popover({
      trigger: 'hover'
    });
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.set('showPullUp', true);
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  /**
   * Function to animate the  pullup from top to bottom
   */
  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
      }
    );
  }
});
