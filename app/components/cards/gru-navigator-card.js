import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['gru-navigator-card'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  taxonomyGrades: null,

  independentCourses: null,
  /**
   * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
   */
  featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

  profileService: Ember.inject.service('api-sdk/profile'),

  session: Ember.inject.service('session'),

  actions: {
    /**
     * Action triggered when click on study now button
     */
    studyNow() {
      const component = this;
      const sessionId = this.get('session.userId');
      let tenantSetting = component.get('tenantSettingsObj');
      const programCourse = component.get('course.programCourse');
      const fwCode = programCourse.get('settings.framework');
      const subjectCode = programCourse.subject;
      const filters = {
        subject: programCourse.subject
      };
      let navigatorPrograms = component.get('isEnableNavigatorPrograms');
      if (fwCode) {
        if (tenantSetting && tenantSetting.tx_fw_prefs && navigatorPrograms) {
          let isFound = tenantSetting.tx_fw_prefs[subjectCode];
          filters.fw_code = isFound ? isFound.default_fw_id : fwCode;
          programCourse.set('settings.framework', filters.fw_code);
        } else {
          filters.fw_code = fwCode;
        }
      }
      const independentParams = {
        filterOutJoinedCourses: false
      };
      if (navigatorPrograms) {
        independentParams.navigatorProgram = true;
      }
      Ember.RSVP.hash({
        taxonomyGrades: component
          .get('taxonomyService')
          .fetchGradesBySubject(filters),
        independentCourses: component
          .get('featuredCourseService')
          .getIndependentCourseList(independentParams),
        profileInfo: component.get('profileService').readUserProfile(sessionId)
      }).then(function(hash) {
        if (hash.profileInfo.info) {
          component.set('taxonomyGrades', hash.taxonomyGrades);
          component.set('independentCourses', hash.independentCourses);
          component.set('profileInfo', hash.profileInfo);
          component.getDefaultGradeLevel();
          let gradeCurrent = component.get('studentProgramBound.lowerBound');
          component.joinPublicClassbyGrade(gradeCurrent);
          component.set('isExpand', false);
          const context = {
            classId: programCourse.id,
            courseTitle: programCourse.title,
            courseId: programCourse.id,
            originalCoourseId: programCourse.originalCourseId,
            subject: programCourse.subject,
            hasJoined: programCourse.hasJoined,
            learnerCount: programCourse.learnerCount
          };
          component
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.STUDY_RECOMMENDED_COURSE, context);
        } else {
          component.get('router').transitionTo('sign-up-finish');
        }
      });
    },
    onShowMore() {
      event.stopPropagation();
      $(event.target).toggleClass('show-less');
    }
  },

  // -------------------------------------------------------------------
  // Methods

  performanceScore: Ember.computed('course', function() {
    let course = this.get('course.programCourse');
    if (course.performance && course.performance.score) {
      return course.performance.score;
    } else {
      return 0;
    }
  }),
  /**
   * @function joinPublicClassbyGrade
   * Method to join public class by student
   */
  joinPublicClassbyGrade(gradeLowerBound) {
    let courseId = this.get('course.programCourse.id');
    let featuredCourseService = this.get('featuredCourseService');
    return Ember.RSVP.hash({
      joinClass: Ember.RSVP.resolve(
        featuredCourseService.joinPublicClassbyGrade(courseId, gradeLowerBound)
      )
    }).then(({ joinClass }) => {
      this.sendAction('updateUserClasses'); // Triggers the refresh of user classes in top header
      let courseSettings = this.get('course.programCourse.settings');
      if (!courseSettings.get('gradeCurrent')) {
        this.get('router').transitionTo(
          'student.class.course-map',
          joinClass.get('classId')
        );
      } else {
        this.get('router').transitionTo(
          'student.class.proficiency',
          joinClass.get('classId'),
          {
            queryParams: {
              subProgramId: this.get('course.programCourse.subProgramId')
            }
          }
        );
      }
    });
  },

  getDefaultGradeLevel() {
    const component = this;
    let tenantSetting = component.get('tenantSettingsObj');
    const currentCourse = component.get('course.programCourse');
    let taxonomyGrades = component.get('taxonomyGrades').sortBy('sequence');
    const userProfile = component.get('profileInfo');
    let courseLowerBound;
    let frameworkId = currentCourse.get('settings.framework');
    let subjectCode = currentCourse.get('subject');
    const defaultGradeDiff = tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
      ? tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
      : null;
    const gradeDiff =
      tenantSetting.default_skyline_grade_diff &&
      tenantSetting.default_skyline_grade_diff[`${frameworkId}.${subjectCode}`]
        ? tenantSetting.default_skyline_grade_diff[
          `${frameworkId}.${subjectCode}`
        ]
        : defaultGradeDiff;
    const studentSelectedGradeLevel = taxonomyGrades.find(
      taxonomyGrade =>
        taxonomyGrade.grade.toLowerCase() ===
        userProfile.info.grade_level.toLowerCase()
    );
    // get course lower bound using the grade level diff from tenant settings
    if (gradeDiff) {
      const gradeLowerBoundSeq = studentSelectedGradeLevel.sequence - gradeDiff;
      if (gradeLowerBoundSeq >= 1) {
        courseLowerBound = taxonomyGrades.find(
          item => Number(item.sequence) === gradeLowerBoundSeq
        );
      }
    }
    let gradeLowerBoundSeq = courseLowerBound.sequence - gradeDiff;
    let gradeId;
    if (gradeLowerBoundSeq >= 1) {
      let activeGrade = taxonomyGrades.findBy(
        'sequence',
        studentSelectedGradeLevel.sequence - gradeDiff
      );
      gradeId = activeGrade.id;
    }
    component.set('studentProgramBound', {
      lowerBound: gradeId,
      upperBound: studentSelectedGradeLevel.id
    });
  }
});
