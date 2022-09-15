import Ember from 'ember';
import {
  CLASS_SKYLINE_INITIAL_DESTINATION,
  PROFICIENCY_STAT_ITERATION_MAX_INTERVAL_TIME,
  PROFICIENCY_STAT_ITERATION_INTERVAL_TIME,
  SCREEN_SIZES
} from 'gooru-web/config/config';
import LearningJourneyMixin from 'gooru-web/mixins/learning-journey-mixin';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(
  LearningJourneyMixin,
  StudentLearnerProficiency,
  {
    // -------------------------------------------------------------------------
    // Attributes
    classNames: ['student-inspect-destination'],

    classNameBindings: ['type'],

    // -------------------------------------------------------------------------
    // Dependencies

    route0Service: Ember.inject.service('api-sdk/route0'),

    session: Ember.inject.service('session'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

    /**
     * @type {CourseService} Service to retrieve course information
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @requires service:api-sdk/class
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @type {SkylineInitialService} Service to retrieve skyline initial service
     */
    skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    userDisplayName: undefined,

    isShowIndependentClass: false,

    /**
     * @property {Boolean} isAllContentsAreRescoped
     */
    isAllContentsAreRescoped: false,

    activeSubject: Ember.computed('class', function() {
      return {
        id: this.get('subjectCode')
      };
    }),

    studentProfile: Ember.computed('session', function() {
      return {
        id: this.get('session.userId')
      };
    }),

    // -------------------------------------------------------------------------
    // Observers

    doReDraw: Ember.observer('reDrawChart', function() {
      let component = this;
      let reDrawChart = component.get('reDrawChart');
      if (reDrawChart) {
        Ember.run.later(function() {
          component.doAnimation();
        }, 500);
      }
    }),

    isAudioPlaying: false,

    descAudioURL: null,

    isGradeAudioPlaying: false,

    gradeAudioURL: null,

    isMobileView: isCompatibleVW(SCREEN_SIZES.SMALL),

    isDisableEditIcon: false,

    // -------------------------------------------------------------------------
    // Events

    didInsertElement() {
      this.loadDataBySubject();
      this.send('onChartDrawComplete');
      this.setNavbar(true);
      if (this.get('defaultGradeLevel')) {
        this.send('updateLocation', false);
      }
      if (this.get('type') === 'destination') {
        this.doGradeAnimation();
      }
      let activeSubPrograme = this.get('activeSubPrograme');
      if (activeSubPrograme) {
        this.set('isNextEnable', true);
        let independentCourses = this.get('independentCourses');
        let currentCourse = independentCourses.findBy(
          'id',
          this.get('courseId')
        );
        if (currentCourse && currentCourse.navigatorProgramInfo) {
          this.set(
            'isDisableEditIcon',
            !currentCourse.navigatorProgramInfo.navigate_program_grade_edit
          );
        }
      }
    },

    didRender() {
      var component = this;
      const { getOwner } = Ember;
      let routerObserver = getOwner(this).lookup('controller:application');
      let currentPath = routerObserver.currentPath;
      component.set(
        'isShowIndependentClass',
        currentPath === 'student.class.proficiency'
      );
      component.set(
        'userDisplayName',
        component.get('session.userData.userDisplayName')
      );
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
      component.$('[data-toggle="popover"]').popover({
        trigger: 'hover'
      });
      this.$(
        '.route-item, .location-item, .location-info, .destination-info, .start-study-info'
      ).off('click');
      this.setupTooltip('route-item', 'show-route-description');
      this.setupTooltip('location-item', 'show-location-description');
      this.setupTooltip('location-info', 'show-lo-description');
      this.setupTooltip('destination-info', 'show-destination-description');
      this.setupTooltip('start-study-info', 'start-study');
    },

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      /**
       * Action triggered when move to next screen
       */
      onMoveNext(curStep) {
        let component = this;
        let element = this.$('.route-item');
        if (element.hasClass('list-open')) {
          element.removeClass('list-open').popover('hide');
        }
        if (this.get('isPublic') && this.get('isPremiumClass')) {
          if (curStep === 'route') {
            let userId = this.get('session.userId');
            let classId = this.get('class.id');
            let gradeLowerBound = this.get('studentMathGrade.id');
            let gradeUpperBound = this.get('studentDestinationGrade.id');
            let forceCalculateILP = this.get('forceCalculateIlp');
            let defaultGradeLevel = this.get('defaultGradeLevel');
            let activeGrade = component.get('activeGrade.id');
            let levelId =
              this.get('studentMathGrade.level_id') ||
              this.get('studentMathGrade.levelId');
            let studentsSetting = {
              users: [
                {
                  user_id: userId,
                  grade_lower_bound: parseInt(gradeLowerBound),
                  grade_upper_bound: activeGrade
                    ? activeGrade
                    : gradeUpperBound,
                  force_calculate_ilp: forceCalculateILP
                }
              ]
            };
            if (defaultGradeLevel) {
              studentsSetting.users[0].grade_level = parseInt(
                defaultGradeLevel
              );
            }
            if (levelId) {
              studentsSetting.users[0].grade_level = parseInt(levelId);
            }
            let updateStudentsId = [];
            component.set('isBaselineGenerating', true);
            component
              .get('classService')
              .classMembersSettings(classId, studentsSetting)
              .then(function() {
                if (forceCalculateILP) {
                  updateStudentsId.push(userId);
                  component
                    .get('skylineInitialService')
                    .calculateSkyline(classId, updateStudentsId)
                    .then(function() {
                      component.fetchClassMemberBounds(classId, curStep);
                    });
                } else {
                  component.fetchClassMemberBounds(classId, curStep);
                }
              });
            this.setNavbar(false);
            component
              .get('parseEventService')
              .postParseEvent(PARSE_EVENTS.SHOW_ROUTE);
          }
        }
        if (this.get('isPublic') && this.get('isPremiumClass')) {
          if (curStep !== 'destination') {
            component.sendAction('onMoveNext', curStep);
          }
        } else {
          component.sendAction('onMoveNext', curStep);
        }
        if (component.get('isPublic') && component.get('isPremiumClass')) {
          if (curStep === 'destination') {
            component.set('type', curStep);
          }
        } else {
          if (curStep !== 'playNext') {
            component.set('type', curStep);
          }
        }

        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.START_STUDING);
        if (curStep === 'destination') {
          Ember.run.later(function() {
            component.doGradeAnimation();
          }, 1000);
        }
      },

      /**
       * On chart draw complete.
       */
      onChartDrawComplete() {
        let component = this;
        component.doAnimation();
      },

      /**
       * Action triggered when the course map content closed after study.
       */
      goToCourseMap() {
        this.get('router').transitionTo(
          'student.class.course-map',
          this.get('classId')
        );
      },

      /**
       * Action triggered while click on the update location button.
       */
      updateLocation(show) {
        this.set('isLocationUpdate', show);
        this.set('isMathGradeChange', false);
        if (!show) {
          this.set('isShowGradeSection', true);
        }
      },

      /**
       * Action triggered while click on set my level button.
       */
      changesMyLevel() {
        this.set('isMathGradeChange', !this.get('isMathGradeChange'));
        if (this.get('isMathGradeChange')) {
          Ember.run.later(function() {
            let selectedDiv = $('.grade-list .selected-div');
            if (selectedDiv && selectedDiv.length) {
              selectedDiv[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
          }, 500);
        }
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.EDIT_MY_LOCATION
        );
      },

      /**
       * Action triggered while we change the user math level
       */
      updateMathLevel(grage) {
        this.set('isMathGradeChange', false);
        this.set('isNextEnable', true);
        this.set('studentMathGrade', grage);
        this.set('isShowLoader', true);
      },

      /**
       * Action triggered while we change the user math level
       */
      updateMathLevelAndLocation(grage) {
        this.set('isMathGradeChange', false);
        this.set('isNextEnable', true);
        if (this.get('studentMathGrade') !== grage) {
          this.set('isShowLoader', true);
          this.set('studentMathGrade', grage);
        }
        this.send('updateLocation', false);
      },

      /**
       * Action triggered while clicking on take diagnostic button.
       */
      takeDiagnostic() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.TAKE_THE_DIAGNOSIC
        );
        this.set('forceCalculateIlp', false);
        this.send('onMoveNext', 'route');
      },

      isShowLoaderSet(value) {
        this.set('isShowLoader', value);
      },

      playAudio() {
        const component = this;
        let isAudioPlaying = component.get('isAudioPlaying');
        let audio = document.getElementById('descAudio');
        if (audio) {
          if (!isAudioPlaying) {
            audio.play();
            component.set('isAudioPlaying', true);
            component
              .get('parseEventService')
              .postParseEvent(PARSE_EVENTS.STUDENT_PLAY_AUDIO);
          } else {
            audio.pause();
            audio.currentTime = 0;
            component.set('isAudioPlaying', false);
            component
              .get('parseEventService')
              .postParseEvent(PARSE_EVENTS.STUDENT_SKIP_AUDIO);
          }
          audio.addEventListener(
            'ended',
            function() {
              component.set('isAudioPlaying', false);
            },
            false
          );
        }
      },

      playGradeAudio() {
        const component = this;
        let isGradeAudioPlaying = component.get('isGradeAudioPlaying');
        let audio = document.getElementById('gradeDescAudio');
        if (audio) {
          if (!isGradeAudioPlaying) {
            audio.play();
            component.set('isGradeAudioPlaying', true);
          } else {
            audio.pause();
            audio.currentTime = 0;
            let parent = component.$('.grade-description').find('ul');
            parent.find('li').addClass('active active-bold');
            let parentList = component.$('.grade-description');
            parentList.find('p').addClass('active active-bold');
            component.set('isGradeAudioPlaying', false);
            component
              .get('parseEventService')
              .postParseEvent(PARSE_EVENTS.PROFICIENCY_SKIP_AUDIO);
          }
          audio.addEventListener(
            'ended',
            function() {
              component.set('isGradeAudioPlaying', false);
            },
            false
          );
        }
      },

      onClickNext(curPos) {
        let component = this;
        let parent = component.$('.scroll-div').find('ol');
        parent.find('li').removeClass('active-bold');
        let count = parent.children('li.active').length;
        let nextele = parent.find(`li:nth-child(${count + 1})`);
        if (nextele.length) {
          nextele.addClass('active active-bold');
        } else {
          component.send('onMoveNext', curPos);
        }
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.PROFICIENCY_AUDIO_NEXT);
      },

      skipAll() {
        let component = this;
        let parent = component.$('.scroll-div').find('ol');
        parent.find('li').addClass('active active-bold');
        let parentList = component.$('.scroll-div');
        parentList.find('p').addClass('active active-bold');
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.PROFICIENCY_AUDIO_SKIP_ALL);
      },

      //Action triggered in init for check all the milestone contents are rescoped
      checkAllContentsAreRescoped(milestoneData) {
        const milestones = milestoneData;
        const rescopeMilestone = milestones.filterBy('rescope', true);
        let isAllContentsAreRescoped =
          milestones.length === rescopeMilestone.length;
        this.set('isAllContentsAreRescoped', isAllContentsAreRescoped);
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {JSON} competencyStatus
     */
    competencyStatus: null,

    route0Milestones: Ember.A([]),

    taxonomyGrades: null,

    isLast: false,

    type: Ember.computed(function() {
      return this.get('isPublic') && this.get('proficiencyType')
        ? this.get('proficiencyType')
        : 'proficiency';
    }),

    /**
     * @property {Boolean} isRoute
     */
    isRoute: Ember.computed.equal('type', 'route'),

    /**
     * @property {Boolean} isProficiency
     */
    isProficiency: Ember.computed.equal('type', 'proficiency'),

    isShowLoader: false,

    /**
     * @property {boolean} isMilestoneViewEnabledForTenant
     */
    isMilestoneViewEnabledForTenant: Ember.computed('class', function() {
      const component = this;
      const currentClass = component.get('class');
      return (
        currentClass &&
        component.isMilestoneViewEnabled(
          currentClass.preference,
          currentClass.setting
        )
      );
    }),

    /**
     * The class is premium
     * @property {String}
     */
    isPremiumClass: Ember.computed('class', function() {
      const controller = this;
      let currentClass = controller.get('class');
      let classSetting = currentClass.get('setting');
      return classSetting ? classSetting['course.premium'] : false;
    }),

    /**
     * @property {Boolean} isPublicClass
     */
    isPublic: Ember.computed.alias('class.isPublic'),

    /**
     * @property {Boolean} isJoinedPublicClass
     */
    isJoinedPublicClass: Ember.computed('isPublic', 'class', function() {
      let isPublic = this.get('isPublic');
      let userId = this.get('session.userId');
      let gradeBounds = this.get('class.memberGradeBounds');
      let gradeBound = gradeBounds.findBy(userId);
      let studentGradeBound = Ember.Object.create(gradeBound.get(userId));
      return (
        isPublic &&
        studentGradeBound.get('grade_lower_bound') &&
        studentGradeBound.get('grade_upper_bound')
      );
    }),

    isDiagnosticApplicable: Ember.computed(
      'isPublic',
      'independentCourses',
      function() {
        let diagnosticApplicable = false;
        let independentCourses = this.get('independentCourses');
        if (this.get('isPublic') && this.get('isPremiumClass')) {
          let currentCourse = independentCourses.findBy(
            'id',
            this.get('courseId')
          );
          let courseSettings = currentCourse.get('settings');
          diagnosticApplicable = courseSettings.get('isDiagnosticApplicable');
        }
        return diagnosticApplicable;
      }
    ),

    /**
     * @property {Object} currentCourseBounds
     */
    currentCourseBounds: Ember.computed(
      'isPublic',
      'independentCourses',
      function() {
        let courseBounds = null;
        let independentCourses = this.get('independentCourses');
        if (this.get('isPublic') && this.get('isPremiumClass')) {
          let currentCourse = independentCourses.findBy(
            'id',
            this.get('courseId')
          );
          let courseSettings = currentCourse.get('settings');
          courseBounds = Ember.Object.create({
            gradeCurrent: courseSettings.get('gradeCurrent'),
            gradeLowerBound: courseSettings.get('gradeLowerBound'),
            gradeUpperBound: courseSettings.get('gradeUpperBound')
          });
        }
        return courseBounds;
      }
    ),

    /**
     * @property {JSON} studentMathGrade
     */
    studentMathGrade: Ember.computed(
      'currentCourseBounds',
      'taxonomyGrades',
      'activeGrade',
      function() {
        let taxonomyGrades = this.get('taxonomyGrades');
        let activeGrade = this.get('activeGrade');
        let currentBond = null;
        let userId = this.get('session.userId');
        if (this.get('isPremiumClass') && !this.get('isPublic')) {
          let currentClass = this.get('class');
          let memberGradeBounds = currentClass.get('memberGradeBounds');
          currentBond = memberGradeBounds.find(item => item[userId]);
        }
        let diff = this.getGradeLowerBoundByTenantSettings();
        const hasMathGradeLevels = taxonomyGrades.find(item => item.levels);
        if (currentBond) {
          let level = taxonomyGrades.findBy(
            'id',
            currentBond[userId].grade_lower_bound
          );
          if (hasMathGradeLevels) {
            let checkDiff = activeGrade.id - level.id;
            if (checkDiff === 0 && currentBond[userId].grade_level === null) {
              let levels = taxonomyGrades.findBy(
                'sequence',
                level.sequence - 1
              );
              level = levels ? levels : level;
            }
            let studentGrade;
            if (currentBond[userId].grade_level) {
              studentGrade = level.levels.findBy(
                'id',
                currentBond[userId].grade_level
              );
              if (!studentGrade) {
                studentGrade = level.levels.get('firstObject');
              }
            } else {
              studentGrade = level.levels.get('firstObject');
            }
            level.set('level_id', studentGrade.id);
            level.set('level_label', studentGrade.label);
          }
          return level;
        }
        if (hasMathGradeLevels) {
          let level = taxonomyGrades.findBy(
            'sequence',
            activeGrade.sequence - diff
          );
          let checkDiff = activeGrade.id - level.id;
          if (checkDiff === 0) {
            let levels = taxonomyGrades.findBy('sequence', level.sequence - 1);
            level = levels ? levels : level;
          }
          let studentGrade = level.levels.get('firstObject');
          level.set('level_id', studentGrade.id);
          level.set('level_label', studentGrade.label);
          return level;
        } else {
          let levels = taxonomyGrades.findBy(
            'sequence',
            activeGrade.sequence - diff
          );
          return levels ? levels : activeGrade;
        }
      }
    ),

    /**
     * @property {JSON} studentCurrentGrade
     */
    studentCurrentGrade: Ember.computed(
      'currentCourseBounds',
      'taxonomyGrades',
      function() {
        let taxonomyGrades = this.get('taxonomyGrades');
        let studentGradeCurrent = null;
        if (this.get('isPublic') && this.get('isPremiumClass')) {
          let gradeCurrent = this.get('currentCourseBounds.gradeCurrent');
          studentGradeCurrent = taxonomyGrades.findBy('id', gradeCurrent);
        }
        return studentGradeCurrent;
      }
    ),

    /**
     * @property {JSON} studentDestinationGrade
     */
    studentDestinationGrade: Ember.computed('currentCourseBounds', function() {
      let taxonomyGrades = this.get('taxonomyGrades');
      let studentDestinationGrade = null;
      if (this.get('isPublic') && this.get('isPremiumClass')) {
        let gradeUpperBound = this.get('currentCourseBounds.gradeUpperBound');
        studentDestinationGrade = taxonomyGrades.findBy('id', gradeUpperBound);
      }
      return studentDestinationGrade;
    }),

    /**
     * @property {JSON} activeGrade
     */
    activeGrade: Ember.computed(
      'taxonomyGrades',
      'classGrade',
      'studentCurrentGrade',
      function() {
        let isPublic = this.get('isPublic');
        let taxonomyGrades = this.get('taxonomyGrades');
        let classGrade = this.get('classGrade');
        let profileDetails = this.get('profileDetails');
        let info =
          profileDetails[0] && profileDetails[0].info
            ? profileDetails[0].info
            : null;
        let taxonomy = classGrade;
        let tenantSetting = this.get('tenantSetting');
        let navigatorPrograms =
          tenantSetting &&
          tenantSetting.ui_element_visibility_settings &&
          tenantSetting.ui_element_visibility_settings
            .enable_navigator_programs;
        if (isPublic && info && navigatorPrograms) {
          taxonomy = taxonomyGrades.findBy('grade', info.grade_level);
        }
        let taxonomyGradeList = taxonomyGrades.findBy(
          'id',
          info && isPublic && navigatorPrograms ? taxonomy.id : taxonomy
        );
        if (
          taxonomyGradeList &&
          taxonomyGradeList.displayGuide &&
          taxonomyGradeList.displayGuide.getstarted_desc_audio_url
        ) {
          this.set(
            'descAudioURL',
            taxonomyGradeList.displayGuide.getstarted_desc_audio_url
          );
        }
        if (taxonomyGradeList && taxonomyGradeList.getStartedDescription) {
          this.set(
            'getStartedDescription',
            taxonomyGradeList.getStartedDescription
          );
        }
        if (
          taxonomyGradeList &&
          taxonomyGradeList.displayGuide &&
          taxonomyGradeList.displayGuide.grade_desc_audio_url
        ) {
          this.set(
            'gradeAudioURL',
            taxonomyGradeList.displayGuide.grade_desc_audio_url
          );
        }
        if (taxonomyGradeList && taxonomyGradeList.description) {
          this.set('gradeDescription', taxonomyGradeList.description);
        }
        if (isPublic && info && navigatorPrograms) {
          return taxonomy;
        } else if (isPublic && this.get('isPremiumClass')) {
          return this.get('studentCurrentGrade');
        } else {
          return taxonomyGrades.findBy('id', classGrade);
        }
      }
    ),

    /**
     * Property used to identify whether to show directions or not.
     * @type {Boolean}
     */
    showDirections: Ember.computed.equal(
      'skylineInitialState.destination',
      CLASS_SKYLINE_INITIAL_DESTINATION.showDirections
    ),

    isShowImpersonate: Ember.computed(function() {
      let impersonate;
      if (window.frameElement) {
        impersonate = window.parent.impersonate;
      }
      return impersonate;
    }),
    /**
     * Maintains loaded or not
     * @type {Boolean}
     */
    isMilestoneFetch: false,

    /**
     * @property {Array} mathLevelGrades
     */
    mathLevelGrades: Ember.computed('currentCourseBounds', function() {
      let mathLevelGrades = Ember.A([]);
      if (this.get('isPublic') && this.get('isPremiumClass')) {
        let taxonomyGrades = this.get('taxonomyGrades').sortBy('sequence');
        let activeGrade = this.get('activeGrade');
        let startGrade = taxonomyGrades.get('firstObject');
        let startGradeIndex = taxonomyGrades.indexOf(startGrade);
        let endGrade = taxonomyGrades.findBy('id', activeGrade.id);
        let endGradeIndex = taxonomyGrades.indexOf(endGrade) + 1;
        let tempSourceItems = taxonomyGrades.slice(
          startGradeIndex,
          endGradeIndex
        );
        mathLevelGrades = tempSourceItems;
        const hasMathGradeLevels = taxonomyGrades.find(item => item.levels);
        if (hasMathGradeLevels) {
          let mathGradeLevels = [];
          tempSourceItems.forEach(item => {
            mathGradeLevels = mathGradeLevels.concat(item.levels);
          });
          mathLevelGrades = mathGradeLevels;
          mathLevelGrades.forEach((item, i) => {
            item.sequence = i + 1;
          });
        }
      }
      return mathLevelGrades;
    }),

    /*
     * @function getGradeLowerBoundByTenantSettings
     * This method to get the grade lower bound by using tenant settings
     */
    getGradeLowerBoundByTenantSettings() {
      // get the class grade diff from tenant settings
      const frameworkId = this.get('class.preference.framework');
      let subjectCode = this.get('activeSubject.id');
      const defaultGradeDiff = this.get('tenantSetting')
        .default_skyline_grade_diff_for_diagnostic_flow
        ? this.get('tenantSetting')
          .default_skyline_grade_diff_for_diagnostic_flow
        : null;
      const gradeDiff =
        this.get('tenantSetting').default_skyline_grade_diff &&
        this.get('tenantSetting').default_skyline_grade_diff[
          `${frameworkId}.${subjectCode}`
        ]
          ? this.get('tenantSetting').default_skyline_grade_diff[
            `${frameworkId}.${subjectCode}`
          ]
          : defaultGradeDiff;
      if (!gradeDiff) {
        //eslint-disable-next-line
        console.error('tenant default grade diff is empty for given class');
      }
      return gradeDiff;
    },

    /**
     * Loder for baseline generation
     * @type {Boolean}
     */
    isBaselineGenerating: false,

    /**
     * @type {Boolean}
     */
    showTimeoutMessage: false,

    /**
     * @type {Boolean}
     */
    isMathGradeChange: false,

    /**
     * @type {Boolean}
     */
    isLocationUpdate: false,

    /**
     * @type {Boolean}
     */
    forceCalculateIlp: true,

    defaultGrade: null,

    isInitialSkyline: true,

    isNextEnable: false,

    isShowGradeSection: false,

    // -------------------------------------------------------------------------
    // Observer

    isRouteView: Ember.observer('isRoute', function() {
      let isRoute = this.get('isRoute');
      if (isRoute) {
        const currentClass = this.get('class');
        const fwCode = currentClass.get('preference.framework');
        const courseId = currentClass.get('courseId');
        const classId = currentClass.get('id');
        Ember.RSVP.hashSettled({
          route0: currentClass.get('route0Applicable')
            ? this.checkAndRetrieveRoute0ContentsByStatus({
              courseId,
              classId
            })
            : [],
          milestones: this.get('courseService').getCourseMilestones(
            courseId,
            fwCode
          )
        }).then(hash => {
          const milestones = hash.milestones.value;
          const route0Milestones = hash.route0.value;
          this.set('milestones', milestones);
          this.set('route0Milestones', route0Milestones);
          this.set('isMilestoneFetch', true);
          this.setNavbar(false);
        });
      }
    }),

    ChangeClassGrase: Ember.observer('studentMathGrade', function() {
      if (this.get('studentMathGrade')) {
        this.loadDataBySubject();
      }
    }),

    // -------------------------------------------------------------------------
    // Methods

    checkAndRetrieveRoute0ContentsByStatus(courseIdContext) {
      const route = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        route
          .get('route0Service')
          .fetchInClass(courseIdContext)
          .then(route0Contents => {
            resolve(route0Contents.milestones);
          }, reject);
      });
    },

    setNavbar(value) {
      const { getOwner } = Ember;
      let studentClass = getOwner(this).lookup('controller:student.class');
      studentClass.set('isDisableNavbar', value);
    },

    doAnimation() {
      let component = this;
      let displayGuide = component.get('activeGrade.displayGuide');
      let delay = 0;
      component
        .$(
          '.proficiency-info-1, .student-inspect-competency-chart .chart-container'
        )
        .addClass('active');
      if (
        displayGuide &&
        displayGuide.getstarted_desc_selector_animation_config
      ) {
        if (
          component.get('descAudioURL') &&
          !component.get('isMobileView') &&
          !this.get('isShowImpersonate')
        ) {
          component.send('playAudio');
        }
        component.delay(component.$('.pfc-getstarted-desc-step-1'), delay);
        component.$('.pfc-getstarted-desc-step-1').addClass('active-bold');
      }
      component.delay(component.$('.proficiency-info-6'), delay);
      component.delay(
        component.$(
          '.student-inspect-competency-chart .chart-container #gradeline-group polyline'
        ),
        delay
      );
    },

    doGradeAnimation() {
      let component = this;
      let displayGuide = component.get('activeGrade.displayGuide');
      let delay = 0;

      if (displayGuide && displayGuide.grade_desc_selector_animation_config) {
        if (component.get('gradeAudioURL') && !component.get('isMobileView')) {
          component.send('playGradeAudio');
        }
        displayGuide.grade_desc_selector_animation_config.map(item => {
          component.delay($(`${item.selector}`), 0);
          component.delayElement($(`${item.selector}`), delay);
          if (component.get('gradeAudioURL')) {
            delay = delay + item.deplay_duration;
          }
        });
      }
      component.delay(component.$('.grade-location-6'), 0);
    },

    delay(element, delay) {
      let component = this;
      Ember.run.later(function() {
        if (!component.get('isDestroyed')) {
          component.$(element).addClass('active');
        }
      }, delay);
    },

    delayElement(element, delay) {
      let component = this;
      Ember.run.later(function() {
        if (!component.get('isDestroyed')) {
          component.$(element).addClass('active-bold');
        }
      }, delay);
    },

    /**
     * Fetch class member data to get class member bounds.
     */
    fetchClassMemberBounds(classId, curStep) {
      let component = this;
      component
        .get('skylineInitialService')
        .fetchState(classId)
        .then(skylineInitialStateRes => {
          let destination = skylineInitialStateRes.get('destination');
          if (
            destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
          ) {
            return component
              .get('router')
              .transitionTo('student.class.diagnosis-of-knowledge');
          } else {
            Ember.run.later(function() {
              component
                .get('classService')
                .updateProfileBaseline(classId)
                .then(function() {
                  component
                    .get('classService')
                    .readClassMembers(classId)
                    .then(function(members) {
                      let currentClass = component.get('class');
                      currentClass.set(
                        'memberGradeBounds',
                        members.get('memberGradeBounds')
                      );
                      const startTime = moment().valueOf();
                      component.timer = setInterval(() => {
                        if (
                          moment().valueOf() - startTime >
                          PROFICIENCY_STAT_ITERATION_MAX_INTERVAL_TIME
                        ) {
                          clearInterval(component.timer);
                          component.set('isBaselineGenerating', false);
                          component.set('showTimeoutMessage', true);
                        } else {
                          component
                            .get('skylineInitialService')
                            .fetchState(classId)
                            .then(skylineInitialStateRes => {
                              let destination = skylineInitialStateRes.get(
                                'destination'
                              );
                              if (
                                destination ===
                                CLASS_SKYLINE_INITIAL_DESTINATION.courseMap
                              ) {
                                clearInterval(component.timer);
                                component.set('isBaselineGenerating', false);
                                component.set('type', curStep);
                              }
                            });
                        }
                      }, PROFICIENCY_STAT_ITERATION_INTERVAL_TIME);
                    });
                });
            }, 5000);
          }
        });
    },
    setupTooltip: function(tooltipDiv, descriptionDiv) {
      var component = this;
      var $anchor = this.$(`.${tooltipDiv}`);
      $anchor.attr('data-html', 'true');
      $anchor.popover({
        placement: 'top',
        content: function() {
          return component.$(`.${descriptionDiv}`).html();
        },
        trigger: 'manual',
        container: 'body'
      });

      $anchor.on('click', function() {
        var $this = $(this);
        if (!$this.hasClass('list-open')) {
          $(`.${tooltipDiv}.list-open`).click();
          $this.addClass('list-open').popover('show');
        } else {
          $this.removeClass('list-open').popover('hide');
        }
      });
    }
  }
);
