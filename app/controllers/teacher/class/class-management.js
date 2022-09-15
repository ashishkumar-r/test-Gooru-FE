import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import {
  SCORES,
  DEFAULT_IMAGES,
  EMAIL_TEMPLATE_NAME
} from 'gooru-web/config/config';
import { getObjectsDeepCopy, getObjectCopy } from 'gooru-web/utils/utils';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import Env from '../../../config/environment';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';
import TenantSettingMixin from 'gooru-web/mixins/tenant-settings-mixin';
import InstructionalCoacheMixin from 'gooru-web/mixins/instructional-coache-mixin';

/**
 * Class management controller
 *
 * Controller responsible of the logic for the teacher class management tab
 */

export default Ember.Controller.extend(
  ModalMixin,
  ConfigurationMixin,
  visibilitySettings,
  TenantSettingMixin,
  InstructionalCoacheMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    classController: Ember.inject.controller('teacher.class'),

    /**
     * @requires service:api-sdk/class
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @property {MediaService} Media service API SDK
     */
    mediaService: Ember.inject.service('api-sdk/media'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),
    /**
     * @type {scopeAndSequenceService}
     */
    scopeAndSequenceService: Ember.inject.service('api-sdk/scope-sequence'),
    /**
     * @property {Ember.Service} Service to do retrieve language
     */
    lookupService: Ember.inject.service('api-sdk/lookup'),
    /**
     * @property {TenantService} Serive to do retrieve competency score details
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @type {SkylineInitialService} Service to retrieve skyline initial service
     */
    skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

    profileService: Ember.inject.service('api-sdk/profile'),

    session: Ember.inject.service('session'),

    multipleClassService: Ember.inject.service('api-sdk/multiple-class'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    fluencyService: Ember.inject.service('api-sdk/fluency'),

    i18n: Ember.inject.service(),

    // -------------------------------------------------------------------------
    // Properties

    studentsLevelSetting: Ember.computed(
      'class.members.@each.tempGradeLowerBound',
      'class.members.@each.tempGradeUpperBound',
      'class.members.@each.isActive',
      'class.members.@each.fluency',
      'class.members.[]',
      function() {
        return this.get('class.members').filter(member => {
          return (
            (member.get('isActive') &&
              (member.get('tempGradeLowerBound') ||
                member.get('tempGradeUpperBound'))) ||
            member.get('fluency')
          );
        });
      }
    ),

    mathLevelItems: Ember.computed('isLevelDropdown', 'levelItems', function() {
      let isLevelDropdown = this.get('isLevelDropdown');
      return this.get(isLevelDropdown ? 'subjectTaxonomyGrades' : 'levelItems');
    }),

    mathLevelStartRange: Ember.computed('mathLevelItems', function() {
      return this.get('mathLevelItems.firstObject');
    }),

    /**
     * @property {String} thumbnailImage
     */
    thumbnailImage: null,
    /**
     * @property {String} searchTermLocal
     */
    searchTermLocal: null,

    /**
     * @property {Boolean} rosterPopup
     */
    rosterPopup: false,

    isEnableRosterSync: Ember.computed(function() {
      let controller = this;
      var setting = controller.get('class.setting');
      return setting['roster.sync.enabled'] !== undefined
        ? setting['roster.sync.enabled']
        : true;
    }),
    selfId: Ember.computed.alias('session.userId'),
    /**
     * @property {object} activeScopeAndSequence
     */
    activeScopeAndSequence: null,
    /**
     * @property {boolean} allowAssessmentTemplateToDownload
     */
    allowAssessmentTemplateToDownload: Ember.computed(function() {
      let tenantSetting = this.get('tenantService').getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      return (
        parsedTenantSettings &&
        parsedTenantSettings.show_assessment_template_download &&
        parsedTenantSettings.show_assessment_template_download === 'on'
      );
    }),

    impersonateUrl: '',

    /**
     * Checking is demo account
     */
    isGuestAccount: Ember.computed.alias('session.isGuest'),

    /**
     * @property {boolean} To get content visibility
     */
    getContentVisibility: Ember.computed('class', function() {
      let controller = this;
      const currentClass = controller.get('tempClass');
      let setting = currentClass.get('setting');
      if (currentClass && setting && setting['default.content.visibility']) {
        let isContentVisibility = true;
        if (setting && setting['default.content.visibility']) {
          isContentVisibility = setting['default.content.visibility'] === 'on';
        }
        return isContentVisibility;
      } else {
        let isVisible = true;
        let tenantSetting = controller
          .get('tenantService')
          .getStoredTenantSetting();
        let parsedTenantSettings = JSON.parse(tenantSetting);
        if (
          parsedTenantSettings &&
          parsedTenantSettings.default_class_course_content_visibility
        ) {
          isVisible =
            parsedTenantSettings.default_class_course_content_visibility ===
            'on';
        }
        return isVisible;
      }
    }),

    /**
     * @property {boolean} To get community collaboration
     */
    getCommunityCollaboration: Ember.computed('class', function() {
      let controller = this;
      let isContentVisibility = false;
      const currentClass = controller.get('tempClass');
      let setting = currentClass.get('setting');
      if (setting) {
        isContentVisibility = setting.enableCommunityCollaboration === 'on';
      }
      return isContentVisibility;
    }),

    /**
     * @property {boolean} To show content visibility
     */
    showContentVisibility: Ember.computed('class', function() {
      let controller = this;
      let tenantSetting = controller
        .get('tenantService')
        .getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      return (
        parsedTenantSettings &&
        parsedTenantSettings.allow_to_change_class_course_content_visibility ===
          'on'
      );
    }),

    /**
     * @property {boolean} To show google classroom connect
     */
    showGoogleClassroomButton: Ember.computed('class', function() {
      let controller = this;
      let tenantSetting = controller
        .get('tenantService')
        .getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      return (
        parsedTenantSettings &&
        parsedTenantSettings.enable_external_classroom === 'on'
      );
    }),

    /**
     * @property {boolean} To show Community collaboration
     */
    showCommunity: Ember.computed('class', function() {
      let controller = this;
      let tenantSetting = controller
        .get('tenantService')
        .getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      return (
        parsedTenantSettings &&
        parsedTenantSettings.enable_community_collaboration === 'on'
      );
    }),

    isShowFluencyLevel: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      return tenantSettings && tenantSettings.fluency_level === 'on';
    }),

    /**
     * @property {Array} filteredStudentsLocal
     * Property for filtered student list
     */
    filteredStudentsLocal: Ember.A([]),

    /**
     * @property {Boolean} isAddStundentByEmail
     * Property help to add bulk student by email or username
     */
    isAddStundentByEmail: Ember.computed('tenantSettingsObj', function() {
      let tenantSetting = this.get('tenantSettingsObj');
      return !(
        tenantSetting &&
        tenantSetting.ui_element_visibility_settings &&
        tenantSetting.ui_element_visibility_settings.add_students_by ===
          'username'
      );
    }),

    /**
     * help to handled send add student mail
     * @property {boolean}
     */
    isSendSignupInviteMail: Ember.computed.alias(
      'configuration.GRU_FEATURE_FLAG.sendSignupInviteMail'
    ),
    isInstructionalCoache: Ember.computed(function() {
      return this.instructionalCoache();
    }),

    /**
     * @property {string} session tenant name
     */
    tenantName: Ember.computed('session', function() {
      return (
        this.get('session.tenantShortName') || this.get('session.tenantName')
      );
    }),

    tenantSignupURL: Ember.computed('tenantName', function() {
      let signupURL = this.get('configuration.TENANT_SIGNUP_URL');
      let tenantName = this.get('tenantName');
      return signupURL.concat(`${tenantName}?r=s`);
    }),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      onPullUpClose() {
        this.set('getContentVisibility', !this.get('isVisibility'));
        this.set('isConfirmationVisibility', false);
      },
      //  Action triggered when click search icon
      onSearchStudentsLocal(searchTermLocal) {
        let filteredStudents = getObjectsDeepCopy(
          this.get('classStudents')
        ).filter(student => {
          searchTermLocal = searchTermLocal.toLowerCase();
          return (
            (student.firstName &&
              student.firstName.toLowerCase().startsWith(searchTermLocal)) ||
            (student.email &&
              student.email.toLowerCase().startsWith(searchTermLocal)) ||
            (student.lastName &&
              student.lastName.toLowerCase().startsWith(searchTermLocal)) ||
            (student.username &&
              student.username.toLowerCase().startsWith(searchTermLocal))
          );
        });
        this.set('filteredStudentsLocal', filteredStudents);
      },

      applyTeacherSettings() {
        const controller = this;
        const collaborator = controller.get('selectedCoteacher');
        if (collaborator) {
          const classService = controller.get('classService');
          const classId = controller.get('class.id');
          classService.applyOwnerSettings(classId, collaborator.id).then(() => {
            controller.get('classController').send('onRefreshData');
            controller.set('selectedCoteacher', false);
          });
        }
      },
      /**
       * Action trigger to show toggle action menu dropdown
       */

      showActionButton(event) {
        let element = Ember.$(event.target).next();
        if (element.hasClass('active')) {
          element.removeClass('active');
        } else {
          Ember.$(
            '.teacher_class_class-management .student-settings-sec .actions-btn'
          ).removeClass('active');
          element.addClass('active');
        }
      },
      settingColumn() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_CHOOSE_COLUMNS
        );
        if ($('.apply-setting-filter .columns-right ').hasClass('open')) {
          $('.apply-setting-filter .columns-right ').removeClass('open');
        } else {
          $('.apply-setting-filter .columns-right ').addClass('open');
        }
      },

      applyColumns: function(checkItem) {
        if (checkItem.checked) {
          Ember.set(checkItem, 'checked', false);
          if (checkItem.value === 1) {
            this.set('enableStudentName', false);
          } else if (checkItem.value === 2) {
            this.set('enableDestination', false);
          } else if (checkItem.value === 3) {
            this.set('enableStudentId', false);
          } else if (checkItem.value === 4) {
            this.set('enableFluencyLevel', false);
          } else if (checkItem.value === 5) {
            this.set('enableActive', false);
          } else if (checkItem.value === 6) {
            this.set('enableEmailUsername', false);
          } else if (checkItem.value === 7) {
            this.set('enableGoogleUserId', false);
          }
        } else {
          Ember.set(checkItem, 'checked', true);
          if (checkItem.value === 1) {
            this.set('enableStudentName', true);
          } else if (checkItem.value === 2) {
            this.set('enableDestination', true);
          } else if (checkItem.value === 3) {
            this.set('enableStudentId', true);
          } else if (checkItem.value === 4) {
            this.set('enableFluencyLevel', true);
          } else if (checkItem.value === 5) {
            this.set('enableActive', true);
          } else if (checkItem.value === 6) {
            this.set('enableEmailUsername', true);
          } else if (checkItem.value === 7) {
            this.set('enableGoogleUserId', true);
          }
        }
      },
      updateCoverImage(file) {
        let component = this;
        if (file) {
          let imageIdPromise = new Ember.RSVP.resolve(file);
          imageIdPromise = component
            .get('mediaService')
            .uploadContentFile(file);
          imageIdPromise.then(function(imageId) {
            let editedClass = component.get('tempClass');

            var parser = document.createElement('a');
            parser.href = imageId;
            const coverImageId = parser.pathname.substring(1);
            editedClass.set('coverImage', coverImageId);

            component
              .get('classService')
              .updateClassCoverImage(editedClass)
              .then(function() {
                component.send('updateUserClasses');
                component.get('class').merge(editedClass, ['coverImage']);
              });
          });
        } else {
          let editedClass = component.get('tempClass');
          editedClass.set('coverImage', null);
          component
            .get('classService')
            .updateClassCoverImage(editedClass)
            .then(function() {
              component.send('updateUserClasses');
              component.get('class').merge(editedClass, ['coverImage']);
            });
        }
      },

      /*** Archive class**/
      archiveClass: function() {
        const classId = this.get('class.id');
        const queryParams = {
          showActiveClasses: false,
          showArchivedClasses: true
        };

        var model = {
          content: this.get('class'),
          archiveMethod: () =>
            this.get('classService')
              .archiveClass(classId)
              .then(() => this.send('updateUserClasses'))
              .then(() =>
                this.transitionToRoute('teacher-home', { queryParams })
              )
        };

        this.actions.showModal.call(
          this,
          'content.modals.gru-archive-class',
          model,
          null,
          null,
          null,
          false
        );
        const context = {
          classId: classId
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.ARCHIVE_CLASS_ROOM,
          context
        );
      },

      /*** Triggered when a delete class option is selected */
      deleteClass: function() {
        let controller = this;
        var model = {
          content: controller.get('class'),
          deleteMethod: function() {
            return controller
              .get('classService')
              .deleteClass(controller.get('class.id'));
          },
          callback: {
            success: function() {
              controller.send('updateUserClasses');
            }
          }
        };

        this.actions.showModal.call(
          controller,
          'content.modals.gru-delete-class',
          model,
          null,
          null,
          null,
          false
        );
        const context = {
          classId: controller.get('class.id')
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.DELETE_CLASS_ROOM,
          context
        );
      },

      /*** Triggered when a edit title class option is selected */
      editTitle: function(state = false) {
        let controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_EDIT_CLASS_NAME);
        controller.set('editingTitle', state);

        if (!state) {
          controller.saveClass();
        }
      },

      /**Triggered when a setting mastery */
      updateMastery: function(mastery = false) {
        let controller = this,
          editedClass = controller.get('tempClass'),
          setting = editedClass.get('setting');
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_ENABLE_COMPEDENCY_MASTERY
        );
        setting.set('mastery_applicable', mastery);
        let secondaryclass = this.get('multipleClassList');
        let selectedSecondaryClass = secondaryclass.filter(
          checkedClass => checkedClass.isChecked === true
        );
        if (selectedSecondaryClass.length) {
          this.saveSecodaryClass(selectedSecondaryClass, mastery);
        }
        this.saveClass();
      },

      /**
       * @function updateContentVisibility
       * Method to use override content visibility
       */
      updateContentVisibility(value) {
        this.set('isVisibility', value);
        this.set('isConfirmationVisibility', true);
      },
      confirmUpdateVisibility(content) {
        const editedClass = this.get('tempClass');
        const setting = editedClass.get('setting');
        const classId = editedClass.id;
        if (content) {
          const isValue = this.get('isVisibility') === true ? 'on' : 'off';
          setting['default.content.visibility'] = isValue;
          this.saveClass();
          this.set('isConfirmationVisibility', false);
          this.set('getContentVisibility', this.get('isVisibility'));
          if (setting['course.premium']) {
            this.get('classService').updateContentVisibility(
              classId,
              null,
              isValue
            );
          }
        } else {
          this.set('getContentVisibility', !this.get('isVisibility'));
          this.set('isConfirmationVisibility', false);
        }
      },

      /**
       * @function updateCommunityCollaboration
       * Method to use override community collaboration
       */
      updateCommunityCollaboration(value) {
        let controller = this,
          editedClass = controller.get('tempClass'),
          setting = editedClass.get('setting');
        setting.enableCommunityCollaboration = value;
        controller
          .get('classService')
          .updateCommunityCollaboration(value ? 'on' : 'off', editedClass.id)
          .then(function() {
            controller.saveClass();
          });
      },

      /**
       * Triggered when a setting show correct answer
       */
      updateCorrectAnswer: function(showCorrectAnswer = false) {
        let controller = this;
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_SHOW_CORRECT_ANSWER
        );
        let editedClass = controller.get('tempClass');
        let setting = editedClass.get('setting');
        setting.set('show_correct_answer', showCorrectAnswer);
        this.saveClass();
      },

      /**
       *
       * Triggered when a edit min score class option is selected
       */
      editScore: function() {
        let controller = this;
        controller.set('editingScore', true);
      },

      /**
       *Remove student
       */
      removeStudent: function(student) {
        let controller = this;
        var model = {
          content: student,
          deleteMethod: function() {
            return controller
              .get('classService')
              .removeStudentFromClass(
                controller.get('class.id'),
                student.get('id')
              );
          },
          callback: {
            success: function() {
              controller.get('sortedMembers').removeObject(student);
            }
          }
        };

        this.actions.showModal.call(
          this,
          'content.modals.gru-remove-student',
          model,
          null,
          null,
          null,
          false
        );
      },

      updateEvidence: function(value = false) {
        let controller = this;
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_UPLOAD_EVIDENCE
        );
        let editedClass = controller.get('tempClass');
        let setting = editedClass.get('setting');
        setting.set('show_evidence', value);
        controller.saveClass();
      },
      updateAssignContent: function(value = false) {
        let controller = this;
        let editedClass = controller.get('tempClass');
        let setting = editedClass.get('setting');
        setting['ca.auto.assign.content'] = value;
        controller.saveClass();
      },

      /**
       *
       * Triggered when a edit save score option is selected
       */
      saveScore: function() {
        let controller = this;
        controller.set('editingScore', false);
        controller.saveClass();
      },

      /**
       *Sort student list by criteria
       */
      sortStudents: function(criteria) {
        if (this.get('sortBy') !== criteria) {
          this.set('sortBy', criteria);
          this.set('reverseSort', false);
        } else {
          this.set('reverseSort', !this.get('reverseSort'));
        }
      },

      /**
       *
       * Triggered when a update class option is selected
       */
      updateClass: function() {
        this.saveClass();
      },

      /**
       * Triggered from a co-teacher card of class mgt
       */
      removeCoteacher: function(collaborator) {
        const controller = this;
        let classCollaborators = controller.get('collaborators');
        classCollaborators = classCollaborators.removeObject(collaborator);
        let classCollaboratorIds = classCollaborators.map(
          collaborator => collaborator.id
        );
        controller
          .updateCollaboratorInClass(classCollaboratorIds)
          .then(function() {
            controller.set('collaborators', classCollaborators);
          });
      },

      /**
       *Remove student
       */
      onRemoveStudent: function(student) {
        let controller = this;
        controller.set('columnListView', true);

        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_DELETE_STUDENT);
        var model = {
          content: student,
          deleteMethod: function() {
            return controller
              .get('classService')
              .removeStudentFromClass(
                controller.get('class.id'),
                student.get('id')
              );
          },
          callback: {
            success: function() {
              controller.get('sortedMembers').removeObject(student);
              controller.reloadClassMembers();
            }
          }
        };

        this.actions.showModal.call(
          this,
          'content.modals.gru-remove-student',
          model,
          null,
          null,
          null,
          false
        );
      },

      onstudentView(student) {
        this.set('studentImpersonateFrame', true);
        const controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_IMPERSONATE);
        const profileService = controller.get('profileService');
        profileService
          .teacherImpersonation(student.id, controller.get('class.id'))
          .then(usersession => {
            const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
            const redirectUrl = `${baseUrl}/student/class/${this.get(
              'class.id'
            )}/class-activities`;
            let impersonateUrl = `${baseUrl}?access_token=${usersession.access_token}&redirect_url=${redirectUrl}`;
            const rootElement = Ember.$(Env.rootElement);
            rootElement.addClass('app-readonly-mode');
            window.impersonate = true;
            this.set('impersonateUrl', impersonateUrl);
            this.set('impersonateStudent', student);
          });
      },
      /**
       * Method to show student report in pathway pullup
       */
      onOpenStudentReport(reportData, model) {
        let controller = this;
        controller.set('showReportPullUp', true);
        controller.set('reportData', reportData);
        controller.set('model', model);
        controller.set('isLoading', true);
      },

      updateFwkSettings(value) {
        const controller = this;
        if (controller.get('course.id') || controller.get('subject')) {
          let tClass = controller.get('tempClass'),
            sourcePreferenceJSON = controller.get('class.preference'),
            preferenceJSON = Ember.Object.create({
              subject: sourcePreferenceJSON.subject,
              framework: value.code
            });

          tClass.set('preference', preferenceJSON);
          controller.fetchTaxonomyGrades().then(() => {
            tClass.set('gradeLowerBound', null);
            tClass.set('gradeCurrent', null);
            controller.set('enableApplySettings', true); // some UI interaction happened...enable apply button
            controller.send('applyClassSettings');
          });
        } else {
          Ember.Logger.log(
            'Course or Subject not assigned to class, cannot update class settings'
          );
        }
      },

      updateClassStudentGradeOrigin(grade, studentId) {
        let tempGradeLowerBound;
        let gradeLevel;
        if (grade.levelId) {
          tempGradeLowerBound = grade.get('levelId');
          gradeLevel = grade.get('id');
        } else {
          tempGradeLowerBound = grade.get('id');
        }
        let student = this.get('class.members').findBy('id', studentId);
        let gradeLowerBound = student.get('gradeLowerBound');

        if (
          gradeLevel !== null &&
          gradeLevel !== undefined &&
          gradeLowerBound !== gradeLevel
        ) {
          student.set('tempGradeLowerBound', tempGradeLowerBound);
          student.set('gradeLevel', gradeLevel);
        } else {
          if (gradeLowerBound !== tempGradeLowerBound) {
            student.set('tempGradeLowerBound', tempGradeLowerBound);
            student.set('gradeLevel', gradeLevel);
          }
        }
      },

      updateClassStudentGradeDestination(grade, studentId) {
        let student = this.get('class.members').findBy('id', studentId);
        let gradeUpperBound = student.get('gradeUpperBound');
        let tempGradeUpperBound = grade.get('id');
        let gradeDestination =
          student.get('tempGradeUpperBound') || gradeUpperBound;
        if (gradeDestination !== tempGradeUpperBound) {
          student.set('tempGradeUpperBound', tempGradeUpperBound);
        }
      },
      updateFluency(fludata, fluId) {
        this.set('enableButton', true);
        const f_data = {
          user_id: fluId,
          fluency: fludata
        };
        const updateData = this.get('selectedFluency').find(item => {
          return item.user_id === fluId;
        });
        if (updateData) {
          updateData.fluency = fludata;
        } else {
          this.get('selectedFluency').push(f_data);
        }
      },

      updateClassGradeLevel(grade) {
        let gradeList = this.get('subjectTaxonomyGrades').sortBy('sequence');
        let lowerGrade = gradeList.get(0);
        this.set('enableApplySettings', true);
        this.set('tempClass.gradeCurrent', grade.get('id'));
        this.set('tempClass.gradeLowerBound', lowerGrade.get('id'));
        this.set('tempClass.forceCalculateILP', true);
        this.send('applyClassSettings');
      },

      updateClassRouteSetting() {
        this.set('enableApplySettings', true);
        this.send('applyClassSettings');
      },

      updateClassForceCalculateILPSetting() {
        this.set('enableApplySettings', true);
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_PRESENR_DIAGNOSTIC
        );
        let forceCalculateILP = this.get('tempClass.forceCalculateILP');
        this.set('tempClass.forceCalculateILP', !forceCalculateILP);

        if (!forceCalculateILP === false) {
          this.reloadClassMembers();
        }
        this.send('applyClassSettings');
      },

      updateClassRosterSetting() {
        if (this.get('isEnableRosterSync')) {
          this.set('rosterPopup', true);
          return;
        }
        this.get('tenantService').getActiveRoster(
          {
            'roster.sync.enabled': this.get('isEnableRosterSync')
          },
          this.get('class.id')
        );
        this.set('enableApplySettings', true);
        this.send('applyClassSettings');
      },

      rosterConformationPopup(param = null) {
        if (param) {
          this.get('tenantService').getActiveRoster(
            {
              'roster.sync.enabled': this.get('isEnableRosterSync')
            },
            this.get('class.id')
          );
        } else {
          this.set('isEnableRosterSync', false);
        }
        this.set('rosterPopup', false);
      },

      updateClassGradeOrigin(grade) {
        this.set('tempClass.gradeLowerBound', grade.get('id'));
        let gradeCurrent = this.get('class.gradeCurrent');
        let tempGradeCurrent = this.get('tempClass.gradeCurrent');
        if (!gradeCurrent && tempGradeCurrent) {
          this.set('tempClass.gradeCurrent', null);
        }
      },

      applyClassMembersSettings() {
        this.updateClassMembersSettings();
      },

      classMembersToggle(targetStatusActive, student) {
        const controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_STUDENT_ACTIVATE);
        let settings = {
          users: [student.id]
        };

        if (targetStatusActive) {
          controller.classMembersActivate(settings);
        } else {
          controller.classMembersDeactivate(settings);
        }
        student.set('isActive', targetStatusActive); //Toggle Status
      },

      applyClassSettings() {
        const controller = this;
        if (controller.get('course.id') || controller.get('subject')) {
          let settings = {
            grade_lower_bound: controller.get('tempClass.gradeLowerBound'),
            grade_upper_bound: controller.get('tempClass.gradeUpperBound'),
            grade_current: controller.get('tempClass.gradeCurrent'),
            route0: controller.get('tempClass.route0Applicable'),
            force_calculate_ilp: controller.get('tempClass.forceCalculateILP'),
            preference:
              controller.get('tempClass.preference') ||
              controller.get('class.preference')
          };
          let classData = controller.get('class');
          classData.set('gradeLowerBound', settings.grade_lower_bound);
          classData.set('gradeUpperBound', settings.grade_upper_bound);
          classData.set('gradeCurrent', settings.grade_current);
          classData.set('route0Applicable', settings.route0);
          classData.set('preference', settings.preference);
          classData.set('forceCalculateILP', settings.force_calculate_ilp);
          controller.updateClassSettings(settings);
        }
      },

      updateLanguage(language) {
        const controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_LANGUAGE_INSTRUCTION);
        const classId = this.get('class.id');
        const languageId = language.get('id');
        controller
          .get('classService')
          .updateLanguage(classId, languageId)
          .then(() => {
            controller.set('class.primaryLanguage', languageId);
          });
      },
      /**
       * Action trigger to update scope and sequence values menu dropdown
       */
      updateScopeSequence(scope) {
        this.set('activeScopeAndSequence', scope);
        scope.set('isActive', true);
        let editedClass = this.get('tempClass');
        let classSetting = {
          'pref.scope.and.sequences': [
            {
              id: scope.scopeId,
              grade_master_id: scope.id
            }
          ]
        };
        editedClass.set('setting', classSetting);
        this.saveClass();
      },

      //Action triggered when add list of users as co-teacher
      onAddCollaborators(selectedCollaborators = Ember.A([])) {
        const controller = this;
        const collaborators = controller.get('collaborators');
        let classCollaborators = collaborators.concat(selectedCollaborators);
        let classCollaboratorIds = classCollaborators.map(collaborator =>
          collaborator.get('id')
        );
        controller
          .updateCollaboratorInClass(classCollaboratorIds)
          .then(function() {
            controller.set('collaborators', classCollaborators);
          });
        controller.send('onToggleAddCollaborator');
      },

      //Action triggered when toggle collaborator panel
      onToggleAddCollaborator() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_TEACHER_ADD
        );
        $('.sub-sec-coteach .add-collaborator-panel').slideToggle();
      },

      //Action triggered when click add student button
      onToggleAddStudent() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CS_ADD_STUDENT
        );
        $('.student-sec-cont .add-students-sec').slideToggle();
      },

      //Action triggered when hit Add button to add students into the class
      onAddStudents(students) {
        const controller = this;
        const studentIds = students.map(student => {
          return student.get('id');
        });
        controller.addStudentsToClass(studentIds).then(function() {
          controller.reloadClassMembers();
        });
        controller.send('onToggleAddStudent');
        controller.set('columnListView', true);
      },

      onAddMultiStudents(selectedBy) {
        const controller = this;
        controller.set('multiSelectedBy', selectedBy);
      },

      // Action trigger when click checkbox on view multiple class
      toggleCheckbox(selectedClass) {
        let controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_MULTI_GRADE_SELECTED);
        controller.set('isEnableSave', true);
        selectedClass.toggleProperty('isChecked', true);
      },

      // Action trigger when click save button in multiple class
      saveMultipleClass() {
        let controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_MULTI_GRADE_SAVE);
        controller.updateSecondaryClass();
      },

      connectGoogleClassroom() {
        let controller = this;
        let redirectUrl = `${window.location.href}?googleConnect=true`;
        controller
          .get('classService')
          .googleClassroomAuth(redirectUrl)
          .then(redirectUrl => {
            controller.openAuthorizeWindow(redirectUrl);
          });
      },

      disconnectGoogleClassroom() {
        let controller = this;
        controller
          .get('classService')
          .deleteGoogleClassroom()
          .then(() => {
            controller.set('hasConnectAlready', false);
            controller.set('hasStudentList', []);
          });
      },

      updateClassRoomSettings(classList, isFirst = true) {
        let controller = this;
        let classId = this.get('class.id');
        let classStudents = controller.get('classStudents');
        if (isFirst) {
          controller.set('selectedClassList', classList);
          controller
            .get('classService')
            .updateGoogleClassSettings(classId, classList.id)
            .then(() => {
              controller
                .get('classService')
                .fetchStudentList(classList.id)
                .then(studentList => {
                  let listStudent = Ember.A([]);
                  studentList.forEach(student => {
                    let hasEmail = classStudents.findBy(
                      'email',
                      student.profile.emailAddress
                    );
                    if (hasEmail) {
                      hasEmail.set('userExist', true);
                      student.set('hasSelected', true);
                      hasEmail.set('classRoomStudent', student);
                      const list = {
                        user_id: hasEmail.id,
                        google_user_id: student.userId
                      };
                      listStudent.pushObject(list);
                    } else {
                      let members = controller.get('class.members');
                      let hasEmails = members.findBy(
                        'googleClassUserId',
                        student.userId
                      );
                      if (hasEmails) {
                        hasEmails.set('userExist', true);
                        student.set('hasSelected', true);
                        hasEmails.set('classRoomStudent', student);
                        const classStudentsList = controller
                          .get('filteredStudentsLocal')
                          .findBy('id', hasEmails.id);
                        if (classStudentsList) {
                          classStudentsList.set('userExist', true);
                          classStudentsList.set('classRoomStudent', student);
                        }
                      }
                    }
                  });
                  if (listStudent && listStudent.length) {
                    controller
                      .get('classService')
                      .updateClassRoomList(classId, listStudent);
                  }
                  controller.set('hasStudentList', studentList);
                })
                .catch(function() {
                  controller.set('hasStudentList', []);
                });
            });
        } else {
          let listStudent = Ember.A([]);
          classList.forEach(student => {
            if (student && student.classRoomStudent) {
              const list = {
                user_id: student.id,
                google_user_id: student.classRoomStudent.userId
              };
              listStudent.pushObject(list);
            }
          });
          if (listStudent && listStudent.length) {
            controller
              .get('classService')
              .updateClassRoomList(classId, listStudent);
          }
        }
      },

      updateGoogleUserId(student, studentList) {
        student.set('userExist', true);
        studentList.set('hasSelected', true);
        student.set('classRoomStudent', studentList);
        const classStudents = this.get('classStudents').findBy(
          'id',
          student.id
        );
        if (classStudents) {
          classStudents.set('classRoomStudent', studentList);
        }
        this.set('enableButton', true);
        $('#dlDropDown').dropdown('toggle');
      },

      onSelectTeacher(coteacher) {
        this.set('selectedCoteacher', coteacher);
      },

      getStudentDetails() {
        const controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CS_SEARCH_STUDENT);
        let bulkStudentIds = controller.get('bulkStudentIds').split(',');
        bulkStudentIds = bulkStudentIds.filter(e => e);
        let studentIds = bulkStudentIds.map(studentId => {
          studentId = studentId.replace(/ /g, '');
          return studentId.replace(/\n*$/, '');
        });
        let data =
          controller.get('multiSelectedBy') === 'email'
            ? { email_ids: studentIds, user_category: 'student' }
            : { usernames: studentIds, user_category: 'student' };
        controller
          .get('classService')
          .getStudentAvailability(data)
          .then(function(studentList) {
            controller.set('bulkStudentList', studentList);
          });
      },

      onAddBulkStudent() {
        const controller = this;
        let bulkStudentList = controller.get('bulkStudentList');
        const studentIds = bulkStudentList.filterBy('status').mapBy('id');
        if (
          controller.get('isSendSignupInviteMail') ||
          controller.get('isSendSignupInviteMail') === undefined
        ) {
          const studentEmails = bulkStudentList
            .filterBy('status', false)
            .mapBy('email');
          controller.sendWelcomeMail(studentEmails);
        }
        if (studentIds.length) {
          controller.addStudentsToClass(studentIds).then(function() {
            controller.reloadClassMembers();
          });
        }
        controller.send('onToggleAddStudent');
        controller.send('onClear');
      },

      onClear() {
        this.set('bulkStudentIds', '');
        this.set('bulkStudentList', Ember.A([]));
      }
    },

    openAuthorizeWindow(redirectUrl) {
      window.open(
        redirectUrl,
        '_blank',
        'toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=50px,width=800,height=700'
      );
    },

    getGradeSequenceById(id, source) {
      return id && source && source.findBy('id', id)
        ? source.findBy('id', id).sequence
        : id;
    },
    // Method help to parse the list of scope and sequence list by grade
    parseScopeAndSequenceList(gradeList = [], scopeAndSequenceList = []) {
      let parsedList = Ember.A();
      let scopeList = Ember.A();
      let editedClass = this.get('tempClass');
      let gradeCurrent = editedClass.get('gradeCurrent');
      scopeAndSequenceList.forEach(item => {
        if (item.get('gradesCovered').length) {
          let gradesCovered = item.get('gradesCovered');
          gradesCovered.forEach(gradeId => {
            if (gradeCurrent === gradeId) {
              scopeList.pushObject(item);
            }
            this.set('scopeList', scopeList);
            let grade = gradeList.findBy('id', gradeId);
            if (grade) {
              let activeGrade = getObjectCopy(grade);
              activeGrade.setProperties({
                scopeName: item.get('name'),
                scopeId: item.get('id')
              });
              parsedList.pushObject(activeGrade);
            }
          });
        }
      });
      return parsedList;
    },

    // -------------------------------------------------------------------------
    // Events
    init() {
      this._super(...arguments);
      this.set(
        'filteredStudentsLocal',
        getObjectsDeepCopy(this.get('classStudents'))
      );
      if (this.get('showGoogleClassroomButton')) {
        this.updateGoogleClassroom();
      }

      let controller = this;

      if (controller.get('isAddStundentByEmail')) {
        controller.set('multiSelectedBy', 'email');
      }
      Ember.run.scheduleOnce('afterRender', controller, function() {
        let fluencyDropdownValueLength;
        if (this.get('fluencyDropdownValue')) {
          fluencyDropdownValueLength = this.get('fluencyDropdownValue').length;
        }
        let chooseDefaultValues = [
          {
            value: 1,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[0].checked
                : true,
            ariaLabel: 'Students',
            name: this.get('i18n').t(
              'teacher-landing.class.class-settings.students'
            ),
            isShow: true
          },
          {
            value: 2,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[1].checked
                : true,
            ariaLabel: 'Destination',
            name: this.get('i18n').t(
              'teacher-landing.class.class-settings.destination'
            ),
            isShow: !!(
              this.get('course') &&
              this.get('course.id') &&
              this.get('class.gradeLowerBound') &&
              this.get('isPremiumClass')
            )
          },
          {
            value: 3,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[2].checked
                : false,
            ariaLabel: 'student-id',
            name: this.get('i18n').t(
              'teacher-landing.class.class-settings.student-id'
            ),
            isShow: true
          },
          {
            value: 4,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[3].checked
                : false,
            ariaLabel: 'fluency-level',
            name: this.get('i18n').t('common.fluency'),
            isShow: !!(
              this.get('isShowFluencyLevel') && fluencyDropdownValueLength
            )
          },

          {
            value: 5,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[4].checked
                : true,
            ariaLabel: 'active-column',
            name: this.get('i18n').t(
              'teacher-landing.class.class-settings.student-settings-sec.col-head-active'
            ),
            isShow: true
          },
          {
            value: 6,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[5].checked
                : true,
            ariaLabel: 'email-and-username',
            name: this.get('i18n').t(
              'teacher-landing.class.class-settings.email-username'
            ),
            isShow: true
          },
          {
            value: 7,
            checked:
              this.get('chooseDefaultValues') !== undefined
                ? this.get('chooseDefaultValues')[6].checked
                : false,
            ariaLabel: 'google-user-id',
            name: this.get('i18n').t('google-user-id'),
            isShow: !!(
              this.get('hasStudentList') && this.get('enableGoogleUserId')
            )
          }
        ];
        this.set('chooseDefaultValues', chooseDefaultValues);
      });
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {String} bulkStudentIds
     * Property for entered search term
     */
    bulkStudentIds: '',

    /**
     * @property {Class}
     */
    class: Ember.computed.alias('classController.class'),

    /**
     * @property {Course}
     */
    course: Ember.computed.alias('classController.course'),

    /**
     * @property {classMembers}
     */
    classMembers: Ember.computed.alias('classController.members.members'),

    /**
     * @type {Boolean}
     * Property to check whether a class is premium
     */
    isPremiumClass: Ember.computed('class', function() {
      let controller = this;
      const currentClass = controller.get('class');
      let setting = currentClass.get('setting');
      return setting ? setting['course.premium'] : false;
    }),

    isMasteryApplicable: Ember.computed('tempClass', function() {
      let controller = this;
      let isMasteryApplicable = false;
      const currentClass = controller.get('tempClass');
      let setting = currentClass.get('setting');
      if (setting) {
        isMasteryApplicable =
          setting['mastery.applicable'] === true ||
          setting['mastery.applicable'] === 'true' ||
          setting.mastery_applicable === 'true' ||
          setting.mastery_applicable === true;
      }
      return isMasteryApplicable;
    }),

    showCorrectAnswer: Ember.computed('tempClass', function() {
      let controller = this;
      const currentClass = controller.get('tempClass');
      let setting = currentClass.get('setting');
      let showCorrectAnswer = true;
      if (setting) {
        showCorrectAnswer =
          setting.show_correct_answer || setting['show.correct.answer'];
      }
      return showCorrectAnswer === undefined ? true : showCorrectAnswer;
    }),

    subject: Ember.computed.alias('class.preference.subject'),

    subjectFWK: Ember.computed('tempClass.preference', function() {
      return this.get('tempClass.preference.framework');
    }),

    selectedCoteacher: null,
    /**
     * @param {Boolean } didValidate - value used to check if input has been validated or not
     */
    didValidate: false,

    /**
     * @param {Boolean } editingTitle - value used to check if title is editing or not
     */
    editingTitle: null,

    /**
     * @param {Boolean } editingScore - value used to check if score is editing or not
     */
    editingScore: null,

    /**
     * @property {boolean} isAttendClassWithCode
     */
    isAttendClassWithCode: Ember.computed.equal('class.classSharing', 'open'),

    /**
     * @property {boolean} studentImpersonateFrame
     */
    studentImpersonateFrame: false,

    /**
     * @param {[Student]} sortedMembers - Class members sorted
     */
    sortedMembers: Ember.computed('class.members.[]', function() {
      return this.get('class.members');
    }),

    /**
     * @property {Array} studentsWithoutGradeBoundaries
     * Property for list of students who haven't set class boundaries
     */
    studentsWithoutGradeBoundaries: Ember.computed(
      'sortedMembers',
      'sortedMembers.@each.gradeLowerBound',
      'sortedMembers.@each.gradeUpperBound',
      function() {
        const component = this;
        const sortedMembers = component.get('sortedMembers');
        return sortedMembers
          .filter(student => {
            return !(
              student.get('gradeLowerBound') && student.get('gradeUpperBound')
            );
          })
          .sortBy('lastName');
      }
    ),

    /**
     * @property {Array} studentsWithGradeBoundaries
     * Property for list of students who have set class boundaries
     */
    studentsWithGradeBoundaries: Ember.computed(
      'sortedMembers',
      'sortedMembers.@each.gradeLowerBound',
      function() {
        const component = this;
        const sortedMembers = component.get('sortedMembers');
        return sortedMembers
          .filter(student => {
            return (
              student.get('gradeLowerBound') && student.get('gradeUpperBound')
            );
          })
          .sortBy('lastName');
      }
    ),

    /**
     * @property {Array} classStudents
     * Property for list of active students in the class
     */
    classStudents: Ember.computed(
      'studentsWithoutGradeBoundaries.@each',
      'studentsWithGradeBoundaries.@each',
      function() {
        return this.get('studentsWithoutGradeBoundaries').concat(
          this.get('studentsWithGradeBoundaries')
        );
      }
    ),
    classStudentsObserver: Ember.observer(
      'sortedMembers.@each.gradeUpperBound',
      function() {
        let columnListView = this.get('columnListView');
        if (!columnListView) {
          this.set('chooseDefaultValues', undefined);
        }

        this.set('filteredStudentsLocal', this.get('classStudents').copy());
      }
    ),
    callTenantSettings() {
      const component = this;
      component
        .get('tenantService')
        .getActiveTenantSetting()
        .then(function(tenantSettings) {
          component.set('tenantSettings', tenantSettings);
          component.set(
            'tenantClassSettings',
            tenantSettings.class_settings_show_student_info
          );
        });
    },

    showEvidence: Ember.computed('tempClass', function() {
      let controller = this;
      const currentClass = controller.get('tempClass');
      let setting = currentClass.get('setting');
      let showEvidence = true;
      if (setting) {
        showEvidence = setting.show_evidence || setting['show.evidence'];
      }
      return showEvidence === undefined ? true : showEvidence;
    }),

    assignAutoContent: Ember.computed('tempClass', function() {
      let controller = this;
      const currentClass = controller.get('tempClass');
      let setting = currentClass.get('setting');
      return setting && setting['ca.auto.assign.content']
        ? setting['ca.auto.assign.content']
        : false;
    }),

    isShowAssignContent: Ember.computed(function() {
      return this.get('isEnableCaBaseline')
        ? this.get('isEnableCaBaseline')
        : false;
    }),

    /**
     * @property {Object} memberGradeBounds
     */
    memberGradeBounds: Ember.computed.alias('class.memberGradeBounds'),

    /**
     * Toggle Options
     * @property {Ember.Array}
     */
    switchOptions: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: true
      }),
      Ember.Object.create({
        label: 'common.no',
        value: false
      })
    ]),

    switchOptionsMastery: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: false
      }),
      Ember.Object.create({
        label: 'common.no',
        value: true
      })
    ]),

    switchOptionsContentVisibility: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: false
      }),
      Ember.Object.create({
        label: 'common.no',
        value: true
      })
    ]),

    switchOptionsCommunityCollaboration: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: 'off'
      }),
      Ember.Object.create({
        label: 'common.no',
        value: 'on'
      })
    ]),

    switchOptionsEvidence: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: false
      }),
      Ember.Object.create({
        label: 'common.no',
        value: true
      })
    ]),

    switchOptionAutoAssign: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: false
      }),
      Ember.Object.create({
        label: 'common.no',
        value: true
      })
    ]),

    /**
     * Copy of the class model used for editing.
     * @property {Class}
     */
    tempClass: null,

    isEditing: true,

    subjectTaxonomyGrades: null,

    /**
     * @property {Array} collaborators
     * Property for list of class collaborators
     */
    collaborators: Ember.computed.alias('class.collaborators'),

    enableOwner: Ember.computed('collaborators.@each.isChecked', function() {
      return this.get('collaborators').filterBy('isChecked', true).length;
    }),

    /**
     * @property {Object} secondaryclass
     */
    secondaryClasses: Ember.computed.alias('classController.secondaryClasses'),

    /**
     * @property {Object} secondaryclassList
     */
    secondaryClassList: Ember.A([]),

    hasConnectAlready: false,

    hasClassList: Ember.A([]),

    selectedClassList: Ember.A([]),

    hasStudentList: Ember.A([]),

    enableButton: false,

    selectedFluency: Ember.A([]),

    /**
     * @property {Array} multipleClassList
     * property for list of class in class settigns
     */
    multipleClassList: Ember.computed('secondaryClassList.[]', function() {
      let multipleClasses = this.get('secondaryClassList');
      let secondaryClasses = this.get('secondaryClasses');
      if (secondaryClasses && multipleClasses) {
        secondaryClasses.map(classes => {
          let checkedClass = multipleClasses.findBy('id', classes.id);
          if (checkedClass) {
            checkedClass.set('isChecked', true);
          }
        });
      }
      return multipleClasses
        ? multipleClasses.sortBy('isChecked').reverse()
        : Ember.A([]);
    }),

    isShowRoster: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      return (
        tenantSettings &&
        tenantSettings.show_class_roster_sync_control &&
        tenantSettings.show_class_roster_sync_control === 'on'
      );
    }),

    /**
     * @property {Boolean} isEnableSave
     */
    isEnableSave: false,

    hideRoute0: Ember.computed(function() {
      let tenantSetting = this.get('tenantService').getStoredTenantSetting();
      let parsedTenantSettings = JSON.parse(tenantSetting);
      return (
        parsedTenantSettings &&
        parsedTenantSettings.hide_route0_setting &&
        parsedTenantSettings.hide_route0_setting === 'on'
      );
    }),

    isShowStudentView: Ember.computed(function() {
      let tenantSettings = JSON.parse(
        this.get('tenantService').getStoredTenantSetting()
      );
      return !(
        tenantSettings &&
        tenantSettings.can_impersonate_student &&
        tenantSettings.can_impersonate_student === 'false'
      );
    }),

    hasDiagnostic: Ember.computed(
      'course',
      'tempClass.forceCalculateILP',
      function() {
        return (
          this.get('isPremiumClass') &&
          this.get('course') &&
          !this.get('hideRoute0') &&
          this.get('course.id') &&
          this.get('subject') &&
          !this.get('tempClass.forceCalculateILP')
        );
      }
    ),

    /**
     * @function fetchTaxonomyGrades
     * Method to fetch taxonomy grades
     */
    fetchTaxonomyGrades() {
      let controller = this;
      if (this.get('course.id') || this.get('subject')) {
        let taxonomyService = controller.get('taxonomyService');
        let filters = {
          subject: controller.get('subject')
        };
        let fwkCode =
          controller.get('tempClass.preference.framework') ||
          controller.get('class.preference.framework');
        if (fwkCode) {
          filters.fw_code = fwkCode;
        }

        return Ember.RSVP.hash({
          taxonomyGrades: Ember.RSVP.resolve(
            taxonomyService.fetchGradesBySubject(filters)
          )
        }).then(({ taxonomyGrades }) => {
          controller.set('subjectTaxonomyGrades', taxonomyGrades);
        });
      }
    },

    /**
     * Fetch class member data to get class member bounds.
     */
    fetchClassMemberBounds() {
      let controller = this;
      const classId = controller.get('class.id');
      controller
        .get('classService')
        .readClassMembers(classId)
        .then(members => {
          controller.set(
            'class.memberGradeBounds',
            members.get('memberGradeBounds')
          );
          controller.updateBoundValuesToStudent();
        });
    },

    // -------------------------------------------------------------------------
    // Methods

    onExpandDropdown: function() {
      const controller = this;
      Ember.run.scheduleOnce('afterRender', controller, function() {
        let dropdownMenu;
        const currentPageElement = $('.controller.teacher.class-settings').find(
          '.student-sec-cont'
        );
        currentPageElement.off('show.bs.dropdown');
        currentPageElement.off('hide.bs.dropdown');
        currentPageElement.on('show.bs.dropdown', function(e) {
          controller
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_CS_CHOOSE_COLUMNS);

          dropdownMenu = $(e.target).find('.dropdown-menu');
          currentPageElement.append(dropdownMenu.detach());
          var eOffset = $(e.target).offset();
          dropdownMenu.css({
            display: 'block',
            top: eOffset.top + $(e.target).outerHeight(),
            left: eOffset.left
          });
          $(this)
            .find('.student-settings-sec')
            .css({
              'pointer-events': 'none'
            });
        });

        currentPageElement.on('hide.bs.dropdown', function(e) {
          $(e.target).append(dropdownMenu.detach());
          dropdownMenu.hide();
          $(this)
            .find('.student-settings-sec')
            .css({
              'pointer-events': 'auto'
            });
        });
      });
    },

    /**
     * Validate and save class information
     */
    saveClass: function() {
      var controller = this;
      let editedClass = this.get('tempClass');
      var classSharing = this.get('isAttendClassWithCode')
        ? 'open'
        : 'restricted';

      editedClass.set('classSharing', classSharing);
      editedClass.validate().then(
        function({ validations }) {
          if (validations.get('isValid')) {
            controller
              .get('classService')
              .updateClass(editedClass)
              .then(function() {
                controller.send('updateUserClasses');

                controller
                  .get('class')
                  .merge(editedClass, [
                    'title',
                    'minScore',
                    'classSharing',
                    'setting'
                  ]);
              });
          } else {
            var classForEditing = controller.get('class').copy();
            this.set('tempClass', classForEditing);
          }
          this.set('didValidate', true);
        }.bind(this)
      );
    },

    saveSecodaryClass(secondaryClassList, mastery) {
      let controller = this;
      secondaryClassList.forEach(secondaryClass => {
        controller
          .get('classService')
          .readClassInfo(secondaryClass.id)
          .then(classDetails => {
            let setting = classDetails.get('setting');
            setting.set('mastery_applicable', mastery);
            controller.get('classService').updateClass(classDetails);
          });
      });
    },

    updateBoundValuesToStudent() {
      let controller = this;
      let members = controller.get('class.members');
      members.forEach(member => {
        let memberId = member.get('id');
        let grade = controller.get('memberGradeBounds').findBy(memberId);
        if (grade) {
          let gradeBounds = grade.get(memberId);
          member.set('gradeLowerBound', gradeBounds.grade_lower_bound);
          member.set('gradeUpperBound', gradeBounds.grade_upper_bound);
          member.set('gradeLevel', gradeBounds.grade_level);
        }
        member.set('tempGradeLowerBound', null);
        member.set('tempGradeUpperBound', null);
      });
    },

    setupDisplayProperties() {
      let controller = this;
      controller.updateBoundValuesToStudent();
      controller.competencyMinScoreList();
      controller.scopeAndSequenceDetails();
      controller.thumbnailUrl();
      controller.set('enableApplySettings', false);
    },

    updateGoogleClassroom() {
      let controller = this;
      controller.fetchTokenService();
    },

    updateClassSettings: function(settings) {
      const controller = this;
      const classId = this.get('class.id');
      const isPremiumClass = controller.get('isPremiumClass');
      controller
        .get('classService')
        .updatePreference(classId, settings.preference)
        .then(function() {
          if (isPremiumClass) {
            controller
              .get('classService')
              .classSettings(classId, settings)
              .then(function() {
                controller.set('enableApplySettings', false);
                // TO-DO optmize, call only when bounds get change.
                controller.fetchClassMemberBounds();
              });
          } else {
            controller.fetchClassMemberBounds();
          }
        });
    },

    updateClassMembersSettings() {
      const controller = this;
      const classId = controller.get('class.id');
      const isPremiumClass = controller.get('isPremiumClass');
      const forceCalculateILP = controller.get('class.forceCalculateILP');
      const studentsLevelSetting = controller.get('studentsLevelSetting');
      let studentsSetting = {
        users: []
      };
      let lowerBoundUpdateStudentsId = [];
      studentsLevelSetting.forEach(student => {
        let tempGradeLowerBound = student.get('tempGradeLowerBound');
        let tempGradeUpperBound = student.get('tempGradeUpperBound');
        let gradeLevel = student.get('gradeLevel');
        let studentId = student.get('id');
        let studentSetting = {
          user_id: studentId,
          grade_level: gradeLevel
        };
        if (tempGradeLowerBound) {
          lowerBoundUpdateStudentsId.push(studentId);
          studentSetting.grade_lower_bound = tempGradeLowerBound;
        }
        if (tempGradeUpperBound) {
          studentSetting.grade_upper_bound = tempGradeUpperBound;
        }
        studentsSetting.users.push(studentSetting);
      });
      controller.set('enableButton', false);
      let classStudents = controller.get('classStudents');
      controller.send('updateClassRoomSettings', classStudents, false);
      if (!studentsSetting.users.length) {
        return;
      }
      controller
        .get('classService')
        .classMembersSettings(classId, studentsSetting)
        .then(() => {
          if (
            controller.get('isShowFluencyLevel') &&
            controller.get('selectedFluency').length
          ) {
            controller
              .get('selectedFluency')
              .forEach(item => delete item.fluency.fluency_display_title);
            const userData = Ember.Object.create({});
            userData.users = controller.get('selectedFluency');
            controller
              .get('fluencyService')
              .updateClassSettingFluencyLevel(userData)
              .then(() => {
                controller.fetchFluencyList();
              });
          }
          controller.fetchClassMemberBounds();
          if (
            forceCalculateILP &&
            isPremiumClass &&
            lowerBoundUpdateStudentsId.length > 0
          ) {
            controller
              .get('skylineInitialService')
              .calculateSkyline(classId, lowerBoundUpdateStudentsId);
          }
        });
    },

    classMembersDeactivate: function(settings) {
      const controller = this;
      const classId = this.get('class.id');
      controller
        .get('classService')
        .classMembersDeactivate(classId, settings)
        .then(function(/* responseData */) {
          /*    //Do nothing for success  */
        });
    },

    classMembersActivate: function(settings) {
      const controller = this;
      const classId = this.get('class.id');
      controller
        .get('classService')
        .classMembersActivate(classId, settings)
        .then(function(/* responseData */) {
          /*    //Do nothing for success  */
        });
    },
    /**
     * Reset controller values
     */
    fetchFluencyList: function() {
      let component = this;
      const userData = Ember.Object.create({});
      userData.users = this.get('class').members.map(item => {
        return item.id;
      });
      if (userData.users.length) {
        component
          .get('fluencyService')
          .getClassSettingFluency(userData)
          .then(listData => {
            if (listData.users.length) {
              component.get('classStudents').map(studentData => {
                const fluData = listData.users.find(item => {
                  return item.user_id === studentData.id;
                });
                if (fluData) {
                  fluData.fluency.fluency_display_title = `${fluData.fluency.fluency_display_code} - ${fluData.fluency.fluency_description}`;
                  studentData.set(
                    'fluency',
                    Ember.Object.create(fluData.fluency)
                  );
                }
                return studentData;
              });
            }
          });
      }
    },

    resetValues: function() {
      let component = this;
      this.set('isLevelDropdown', false);
      this.set('editingTitle', null);
      this.set('editingScore', null);
      this.set('didValidate', false);

      component.set(
        'enableStudentName',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[0].checked
          : true
      );
      component.set(
        'enableDestination',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[1].checked
          : true
      );
      component.set(
        'enableStudentId',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[2].checked
          : false
      );
      component.set(
        'enableFluencyLevel',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[3].checked
          : false
      );
      component.set(
        'enableActive',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[4].checked
          : true
      );
      component.set(
        'enableEmailUsername',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[5].checked
          : true
      );
      component.set(
        'enableGoogleUserId',
        this.get('chooseDefaultValues') !== undefined
          ? this.get('chooseDefaultValues')[6].checked
          : false
      );
      this.init();
      if (component.get('isShowFluencyLevel')) {
        component.fetchFluencyList();
      }
      component.onExpandDropdown();
    },

    /**
     * @function fetchMatchingUserProfiles
     * Method to fetch user profile details for given emailId
     */
    fetchMatchingUserProfiles(userEmail) {
      const controller = this;
      const profileService = controller.get('profileService');
      return profileService.checkEmailExists(userEmail);
    },

    /**
     * @function updateCollaboratorInClass
     * Method to update collaborator list in a class
     */
    updateCollaboratorInClass(collaborators) {
      const controller = this;
      const classService = controller.get('classService');
      const classId = controller.get('class.id');
      collaborators = collaborators.length ? collaborators : null;
      return classService.removeCoTeacherFromClass(classId, collaborators);
    },

    /**
     * @function addStudentsToClass
     * @param {Array} studentIds
     * @return {Promise}
     * Method to add list of student ids into a class
     */
    addStudentsToClass(studentIds) {
      const controller = this;
      const classId = controller.get('class.id');
      const dataParam = Ember.Object.create({
        students: studentIds
      });
      return controller
        .get('classService')
        .addStudentsToClass(classId, dataParam);
    },

    /**
     * @function reloadClassMembers
     * Method to reload class members
     */
    reloadClassMembers() {
      const controller = this;
      const classId = controller.get('class.id');
      controller
        .get('classService')
        .readClassMembers(classId)
        .then(function(classMembers) {
          controller.set('class.members', classMembers.get('members'));
          controller.set(
            'class.memberGradeBounds',
            classMembers.get('memberGradeBounds')
          );
          controller.set('filteredStudentsLocal', classMembers.get('members'));
          controller.updateBoundValuesToStudent();
          if (controller.get('hasDiagnostic')) {
            controller.updateClassMembersSettings();
          }
          if (controller.get('isShowFluencyLevel')) {
            controller.fetchFluencyList();
          }
        });
    },

    updateSecondaryClass() {
      let controller = this;
      let classId = controller.get('class.id');
      let multipleClassList = controller.get('multipleClassList');
      let checkedClassIdList = [];
      if (multipleClassList && multipleClassList.length) {
        multipleClassList.map(checkedClass => {
          if (checkedClass.isChecked === true) {
            checkedClassIdList.push(checkedClass.id);
          }
        });
      }
      let classSetting = {
        setting: {
          'secondary.classes': {
            list: checkedClassIdList,
            confirmation: true
          }
        }
      };
      controller
        .get('classController.multipleClassService')
        .updateMultipleClass(classId, classSetting)
        .then(() => {
          const primaryClass = controller.get('class');
          primaryClass.set('isUpdatedSecondaryClass', true);
          primaryClass.set('setting', classSetting.setting);
          controller.set('isEnableSave', false);
        });
    },

    /**
     * @function loadSecondaryClassList
     * Method to load all classes which can be attached as secondary class
     */
    loadSecondaryClassList() {
      const isSecondaryClassEnabled = this.get(
        'configuration.GRU_FEATURE_FLAG.isShowSecondaryClass'
      );
      const isAllowMultiGradeClass =
        this.get('session.tenantSetting.allowMultiGradeClass') === 'on';
      const subject = this.get('subject');
      if (isSecondaryClassEnabled && isAllowMultiGradeClass && subject) {
        this.get('multipleClassService')
          .fetchMultipleClassList(this.get('class.id'))
          .then(secondaryClassList => {
            this.set('secondaryClassList', secondaryClassList);
          });
      }
    },

    fetchTokenService() {
      let controller = this;
      controller
        .get('classService')
        .fetchAccessToken()
        .then(token => {
          controller.set('hasConnectAlready', !!token);
          if (token) {
            controller.fetchClassList();
          }
        })
        .catch(function() {
          controller.set('hasConnectAlready', false);
        });
    },

    fetchClassList() {
      let controller = this;
      controller
        .get('classService')
        .fetchClassRoomList()
        .then(classList => {
          controller.set('hasClassList', classList.response);
          let setting = controller.get('class.setting');
          if (setting.google_classroom_id) {
            let hasSelected = classList.response.findBy(
              'id',
              setting.google_classroom_id
            );
            if (hasSelected) {
              controller.send('updateClassRoomSettings', hasSelected);
              controller.set('selectedClassList', hasSelected);
            }
          }
        })
        .catch(function() {
          controller.set('hasClassList', []);
          controller.set('selectedClassList', []);
        });
    },

    competencyMinScoreList() {
      const component = this;
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
    },

    /**
     * Action trigger for get thumbnail image
     */
    thumbnailUrl() {
      const appRootPath = this.get('appRootPath');
      const coverImage = this.get('class.coverImage');
      const thumbnail = coverImage
        ? coverImage
        : this.get('course.thumbnailUrl');
      let thumbnailImage = appRootPath + DEFAULT_IMAGES.CLASS_DEFAULT;
      if (thumbnail) {
        thumbnailImage =
          thumbnail === `/${DEFAULT_IMAGES.COURSE}`
            ? appRootPath + DEFAULT_IMAGES.CLASS_DEFAULT
            : thumbnail;
      }
      this.set('thumbnailImage', thumbnailImage);
    },
    /**
     * Action trigger for scope and sequence values from API
     */
    scopeAndSequenceDetails() {
      let classPreference = this.get('class.preference');
      if (classPreference) {
        let params = {
          subjectCode: classPreference.get('subject'),
          fwCode: classPreference.get('framework')
        };
        const scopeAndSequenceService = this.get('scopeAndSequenceService');
        Ember.RSVP.hash({
          gradeList: this.get('taxonomyService').fetchGradesBySubject({
            subject: params.subjectCode,
            fw_code: params.fwCode
          }),
          scopeAndSequenceList: scopeAndSequenceService.fetchScopeAndSequence(
            params
          )
        }).then(({ gradeList, scopeAndSequenceList }) => {
          let parsedList = this.parseScopeAndSequenceList(
            gradeList,
            scopeAndSequenceList
          );

          if (parsedList) {
            $(function() {
              $('.tool').each(function() {
                var thisTxt = $(this).text();
                var cloneEle = document.createElement('div');
                cloneEle = $(cloneEle);
                cloneEle.addClass('ele-clone');
                cloneEle.html(thisTxt);
                $('body').append(cloneEle);
                if ($(this).width() <= cloneEle.width()) {
                  $(this).attr('title', thisTxt);
                  $(this).tooltip();
                } else {
                  $(this).removeAttr('title');
                }
                cloneEle.remove();
              });
            });

            let parsedScopeList = Ember.A();
            parsedList.forEach(scope => {
              let editedClass = this.get('tempClass');
              let gradeCurrent = editedClass.get('gradeCurrent');
              if (gradeCurrent === scope.id) {
                parsedScopeList.pushObject(scope);
              }
            });
            this.set('scopeAndSequences', parsedScopeList);
            let editedClass = this.get('tempClass');
            let setting = editedClass.get('setting');
            let scopeAndSequence = setting['pref.scope.and.sequences'];

            if (scopeAndSequence && scopeAndSequence.length) {
              let selectedScopeList = Ember.A();
              let scopeDetails = scopeAndSequence.get(0);
              let scopeId = scopeDetails.grade_master_id;
              let scopeAndSequences = this.get('scopeAndSequences');
              let scope = scopeAndSequences.findBy('id', scopeId);
              this.set('activeScopeAndSequence', scope);

              parsedScopeList.forEach(selectedScope => {
                if (selectedScope.scopeId === scopeDetails.id) {
                  selectedScopeList.pushObject(selectedScope);
                }
              });
              this.set('activeScopeAndSequence', selectedScopeList[0]);
            }
          }
        });
      }
    },

    /**
     * @function sendWelcomeMail
     * @param {Array} studentEmailIds
     * Method to send a mail to student
     */
    sendWelcomeMail(studentEmailIds) {
      const controller = this;
      let teacher = controller.get('class.owner');
      const dataParam = Ember.Object.create({
        templateName: EMAIL_TEMPLATE_NAME.SIGNUP_MAIL,
        emailIds: studentEmailIds,
        teacherName: teacher.get('fullName'),
        className: controller.get('class.title'),
        classCode: controller.get('class.code'),
        signupURL: controller.get('tenantSignupURL')
      });
      controller.get('classService').sendWelcomeMail(dataParam);
    }
  }
);
