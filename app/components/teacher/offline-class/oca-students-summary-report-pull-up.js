import Ember from 'ember';
import { ROLES, PLAYER_EVENT_SOURCE, SCORES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

export default Ember.Component.extend(
  TenantSettingsMixin,
  InstructionalCoacheMixin,
  {
    classNames: ['oca-students-summary-report-pull-up'],

    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @requires service:api-sdk/analytics
     */
    analyticsService: Ember.inject.service('api-sdk/analytics'),
    /**
     * @requires service:api-sdk/class-activity
     */
    classActivityService: Ember.inject.service('api-sdk/class-activity'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @requires service:session
     */
    session: Ember.inject.service('session'),

    /**
     * Propery of class id
     * @property {Number}
     */
    classId: null,

    /**
     * Propery of context from parent
     * @property {Object}
     */
    context: null,

    /**
     * Maintains the origin value
     * @type {Object}
     */
    origin: PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,

    isSelectOverallSuggestion: false,

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
            if (component.get('class.preference')) {
              const classDeatils = component.get('class.preference');
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

    /**
     * defaultSuggestContentType
     * @type {String}
     */
    defaultSuggestContentType: 'collection',

    /**
     * Propery of students
     * @property {Array}
     */
    students: Ember.A([]),

    /**
     * Maintains list of students selected for  suggest
     * @type {Array}
     */
    studentsSelectedForSuggest: Ember.A([]),

    /**
     * Propery of performance activities
     * @property {Array}
     */
    activitiesPerformance: Ember.computed('classActivities', function() {
      let component = this;
      let classActivities = component.get('classActivities');
      let filteredActivites = classActivities.filter(function(activity) {
        return !!activity.collection.performance;
      });
      return filteredActivites;
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

    /**
     * @property {Number} questionTimespent
     */
    collectionAverageTimespent: Ember.computed(
      'collection.performance',
      function() {
        return this.get('collection.performance.averageTimespent');
      }
    ),

    /**
     * Propery of context observer
     * @property {Observer}
     */
    contextObserver: Ember.observer(
      'context',
      'context.collection.performance',
      function() {
        this.loadData();
      }
    ),

    /**
     * @property {Number}
     */
    selectedIndex: Ember.computed('context', function() {
      let component = this;
      let selectedSummary = component.get('context');
      let activitiesPerformance = component.get('activitiesPerformance');
      return activitiesPerformance.indexOf(selectedSummary);
    }),

    /**
     * @property {Boolean}
     */
    isToggleLeft: Ember.computed('context', function() {
      let component = this;
      let selectedIndex = component.get('selectedIndex');
      return selectedIndex > 0;
    }),

    /**
     * @property {Boolean}
     */
    isToggleRight: Ember.computed('context', function() {
      let component = this;
      let selectedIndex = component.get('selectedIndex');
      let length = component.get('activitiesPerformance').length;
      return selectedIndex < length - 1;
    }),

    /**
     * Propery to hide the default pullup.
     * @property {Boolean}
     */
    showPullUp: false,

    /**
     * @property {Boolean}
     */
    isLoading: false,

    /**
     * @property {Object}
     */
    selectedStudent: null,

    /**
     * @property {Boolean}
     */
    isShowStudentActivityReport: false,

    sortByScoreEnabled: false,

    /**
     * @property {Boolean}
     */
    isShowCarousel: Ember.computed('classActivities', function() {
      let component = this;
      let classActivities = component.get('classActivities');
      return !!classActivities.length;
    }),

    isInstructionalCoache: Ember.computed(function() {
      return this.instructionalCoache();
    }),

    taxonomyLength: Ember.computed('context.collection.standards', function() {
      return this.get('context.collection.standards').length;
    }),

    actions: {
      onStudentBasedScore(type) {
        let component = this;
        component.set('selectedStudentBasedScore', type);
        const students = component.get('studentData').copy();
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
            component.set('students', mastered);
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
            component.set('students', inprogressData);
          } else {
            component.set('students', students.sortBy('score'));
          }
        }
      },
      onPullUpClose(closeAll) {
        let component = this;
        component.closePullUp(closeAll);
      },

      pullUpClose(closeAll) {
        let component = this;
        component.set('isShowStudentActivityReport', false);
        component.closePullUp(closeAll);
      },

      onSelectStudent(student) {
        let component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_STUDENT_REPORT);
        component.set('isShowStudentActivityReport', true);
        component.set('selectedStudent', student);
      },

      onSelectStudentForSuggestion(student) {
        if (this.get('context.contentType') === 'assessment') {
          this.get('studentsSelectedForSuggest').pushObject(student);
          student.set('selectedForSuggestion', true);
        }
      },

      onDeSelectStudentForSuggestion(student) {
        this.get('studentsSelectedForSuggest').removeObject(student);
        student.set('selectedForSuggestion', false);
        if (this.get('studentsSelectedForSuggest').length === 0) {
          this.set('isSelectOverallSuggestion', false);
        }
      },

      onOpenSuggestionPullup(contentType) {
        this.set('showSuggestionPullup', true);
        this.set('defaultSuggestContentType', contentType);
      },

      onCloseSuggest() {
        this.set('studentsSelectedForSuggest', Ember.A());
        if (this.get('isEnableCaBaseline')) {
          this.get('students')
            .filterBy('isChecked', true)
            .map(data => {
              data.set('isChecked', false);
            });
          this.set('isSelectOverallSuggestion', false);
        } else {
          this.get('students')
            .filterBy('selectedForSuggestion', true)
            .map(data => {
              data.set('selectedForSuggestion', false);
            });
        }
      },

      toggle(isLeft) {
        let component = this;
        let currentIndex = component.get('selectedIndex');
        let allSummary = component.get('activitiesPerformance');
        let indexPosition = isLeft ? currentIndex - 1 : currentIndex + 1;
        let summary = allSummary.objectAt(indexPosition);
        if (summary) {
          component.set('context', summary);
        }
      },

      onOpenPerformanceEntry() {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_UPLOAD_DATA);
        const classActivity = component.get('context.activityClass');
        component.sendAction('onOpenPerformanceEntry', classActivity);
      },
      sortByScore() {
        let component = this;
        component.toggleProperty('sortByScoreEnabled');
        let studentReportData = [];
        if (component.get('sortByScoreEnabled')) {
          studentReportData = component
            .get('students')
            .sortBy('score')
            .reverse();
        } else {
          studentReportData = component.get('students').sortBy('score');
        }
        component.set('students', studentReportData);
      },
      onToggleButton(student) {
        let isChecked = !student.isChecked;
        student.set('isChecked', isChecked);
        if (isChecked) {
          this.send('onSelectStudentForSuggestion', student);
        } else {
          this.send('onDeSelectStudentForSuggestion', student);
        }
      },
      onoverallSelectSuggest() {
        if (this.get('isSelectOverallSuggestion')) {
          this.set('isSelectOverallSuggestion', false);
        } else {
          this.set('isSelectOverallSuggestion', true);
        }
        this.get('students').map(data => {
          if (data.performance) {
            Ember.set(data, 'isChecked', this.get('isSelectOverallSuggestion'));
            this.get('studentsSelectedForSuggest').pushObject(data);
          }
        });
      }
    },

    // -------------------------------------------------------------------------
    // Events

    didInsertElement() {
      this.openPullUp();
      this.handleAppContainerScroll();
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

    didDestroyElement() {
      this.handleAppContainerScroll();
    },

    didRender() {
      var component = this;
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
    },

    init() {
      let component = this;
      component._super(...arguments);
      component.set('studentsSelectedForSuggest', Ember.A());
      component.loadData();
    },

    /**
     * Function to animate the  pullup from bottom to top
     */
    openPullUp() {
      let component = this;
      component.set('showPullUp', true);
      component.$().animate(
        {
          bottom: '0'
        },
        400
      );
    },

    /**
     * Function to animate the  pullup from top to bottom
     */
    closePullUp(closeAll) {
      let component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
          component.sendAction('onClosePullUp', closeAll);
        }
      );
    },

    /**
     * Function to hanle the pullup scroll
     */
    handleAppContainerScroll() {
      let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
        .length;
      if (activePullUpCount > 0) {
        Ember.$(document.body).addClass('no-vertical-scroll');
      } else if (activePullUpCount === 0) {
        Ember.$(document.body).removeClass('no-vertical-scroll');
      }
    },

    loadData() {
      const component = this;
      component.loadCAReport();
    },

    loadCAReport() {
      const component = this;
      const classId = component.get('classId');
      const activityId = component.get('context.id');
      const format = component.get('context.collection.format');
      const collectionType =
        format === 'collection' || format === 'collection-external'
          ? 'collection'
          : 'assessment';
      const collectionId = component.get('context.collection.id');
      const activityDate = component.get('context.activation_date');
      const endDate = component.get('context.end_date');
      component.set('isLoading', true);
      return Ember.RSVP.hash({
        usersClassActivity: component
          .get('classActivityService')
          .fetchUsersForClassActivity(classId, activityId),
        studentsPerformance: component
          .get('analyticsService')

          .getDCAPerformance(
            classId,
            collectionId,
            collectionType,
            activityDate,
            endDate
          )
      }).then(({ usersClassActivity, studentsPerformance }) => {
        if (!component.isDestroyed) {
          component.parseClassMembers(
            usersClassActivity,
            studentsPerformance,
            collectionType
          );
        }
        component.set('isLoading', false);
      });
    },

    parseClassMembers(usersClassActivity, studentsPerformance, collectionType) {
      let component = this;
      let students = Ember.A([]);
      let members = usersClassActivity.filterBy('isActive', true);
      let score = null;
      members.forEach(member => {
        let memberId = member.get('id');
        let lastName = member.get('lastName');
        let firstName = member.get('firstName');
        let performance = studentsPerformance.filterBy('user', memberId);
        let isShareData = this.get('members')
          ? this.get('members').findBy('id', memberId)
          : null;
        let student = Ember.Object.create({
          id: memberId,
          firstName: firstName,
          lastName: lastName,
          name: `${lastName}, ${firstName}`,
          avatarUrl: member.get('avatarUrl'),
          isShowLearnerData: isShareData
            ? isShareData.isShowLearnerData
            : false,
          performance: component.parseCollectionPerformanceData(
            collectionType,
            performance
          ),
          isChecked: false
        });
        student.score =
          student && student.performance && student.performance.score
            ? student.performance.score
            : null;
        if (
          student &&
          student.performance &&
          student.performance.score !== null
        ) {
          score = score + student.performance.score;
        }
        students.pushObject(student);
      });
      const performanceData = students.filter(
        student => student.get('performance') !== null
      );
      if (performanceData && performanceData.length) {
        if (score === null) {
          component.set('collection.performance.score', null);
        } else {
          let actScore = score / performanceData.length;
          component.set('collection.performance.score', Math.round(actScore));
        }
      }
      component.set('students', students.sortBy('score'));
      component.set('studentData', this.get('students').copy());
    },

    parseCollectionPerformanceData(collectionType, collectionPerformance) {
      let performance = collectionPerformance.objectAt(0);
      let isAssessment =
        collectionType === 'assessment' ||
        collectionType === 'assessment-external';
      let collectionPerformanceData = null;
      if (performance) {
        let isGraded = false;
        if (performance.resourceResults) {
          const evidenceData = performance.resourceResults.map(result => {
            return result.isGraded === false;
          });
          isGraded = evidenceData.contains(true);
        }
        collectionPerformanceData = Ember.Object.create({
          type: collectionType,
          score: isAssessment ? performance.assessment.score : null,
          timeSpent: isAssessment
            ? performance.assessment.timespent
            : performance.collection.timeSpent,
          resources: performance.resourceResults,
          isGraded: isGraded
        });
      }
      return collectionPerformanceData;
    }
  }
);
