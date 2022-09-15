import Ember from 'ember';
import {
  getSubjectIdFromSubjectBucket,
  isCompatibleVW
} from 'gooru-web/utils/utils';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { SCREEN_SIZES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(
  ConfigurationMixin,
  TenantSettingsMixin,
  {
    queryParams: ['courseId'],

    // -------------------------------------------------------------------------
    // Dependencies

    applicationController: Ember.inject.controller('application'),

    /**
     * @property {Service} Session service
     */
    session: Ember.inject.service('session'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyProvider: Ember.inject.service('api-sdk/taxonomy'),

    /**
     * competency service dependency injection
     * @type {Object}
     */
    competencyService: Ember.inject.service('api-sdk/competency'),

    /**
     * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
     */
    featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),
    // -------------------------------------------------------------------------
    // Properties

    /**
     * The menuItem selected
     * @property {String}
     */
    menuItem: null,

    isDisableNavbar: true,

    userDisplayName: undefined,

    /**
     * @property {JSON} competencyStatus
     */
    competencyStatus: null,

    /**
     * @property {String}
     * Property to store course subject bucket or K12.MA will be default
     */
    subjectBucket: Ember.computed('course', function() {
      let component = this;
      return component.get('course.subject') || null;
    }),

    /**
     * @property {JSON}
     * Property to store currently selected month and year
     */
    timeLine: Ember.computed(function() {
      let curDate = new Date();
      return {
        month: curDate.getMonth() + 1,
        year: curDate.getFullYear()
      };
    }),

    studentProfile: Ember.computed('session', function() {
      return {
        id: this.get('session.userId')
      };
    }),

    /**
     * Subject associated with the course
     * @type {String}
     */
    subject: Ember.computed.alias('course.subject'),

    /**
     * Extract subject code from subject
     * @return {String}
     */
    subjectCode: Ember.computed('subject', function() {
      if (this.get('subject')) {
        return getSubjectIdFromSubjectBucket(this.get('subject'));
      }
    }),

    activeSubject: Ember.computed('subjectCode', function() {
      return {
        id: this.get('subjectCode')
      };
    }),

    /**
     * @property {Boolean} isShowMatrixChart
     */
    isShowMatrixChart: true,

    /**
     * @property {Array} taxonomyGrades
     */
    taxonomyGrades: Ember.A([]),

    /**
     * @property {Boolean} showGutCompetency
     */
    showGutCompetency: false,

    /**
     * @property {Array}
     * Property to store competency coordinates
     */
    competencyMatrixCoordinates: null,

    /**
     * @property {Array}
     * Property to store competency domains
     */
    competencyMatrixDomains: null,

    /**
     * @property {Array}
     * Property to identify baseline is selected or not
     */
    isSelectBaseLine: null,

    /**
     * @property {Object}
     * Property to store user proficiency baseline data
     */
    userProficiencyBaseLine: null,

    /**
     * @property {Boolean} isShowTimeSeries
     */
    isShowTimeSeries: true,

    /**
     * @property {Object} userStandardPreference
     */
    userStandardPreference: null,

    isInitialSkyline: true,

    /**
     * @property {Object}
     * Property to store selected competency
     */
    selectedCompetency: null,

    isAudioPlaying: false,

    descAudioURL: null,

    isMobileView: isCompatibleVW(SCREEN_SIZES.SMALL),

    /**
     * @property {JSON} activeGrade
     */
    activeGrade: Ember.computed('taxonomyGrades', function() {
      let taxonomyGrades = this.get('taxonomyGrades');
      let gradeCurrent = this.get('course.settings.gradeCurrent');
      let taxonomyGradeList = taxonomyGrades.findBy('id', gradeCurrent);
      if (
        taxonomyGradeList &&
        taxonomyGradeList.displayGuide &&
        taxonomyGradeList.displayGuide.getstarted_desc_audio_url
      ) {
        this.set(
          'descAudioURL',
          taxonomyGradeList.displayGuide.getstarted_desc_audio_url
        );
        this.set(
          'getStartedDescription',
          taxonomyGradeList.getStartedDescription
        );
      }
      return taxonomyGradeList;
    }),

    /**
     * @property {JSON} studentMathGrade
     */
    studentMathGrade: Ember.computed(
      'taxonomyGrades',
      'activeGrade',
      function() {
        let taxonomyGrades = this.get('taxonomyGrades');
        let activeGrade = this.get('activeGrade');
        let diff = this.getGradeLowerBoundByTenantSettings();
        const hasMathGradeLevels = taxonomyGrades.find(item => item.levels);
        if (taxonomyGrades && activeGrade) {
          if (hasMathGradeLevels) {
            let level = taxonomyGrades.findBy(
              'sequence',
              activeGrade.sequence - diff
            );
            let checkDiff = activeGrade.id - level.id;
            if (checkDiff === 0) {
              let levels = taxonomyGrades.findBy(
                'sequence',
                level.sequence - 1
              );
              level = levels ? levels : level;
            }
            let studentGrade = level.levels.get('firstObject');
            level.set('level_id', studentGrade.id);
            level.set('level_label', studentGrade.label);
            return level;
          } else {
            let grade = taxonomyGrades.findBy(
              'sequence',
              activeGrade.sequence - diff
            );
            return grade ? grade : activeGrade;
          }
        }
      }
    ),

    setTooltip() {
      var component = this;
      $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
      $('[data-toggle="popover"]').popover({
        trigger: 'hover'
      });
      $('.destination-info, .location-info').off('click');
      component.setupTooltip(
        'destination-info',
        'show-destination-description'
      );
      component.setupTooltip('location-info', 'show-lo-description');
    },

    setupTooltip: function(tooltipDiv, descriptionDiv) {
      var $anchor = $(`.${tooltipDiv}`);
      $anchor.attr('data-html', 'true');
      $anchor.popover({
        placement: 'top',
        content: function() {
          return $(`.${descriptionDiv}`).html();
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
    },

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      /**
       * Action triggered at once the baseline is drawn
       */
      onShownBaseLine() {
        let component = this;
        component.set('isShowTimeSeries', true);
      },

      onDomainSelect(domain) {
        let component = this;
        if (this.get('selectedDomain')) {
          this.set('selectedDomain.isActive', false);
        }
        domain.set('isActive', !domain.get('isActive'));
        domain.set('isExpanded', !domain.get('isExpanded'));
        if (
          domain.get('domainCode') !==
          component.get('selectedDomain.domainCode')
        ) {
          component.set('selectedDomain', domain);
        }

        component.set('selecctedDomainTopics', domain.get('topics'));
        component.set('selectedCompetency', null);
        component.set('showDomainInfo', domain.get('isExpanded'));
        component.set('isShowTopicInfo', false);
        component.set('showCompetencyInfo', false);
      },

      onSelectTopic(topic) {
        if (this.get('selectedTopic')) {
          this.set('selectedTopic.isActive', false);
        }
        topic.set('domainName', this.get('selectedDomain.domainName'));
        topic.set('isActive', true);
        this.set('selectedTopic', topic);
        this.set('showDomainInfo', false);
        this.set('showCompetencyInfo', false);
        this.set('isShowTopicInfo', true);
      },

      onMoveNext(curStep) {
        let featuredCourseService = this.get('featuredCourseService');
        let course = this.get('course');
        let gradeCurrent = course.get('settings.gradeCurrent');
        let courseId = course.get('id');
        return Ember.RSVP.hash({
          joinClass: Ember.RSVP.resolve(
            featuredCourseService.joinPublicClassbyGrade(courseId, gradeCurrent)
          )
        }).then(({ joinClass }) => {
          let courseSettings = this.get('course.settings');
          if (!courseSettings.get('gradeCurrent')) {
            this.transitionToRoute(
              'student.class.course-map',
              joinClass.get('classId')
            );
          } else {
            this.transitionToRoute(
              'student.class.proficiency',
              joinClass.get('classId'),
              {
                queryParams: {
                  proficiencyType: curStep,
                  defaultGradeLevel: course.get('defaultGradeLevel')
                }
              }
            );
          }
        });
      },

      playAudio() {
        const component = this;
        let isAudioPlaying = component.get('isAudioPlaying');
        let audio = document.getElementById('descAudio');
        if (audio) {
          if (!isAudioPlaying) {
            audio.play();
            component.set('isAudioPlaying', true);
          } else {
            audio.pause();
            audio.currentTime = 0;
            component.set('isAudioPlaying', false);
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

      isShowLoaderSet(value) {
        this.set('isShowLoader', value);
      },

      onClickNext(curPos) {
        let component = this;
        let parent = $('.scroll-div').find('ol');
        parent.find('li').removeClass('active-bold');
        let count = parent.children('li.active').length;
        let nextele = parent.find(`li:nth-child(${count + 1})`);
        if (nextele.length) {
          nextele.addClass('active active-bold');
        } else {
          component.send('onMoveNext', curPos);
        }
      },

      skipAll() {
        let parent = $('.scroll-div').find('ol');
        parent.find('li').addClass('active active-bold');
        let parentList = $('.scroll-div');
        parentList.find('p').addClass('active active-bold');
      }
    },
    // -------------------------------------------------------------------------
    // Methods

    initial: function() {
      const component = this;
      var item = component.get('menuItem');
      component.selectMenuItem(item);
      component.set(
        'userDisplayName',
        component.get('session.userData.userDisplayName')
      );
      component.fetchTaxonomyGrades();
      component.loadDataBySubject();
      Ember.run.scheduleOnce('afterRender', function() {
        component.setTooltip();
      });
    },

    /**
     * Selected the menu item
     * @param {string} item
     */
    selectMenuItem: function(item) {
      this.set('menuItem', item);
    },

    doAnimation() {
      let component = this;
      let displayGuide = component.get('activeGrade.displayGuide');
      let delay = 0;
      $(
        '.proficiency-info-1, .student-inspect-competency-chart .chart-container'
      ).addClass('active');
      if (
        displayGuide &&
        displayGuide.getstarted_desc_selector_animation_config
      ) {
        if (component.get('descAudioURL') && !component.get('isMobileView')) {
          component.send('playAudio');
        }
        component.delay($('.pfc-getstarted-desc-step-1'), delay);
        $('.pfc-getstarted-desc-step-1').addClass('active-bold');
      }
      component.delay($('.proficiency-info-6'), delay);
      component.delay(
        $(
          '.student-inspect-competency-chart .chart-container #gradeline-group polyline'
        ),
        delay
      );
    },

    delay(element, delay) {
      let component = this;
      Ember.run.later(function() {
        if (!component.get('isDestroyed')) {
          $(element).addClass('active');
        }
      }, delay);
    },

    /**
     * Action triggered when select a competency
     */
    onSelectCompetency(competency, domainCompetencyList) {
      let component = this;
      if (!component.get('isTeacherMatrix')) {
        component.setSignatureContent(competency);
      }
      component.set('selectedCompetency', competency);
      component.set('domainCompetencyList', domainCompetencyList);
      component.set('showCompetencyInfo', true);
    },

    /**
     * @function fetchTaxonomyGrades
     * Method to fetch taxonomy grades
     */
    fetchTaxonomyGrades() {
      let component = this;
      let taxonomyService = component.get('taxonomyProvider');
      let filters = {
        subject: component.get('subjectCode')
      };
      let fwCode = component.get('course.settings.framework');
      if (fwCode) {
        filters.fw_code = fwCode;
      }
      if (component.get('subjectCode')) {
        return Ember.RSVP.hash({
          taxonomyGrades: taxonomyService.fetchGradesBySubject(filters)
        }).then(({ taxonomyGrades }) => {
          if (
            !(component.get('isDestroyed') || component.get('isDestroying'))
          ) {
            component.set(
              'taxonomyGrades',
              taxonomyGrades.sortBy('sequence').reverse()
            );
          }
        });
      }
    },

    /**
     * @function loadDataBySubject
     * Method to fetch domain and co-ordinate data using subject id
     */
    loadDataBySubject() {
      const controller = this;
      let subjectId = controller.get('activeSubject.id');
      let userId = controller.get('studentProfile.id');
      let timeLine = controller.get('timeLine');

      const subjectCode = controller.get('activeSubject.code');
      const userStandardPreference = controller.get('userStandardPreference');
      const frameworkCode = userStandardPreference
        ? userStandardPreference[subjectCode]
        : controller.get('course.settings.framework');
      controller.set('framework', frameworkCode);
      let frameworkId = controller.get('framework');
      if (!frameworkCode) {
        controller.set('showGutCompetency', true);
      }

      if (subjectId) {
        let tenantSetting = controller.get('tenantSettingsObj');
        let isDefaultShowFW = false;
        if (
          tenantSetting &&
          tenantSetting.default_show_fw_competency_proficiency_view &&
          tenantSetting.default_show_fw_competency_proficiency_view.length
        ) {
          let classPreference = subjectId.concat('.', frameworkId);
          isDefaultShowFW =
            tenantSetting.default_show_fw_competency_proficiency_view.indexOf(
              classPreference
            ) !== -1;
        }
        const dataParam = {
          subject: subjectId
        };
        if (isDefaultShowFW) {
          dataParam.framework = frameworkId;
        }
        return Ember.RSVP.hash({
          domainTopicCompetency: controller
            .get('competencyService')
            .fetchStudentDomainTopicCompetency(
              userId,
              subjectId,
              timeLine,
              isDefaultShowFW ? frameworkId : null
            ),

          domainTopicMetadata: controller
            .get('competencyService')
            .fetchDomainTopicMetadata(dataParam),

          crossWalkFWC: frameworkId
            ? controller
              .get('taxonomyProvider')
              .fetchCrossWalkFWC(frameworkId, subjectId)
            : null
        }).then(
          ({ domainTopicCompetency, domainTopicMetadata, crossWalkFWC }) => {
            if (
              !(controller.get('isDestroyed') || controller.get('isDestroying'))
            ) {
              if (crossWalkFWC) {
                controller.set(
                  'fwCompetencies',
                  flattenGutToFwCompetency(crossWalkFWC)
                );
                controller.set('crossWalkFWC', crossWalkFWC);
                controller.set('fwDomains', flattenGutToFwDomain(crossWalkFWC));
              }
              controller.set('showGutCompetency', !frameworkId);
              controller.set('hideGutCompetencyButton', !frameworkId);

              controller.parseDomainTopicCompetencyData(
                domainTopicCompetency,
                domainTopicMetadata
              );
            } else {
              Ember.Logger.warn('comp is destroyed...');
            }
          },
          this
        );
      }
    },

    parseDomainTopicCompetencyData(domainTopicMatrix, domainTopicMetadata) {
      const chartData = [];
      let highestTopicSize = 0;
      const skylinePoints = [];
      let totalTopics = 0;
      this.maxDomainSize = Math.max.apply(
        Math,
        domainTopicMatrix.map(domain => domain.totalCompetencies || 0)
      );
      domainTopicMetadata.domainTopics.map(domainMetadata => {
        let crossWalkFWC = this.get('crossWalkFWC') || [];
        const crossWalkFWDomain = crossWalkFWC.find(
          fwDomain => fwDomain.domainCode === domainMetadata.domainCode
        );
        if (crossWalkFWDomain) {
          domainMetadata.fwDomainName = crossWalkFWDomain.fwDomainName;
        }
        const topicSkylinePoints = [];
        const domainMatrix = domainTopicMatrix.find(
          matrix => matrix.domainCode === domainMetadata.domainCode
        );
        const parsedDomainMatrixData = this.parseCrossWalkFWC(domainMatrix);
        let parsedDomainData = {
          ...domainMetadata,
          ...parsedDomainMatrixData
        };
        highestTopicSize =
          highestTopicSize < domainMetadata.topics.length
            ? domainMetadata.topics.length
            : highestTopicSize;
        let domainCompetenciesCount = 0;
        if (domainMatrix && domainMatrix.topics) {
          const parsedDomainTopicData = [];
          totalTopics += domainMatrix.topics.length;
          parsedDomainMatrixData.topics.map(topicMatrix => {
            const crossWalkFWDomainTopic = crossWalkFWC.find(
              fwDomain => fwDomain.domainCode === domainMetadata.domainCode
            );
            if (crossWalkFWDomainTopic) {
              const crossWalkFWDomains = crossWalkFWDomainTopic.topics.find(
                fwDomain => fwDomain.topicCode === topicMatrix.topicCode
              );
              if (crossWalkFWDomains) {
                topicMatrix.fwTopicName = crossWalkFWDomains.fwTopicName;
              }
            }
            const topicMetadata = domainMetadata.topics.find(
              topic => topic.topicCode === topicMatrix.topicCode
            );
            if (topicMatrix.competencies) {
              const competencies = topicMatrix.competencies.map(competency => {
                if (this.get('isTeacherMatrix')) {
                  competency.status = 4;
                }
                (competency.domainCode = domainMetadata.domainCode),
                (competency.domainSeq = domainMetadata.domainSeq),
                (competency.topicCode = topicMatrix.topicCode),
                (competency.topicSeq = topicMatrix.topicSeq),
                (competency.competencyStatus = competency.status);
                competency.isMastered = competency.status > 1;
                competency.isInferred =
                  competency.status === 2 || competency.status === 3;
                competency.competencyName = competency.framework
                  ? competency.framework.frameworkCompetencyName
                    ? competency.framework.frameworkCompetencyName
                    : competency.competencyName
                  : competency.competencyName;
                competency.framework = competency.framework
                  ? competency.framework
                  : null;
                competency.isMappedWithFramework = competency.isMappedWithFramework
                  ? competency.isMappedWithFramework
                  : false;
                competency.isSkyLineCompetency = false;
                competency.isGradeBoundary = false;
                return Ember.Object.create(competency);
              });
              topicMatrix.competencies = competencies.sortBy('competencySeq');
              topicMatrix.competencies[0].isSkyLineCompetency = true;
            }
            domainCompetenciesCount += topicMatrix.competencies.length;
            topicMatrix = {
              ...topicMatrix,
              ...topicMetadata,
              ...this.groupCompetenciesByStatus(topicMatrix.competencies),
              ...{
                domainCode: domainMetadata.domainCode,
                domainSeq: domainMetadata.domainSeq
              }
            };
            topicSkylinePoints.push(
              Ember.Object.create({
                topicSeq: topicMatrix.topicSeq,
                skylineCompetencySeq: topicMatrix.masteredCompetencies
              })
            );
            parsedDomainTopicData.push(Ember.Object.create(topicMatrix));
          });
          parsedDomainData.topics = parsedDomainTopicData.sortBy('topicSeq');
        }
        parsedDomainData.totalCompetencies = domainCompetenciesCount;
        parsedDomainData = {
          ...parsedDomainData,
          ...this.groupCompetenciesByTopic(parsedDomainData.topics)
        };

        skylinePoints.push(
          Ember.Object.create({
            domainSeq: parsedDomainData.domainSeq,
            skylineCompetencySeq: parsedDomainData.masteredCompetencies,
            topicSkylinePoints: topicSkylinePoints.sortBy('topicSeq')
          })
        );
        chartData.push(Ember.Object.create(parsedDomainData));
      });

      this.set('skylinePoints', skylinePoints.sortBy('domainSeq'));
      if (this.get('isInitialSkyline')) {
        this.initialSkylineMasteries(chartData.sortBy('domainSeq'));
      } else {
        this.set('proficiencyChartData', chartData.sortBy('domainSeq'));
      }
      // Help to tigger action once proficiency chart data loaded
      if (this.get('isTeacherMatrix')) {
        this.send('onLoadedProficiency');
      }
      this.set('totalTopics', totalTopics);
    },

    /**
     * @function parseCrossWalkFWC
     * Method to check cross walk competency with user competency matrix
     */
    parseCrossWalkFWC(domainData) {
      let component = this;
      let crossWalkFWC = component.get('crossWalkFWC') || [];
      if (crossWalkFWC && crossWalkFWC.length) {
        if (domainData) {
          let fwDomain = crossWalkFWC.findBy(
            'domainCode',
            domainData.domainCode
          );
          if (fwDomain) {
            domainData.topics.map(topic => {
              let fwTopics = fwDomain.topics.findBy(
                'topicCode',
                topic.topicCode
              );
              if (fwTopics) {
                let competencies = topic.competencies;
                const fwCompetencies = fwTopics.competencies || [];
                if (fwCompetencies && fwCompetencies.length) {
                  return competencies.map(competency => {
                    let fwCompetency = fwCompetencies.find(fwCompetency => {
                      return (
                        fwCompetency.competencyCode ===
                        competency.competencyCode
                      );
                    });
                    const isMappedWithFramework = !!fwCompetency;
                    competency.isMappedWithFramework = isMappedWithFramework;
                    if (fwCompetency) {
                      competency.framework = fwCompetency;
                    }
                    return competency;
                  });
                }
              }
            });
          }
        }
      }
      return domainData;
    },

    // TODO: it should be done in serializers
    groupCompetenciesByTopic(topics) {
      let masteredCompetencies = 0;
      let inprogressCompetencies = 0;
      let notstartedCompetencies = 0;
      let inferredCompetencies = 0;
      let completedCompetencies = 0;
      topics.map(topic => {
        completedCompetencies += topic.completedCompetencies;
        masteredCompetencies += topic.masteredCompetencies;
        inprogressCompetencies += topic.inprogressCompetencies;
        inferredCompetencies += topic.inferredCompetencies;
        notstartedCompetencies += topic.notstartedCompetencies;
      });
      return {
        completedCompetencies,
        masteredCompetencies,
        inprogressCompetencies,
        notstartedCompetencies,
        inferredCompetencies,
        totalCompetencies:
          completedCompetencies +
          inprogressCompetencies +
          notstartedCompetencies +
          inferredCompetencies
      };
    },

    groupCompetenciesByStatus(competencies) {
      const competenciesCount = {
        completedCompetencies: 0,
        inprogressCompetencies: 0,
        inferredCompetencies: 0,
        notstartedCompetencies: 0,
        masteredCompetencies: 0
      };
      competencies.map(competency => {
        if (competency.status === 0) {
          competenciesCount.notstartedCompetencies++;
        } else if (competency.status === 1) {
          competenciesCount.inprogressCompetencies++;
        } else if (competency.status === 2 || competency.status === 3) {
          competenciesCount.inferredCompetencies++;
          competenciesCount.masteredCompetencies++;
        } else {
          competenciesCount.completedCompetencies++;
          competenciesCount.masteredCompetencies++;
        }
      });
      return competenciesCount;
    },

    initialSkylineMasteries(proficiencyChartData) {
      const component = this;
      let currentCourse = component.get('course');
      let gradeId = currentCourse.get('settings.gradeCurrent');
      const masteredCompetencies = proficiencyChartData.find(domain => {
        return domain.masteredCompetencies > 0;
      });
      if (!masteredCompetencies) {
        component.set('isDefaultSkyline', true);
        let tenantSetting = component.get('tenantSetting');
        let taxonomyGrades = component.get('taxonomyGrades').sortBy('sequence');
        let frameworkId = currentCourse.get('settings.framework');
        let subjectCode = currentCourse.get('subject');
        const defaultGradeDiff = tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
          ? tenantSetting.default_skyline_grade_diff_for_diagnostic_flow
          : null;
        let gradeDiff =
          tenantSetting.default_skyline_grade_diff &&
          tenantSetting.default_skyline_grade_diff[
            `${frameworkId}.${subjectCode}`
          ]
            ? tenantSetting.default_skyline_grade_diff[
              `${frameworkId}.${subjectCode}`
            ]
            : defaultGradeDiff;
        gradeDiff = gradeDiff || 2;

        let gradeLowerBoundSeq;
        let gradeCurrent = currentCourse.get('settings.gradeCurrent');
        let courseLowerBound = taxonomyGrades.findBy('id', gradeCurrent);
        gradeLowerBoundSeq = courseLowerBound.sequence - gradeDiff;

        if (gradeLowerBoundSeq >= 1) {
          let activeGrade = taxonomyGrades.findBy(
            'sequence',
            gradeLowerBoundSeq
          );
          gradeId = activeGrade.get('id');
          component.set('defaultGrade', activeGrade);
          component.fetchDomainGradeBoundary(gradeId, proficiencyChartData);
        } else {
          component.set('proficiencyChartData', proficiencyChartData);
        }
      } else {
        component.set('proficiencyChartData', proficiencyChartData);
      }
      Ember.run.later(function() {
        component.doAnimation();
      }, 2000);
    },

    /**
     * @function fetchDomainGradeBoundary
     * Method to fetch domain grade boundary
     */
    fetchDomainGradeBoundary(gradeId, proficiencyChartData) {
      let component = this;
      let taxonomyService = component.get('taxonomyProvider');
      return Ember.RSVP.hash({
        gradeBoundaries: gradeId
          ? Ember.RSVP.resolve(
            taxonomyService.fetchDomainGradeBoundaryBySubjectId(gradeId)
          )
          : Ember.RSVP.resolve(null)
      }).then(({ gradeBoundaries }) => {
        const isNoSkylineData =
          gradeBoundaries && component.get('isDefaultSkyline');
        if (isNoSkylineData) {
          let skylinePoints = Ember.A();
          let chartData = proficiencyChartData.map(domainChartData => {
            let domainHiLineCompSeq = 0;
            let isHiLineTopicCovered = false;
            const domainGradeBoundariesList = gradeBoundaries.filter(domain => {
              return domain.domainCode === domainChartData.domainCode;
            });
            domainChartData.topics.map(topic => {
              let domainGradeBoundaries = gradeBoundaries.find(grade => {
                return grade.domainCode === domainChartData.domainCode;
              });
              const topicBoundaries = domainGradeBoundariesList.find(
                item => item.topicCode && item.topicCode === topic.topicCode
              );
              if (topicBoundaries) {
                domainGradeBoundaries = topicBoundaries;
              }
              let skylineCompetencySeq =
                !isHiLineTopicCovered &&
                domainGradeBoundaries &&
                !domainGradeBoundaries.topicAverageComp &&
                topic.competencies
                  ? topic.competencies.length
                  : 0;
              if (
                (domainGradeBoundaries &&
                  topic.topicCode === domainGradeBoundaries.topicCode) ||
                (domainGradeBoundaries &&
                  topic.topicCode === domainGradeBoundaries.highlineTopic)
              ) {
                isHiLineTopicCovered = true;
                skylineCompetencySeq =
                  topic.competencies.findIndex(
                    competency =>
                      competency.competencyCode ===
                      (domainGradeBoundaries.topicHighlineComp
                        ? domainGradeBoundaries.topicHighlineComp
                        : domainGradeBoundaries.highlineComp)
                  ) + 1;
              }
              domainHiLineCompSeq = domainHiLineCompSeq + skylineCompetencySeq;
            });
            skylinePoints.push(
              Ember.Object.create({
                domainSeq: domainChartData.domainSeq,
                skylineCompetencySeq: domainHiLineCompSeq
              })
            );
            domainChartData.set('masteredCompetencies', domainHiLineCompSeq);
            return domainChartData;
          });
          component.set('skylinePoints', skylinePoints);
          component.set('proficiencyChartData', chartData);
        }
      });
    },

    /*
     * @function getGradeLowerBoundByTenantSettings
     * This method to get the grade lower bound by using tenant settings
     */
    getGradeLowerBoundByTenantSettings() {
      // get the class grade diff from tenant settings
      const userStandardPreference = this.get('userStandardPreference');
      let subjectCode = this.get('activeSubject.id');
      const frameworkId = userStandardPreference
        ? userStandardPreference[subjectCode]
        : this.get('course.settings.framework');
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
    }
  }
);
