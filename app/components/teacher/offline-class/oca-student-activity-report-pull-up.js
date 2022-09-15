import Ember from 'ember';
import { sumAll } from 'gooru-web/utils/math';
import {
  downloadAllSubmision,
  setDownloadPathForUrl,
  getObjectCopy
} from 'gooru-web/utils/utils';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['oca-student-activity-report-pull-up'],
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service(),

  /**
   * @property {Boolean} isTeacher
   */
  isTeacher: Ember.computed.equal('session.role', 'teacher'),

  /**
   * Propery of class id
   * @property {Number}
   */
  classId: null,

  /**
   * Propery of student
   * @property {Object}
   */
  student: null,

  /**
   * @property {Object}
   */
  collection: null,

  /**
   * @property {Array}
   */
  resourcesCollection: null,

  /**
   * Propery to hide the default pullup.
   * @property {Boolean}
   */
  showPullUp: false,

  /**
   * @property {Boolean}
   */
  isLoading: false,

  studentTimeSpent: null,

  /**
   * Propery to hide the default pullup.
   * @property {Boolean}
   */
  performedStudents: Ember.computed('students', function() {
    let component = this;
    let students = component.get('students');
    let filteredStudents = students.filter(function(student) {
      return !!student.performance;
    });
    return filteredStudents;
  }),

  /**
   * Propery to student observer.
   * @property {Observer}
   */
  studentObserver: Ember.observer('student', function() {
    this.loadData();
  }),

  /**
   * @property {Number}
   */
  selectedIndex: Ember.computed('student', function() {
    let component = this;
    let selectedStudent = component.get('student');
    let performedStudents = component.get('performedStudents');
    return performedStudents.indexOf(selectedStudent);
  }),

  /**
   * @property {Boolean}
   */
  isToggleLeft: Ember.computed('student', function() {
    let component = this;
    let selectedIndex = component.get('selectedIndex');
    return selectedIndex > 0;
  }),

  /**
   * @property {Boolean}
   */
  isToggleRight: Ember.computed('student', function() {
    let component = this;
    let selectedIndex = component.get('selectedIndex');
    let length = component.get('performedStudents').length;
    return selectedIndex < length - 1;
  }),

  isShowDownloadIcon: Ember.computed('resourcesCollection', function() {
    let component = this;
    let uploadData = [];
    if (component.get('resourcesCollection')) {
      component.get('resourcesCollection').forEach((evidenceData, index) => {
        if (
          evidenceData &&
          evidenceData.performance &&
          evidenceData.performance.evidence &&
          evidenceData.performance.evidence.length
        ) {
          evidenceData.performance.evidence.map(item => {
            const fileItem = {
              fileUrl: setDownloadPathForUrl(item.fileName),
              orginalFileName: item.originalFileName,
              sequenceCode: index + 1
            };
            uploadData.push(fileItem);
            component.set('submissionData', uploadData);
          });
        }
      });
    }
    if (component.get('submissionData')) {
      return !!(
        component.get('submissionData') &&
        component.get('submissionData').length
      );
    }
  }),

  /**
   * @property {Boolean}
   */
  isAssessment: Ember.computed('collection', function() {
    return this.get('collection.collectionType') === 'assessment';
  }),

  /**
   * @property {Boolean}
   */
  isCollection: Ember.computed('collection', function() {
    return this.get('collection.collectionType') === 'collection';
  }),

  isAnswerKeyHidden: true,

  showPerformance: true,

  classFramework: Ember.computed('class', function() {
    return this.get('class.preference')
      ? this.get('class.preference.framework')
      : null;
  }),

  actions: {
    onClickDownload() {
      if (this.get('submissionData')) {
        const studName = `${this.get('student.firstName')}_${this.get(
          'student.lastName'
        )}`;
        const filename = `${studName}_${this.get('collection.title')}`;
        downloadAllSubmision(this.get('submissionData'), filename, studName);
      }
    },
    onShowPullUp(evidenceData) {
      this.set('activeFile', evidenceData);
      this.set('isShowFilePullUp', true);
    },
    onClosePullup: function() {
      this.set('activeFile', null);
      this.set('isShowFilePullUp', false);
    },
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    onToggleQuestion(resource, resourceSeq) {
      let component = this;
      component
        .$(`.resource-${resourceSeq} .resource-description`)
        .toggleClass('hidden');
    },

    onCloseStudentActivity() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(
          PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_STUDENT_REPORT_CLEAR
        );
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
        }
      );
    },
    toggle(isLeft) {
      let component = this;
      let currentIndex = component.get('selectedIndex');
      let performedStudents = component.get('performedStudents');
      let indexPosition = isLeft ? currentIndex - 1 : currentIndex + 1;
      let student = performedStudents.objectAt(indexPosition);
      if (student) {
        component.set('student', student);
      }
    },

    selectPerformanceOption(showPerformance) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_STUDENT_REPORT_PERF
      );
      this.set('showPerformance', showPerformance);
      this.set('isAnswerKeyHidden', showPerformance);
    },
    /**
     * Trigger handle toggle sections, based on element id.
     */
    onToggleAnswerSection(element) {
      let component = this;
      if (!component.$(element).hasClass('slide-up')) {
        component
          .$(element)
          .find('.user-answer-list')
          .slideUp();
        component.$(element).addClass('slide-up');
      } else {
        component
          .$(element)
          .find('.user-answer-list')
          .slideDown();
        component.$(element).removeClass('slide-up');
      }
    }
  },
  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this.openPullUp();
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  init() {
    let component = this;
    component._super(...arguments);
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
        top: '10%'
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
        if (!component.get('competencyId')) {
          component.sendAction('onClosePullUp', closeAll);
        }
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
    let component = this;
    const collectionId = component.get('collection.id');
    const format = component.get('collection.format');
    const classFramework = component.get('classFramework');
    const isDefaultShowFW = component.get('isDefaultShowFW');
    component.set('isLoading', true);
    let collectionPromise;
    if (format === 'collection') {
      collectionPromise = component
        .get('collectionService')
        .readCollection(collectionId, classFramework, isDefaultShowFW);
    } else if (format === 'assessment') {
      collectionPromise = component
        .get('assessmentService')
        .readAssessment(collectionId, classFramework, isDefaultShowFW);
    } else if (format === 'assessment-external') {
      collectionPromise = component
        .get('assessmentService')
        .readExternalAssessment(collectionId, classFramework, isDefaultShowFW);
    } else {
      collectionPromise = component
        .get('collectionService')
        .readExternalCollection(collectionId, classFramework, isDefaultShowFW);
    }
    return Ember.RSVP.hash({
      collection: collectionPromise
    }).then(({ collection }) => {
      if (!component.isDestroyed) {
        if (component.get('competencyId')) {
          component.set(
            'resourcesCollection',
            collection.children.findBy('id', component.get('competencyId'))
          );
          let resource = component
            .get('student')
            .performance.resources.findBy(
              'resourceId',
              component.get('competencyId')
            );
          component.set('userAnswer', resource.userAnswer);
        } else {
          component.parseCollectionResource(collection.children);
        }
        component.set('isLoading', false);
      }
    });
  },

  parseCollectionResource(resources) {
    let component = this;
    let resourcesPerformance = component.get('student.performance.resources');
    let resourceTimeSpent = Ember.A();
    const parseQuestions = (resources, resourcesPerformance) => {
      resources.map(resource => {
        let performance = resourcesPerformance
          .filterBy('resourceId', resource.id)
          .objectAt(0);
        let feedback = null;
        if (
          component.get('student') &&
          component.get('student').performance &&
          component.get('student').performance.resources
        ) {
          feedback = component
            .get('student')
            .performance.resources.filterBy('resourceId', resource.id)
            .objectAt(0);
        }
        if (performance) {
          performance = getObjectCopy(performance);
          resourceTimeSpent.push(performance.timeSpent);

          performance.set(
            'feedbackComment',
            feedback && feedback.feedbackComment
              ? feedback.feedbackComment
              : null
          );
          performance.set('standards', resource.standards);
          performance.set('type', resource.type);
          performance.set('title', resource.title);
          if (resource.type === 'FIB') {
            performance.set('fibText', FillInTheBlank.toFibText(resource.text));
            performance.set('isFIB', true);
          }
          performance.set('text', resource.text);
          if (resource.format !== 'question') {
            performance.set('format', resource.format || null);
          }
          performance.set('answers', resource.answers);
          performance.set(
            'hintExplanationDetail',
            resource.hintExplanationDetail
          );
          performance.set('exemplarDocs', resource.exemplarDocs);
          performance.set('questionText', resource.questionText);
          performance.set('description', resource.description || null);
          resource.set('answerObject', performance.answerObject);
          resource.set('performance', performance);
          resource.set('resource', performance);
          resource.set('answered', performance.submittedAnswer);
          resource.set(
            'started',
            !!(performance.score || performance.score === 0)
          );
          resource.set('userAnswer', performance.userAnswer);
          resource.set('tooltip', performance.tooltip);
          resource.set('score', performance.score);
          resource.set('feedbackComment', performance.feedbackComment);
          resource.set('correct', performance.correct);
          resource.set('timeSpent', performance.timeSpent);
          resource.set('reaction', performance.reaction);
          resource.set('isGraded', performance.isGraded);
          resource.set('evidence', performance.evidence);
          resource.set('skipped', !performance.submittedAnswer);
          component.set('submittedAt', performance.eventTime);
          if (resource.subQuestions) {
            parseQuestions(resource.subQuestions, performance.subQuestions);
          }
        } else {
          resource.set('answerObject', []);
          resource.set('performance', []);
          resource.set('resource', []);
          resource.set('answered', false);
          resource.set('started', false);
          resource.set('userAnswer', []);
          resource.set('tooltip', '');
          resource.set('score', null);
          resource.set('correct', '');
          resource.set('feedbackComment', null);
          resource.set('timeSpent', null);
          resource.set('reaction', null);
          resource.set('isGraded', true);
          resource.set('evidence', []);
          resource.set('skipped', true);
          resource.set('resource', resource);
        }
        resource.set('format', resource.format);
      });
    };

    parseQuestions(resources, resourcesPerformance);

    if (resourceTimeSpent && resourceTimeSpent.length) {
      component.set('studentTimeSpent', sumAll(resourceTimeSpent));
    }
    resources.forEach(resourceData => {
      resourceData.isShowEvidence = !!(
        resourceData &&
        resourceData.performance &&
        resourceData.performance.evidence &&
        resourceData.performance.evidence.length
      );
    });
    component.set('resourcesCollection', resources);
  }
});
