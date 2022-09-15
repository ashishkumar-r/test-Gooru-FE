import Ember from 'ember';
import {
  MEETING_TOOLS,
  DEFAULT_THRESHOLD_VALUE
} from 'gooru-web/config/config';
import { isEmptyValue } from 'gooru-web/utils/utils';

export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {tenantService} Service to fetch the tenant related information.
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  learningToolService: Ember.inject.service('api-sdk/learning-tools'),

  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Methods

  preferredMeetingTool() {
    const tenantSetting = this.get('tenantService').getStoredTenantSetting();
    const parsedTenantSettings = JSON.parse(tenantSetting);
    if (parsedTenantSettings && parsedTenantSettings.preferred_meeting_tool) {
      return parsedTenantSettings.preferred_meeting_tool;
    }
    return MEETING_TOOLS.hangout;
  },

  isShowStudyTimerWidget: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return (
      tenantSettings &&
      tenantSettings.show_study_timer_widget &&
      tenantSettings.show_study_timer_widget === 'on'
    );
  }),

  isLockStudentProfileInfoUpdate: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return (
      tenantSettings &&
      tenantSettings.lock_student_profile_info_update &&
      tenantSettings.lock_student_profile_info_update === 'on'
    );
  }),

  getMeetingToolName: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSettings && tenantSettings.preferred_meeting_tool;
  }),

  isShowIncompleteClassess: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return (
      tenantSetting &&
      tenantSetting.show_incomplete_classrooms &&
      tenantSetting.show_incomplete_classrooms === 'on'
    );
  }),

  isStudyPlayerCollectionShowCorrectAnswer: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return (
      tenantSetting && tenantSetting.study_player_collection_show_correct_answer
    );
  }),

  tenantSettingsObj: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSetting;
  }),

  enabledDomainDiagnostic: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    return tenantSettingsObj && tenantSettingsObj.domain_diagnostic_enabled;
  }),

  tenantSettingBg: Ember.computed(function() {
    const controller = this;
    let tenantSettings = JSON.parse(
      controller.get('tenantService').getStoredTenantSetting()
    );
    if (
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.study_player_pg_image
    ) {
      return tenantSettings.ui_element_visibility_settings
        .study_player_pg_image;
    } else {
      return '/assets/gooru/study-player-kangaroos.png';
    }
  }),

  tenantSettingBgCheck() {
    const controller = this;
    let tenantSettings = JSON.parse(
      controller.get('tenantService').getStoredTenantSetting()
    );
    if (
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.study_player_pg_image
    ) {
      return `background-image: url(${tenantSettings.ui_element_visibility_settings.study_player_pg_image})`;
    } else {
      return 'background-image: url("/assets/gooru/study-player-kangaroos.png")';
    }
  },

  tenantSettingEnableNewClass: Ember.computed(function() {
    const controller = this;
    let tenantSettings = JSON.parse(
      controller.get('tenantService').getStoredTenantSetting()
    );
    if (
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      !isEmptyValue(
        tenantSettings.ui_element_visibility_settings.enable_create_class
      )
    ) {
      return !tenantSettings.ui_element_visibility_settings.enable_create_class;
    } else {
      return false;
    }
  }),

  questionEvidenceVisibility: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    if (tenantSettingsObj !== null && tenantSettingsObj !== undefined) {
      if (
        tenantSettingsObj &&
        tenantSettingsObj.ui_element_visibility_settings &&
        tenantSettingsObj.ui_element_visibility_settings
          .question_evidence_visibility
      ) {
        return (
          tenantSettingsObj &&
          tenantSettingsObj.ui_element_visibility_settings &&
          tenantSettingsObj.ui_element_visibility_settings
            .question_evidence_visibility
        );
      } else {
        return false;
      }
    }
  }),

  isHideLessonNumber: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    if (
      tenantSettingsObj &&
      tenantSettingsObj.ui_element_visibility_settings &&
      tenantSettingsObj.ui_element_visibility_settings
        .hide_course_map_view_content_label_seq === true
    ) {
      return tenantSettingsObj.ui_element_visibility_settings
        .hide_course_map_view_content_label_seq;
    } else {
      return false;
    }
  }),

  lessonLabelCourseMap: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    if (tenantSettingsObj !== null && tenantSettingsObj !== undefined) {
      if (
        tenantSettingsObj &&
        tenantSettingsObj.ui_element_visibility_settings &&
        tenantSettingsObj.ui_element_visibility_settings.lesson_label_course_map
      ) {
        return (
          tenantSettingsObj &&
          tenantSettingsObj.ui_element_visibility_settings &&
          tenantSettingsObj.ui_element_visibility_settings
            .lesson_label_course_map
        );
      }
    }
  }),

  showLearningTool: Ember.computed(function() {
    const toolLength = this.getToolLength();
    const tenant = this.get('tenantSettingsObj');
    const uiVisibility = tenant ? tenant.ui_element_visibility_settings : null;
    return uiVisibility && uiVisibility.show_learning_tools && toolLength;
  }),

  poChartyAxisLabel: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    if (tenantSettingsObj !== null && tenantSettingsObj !== undefined) {
      if (
        tenantSettingsObj &&
        tenantSettingsObj.ui_element_visibility_settings &&
        tenantSettingsObj.ui_element_visibility_settings.po_chart_y_axis_label
      ) {
        return (
          tenantSettingsObj &&
          tenantSettingsObj.ui_element_visibility_settings &&
          tenantSettingsObj.ui_element_visibility_settings.po_chart_y_axis_label
        );
      }
    }
  }),

  displayDomainLabel: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    if (tenantSettingsObj !== null && tenantSettingsObj !== undefined) {
      if (
        tenantSettingsObj &&
        tenantSettingsObj.ui_element_visibility_settings &&
        tenantSettingsObj.ui_element_visibility_settings.display_domain_label
      ) {
        return (
          tenantSettingsObj &&
          tenantSettingsObj.ui_element_visibility_settings &&
          tenantSettingsObj.ui_element_visibility_settings.display_domain_label
        );
      }
    }
  }),

  wpmKey: Ember.computed(function() {
    let tenantSetting = this.get('tenantSettingsObj');
    return tenantSetting &&
      tenantSetting.wpm_flag_config &&
      tenantSetting.wpm_flag_config.wpm_flag_config
      ? tenantSetting.wpm_flag_config.wpm_flag_config
      : DEFAULT_THRESHOLD_VALUE;
  }),

  isDefaultGrade: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return (
      tenantSetting &&
      tenantSetting.is_default_gradable_eval_result_correct &&
      tenantSetting.is_default_gradable_eval_result_correct === 'true'
    );
  }),

  isShowDescription: Ember.computed(function() {
    let tenantSetting = this.get('tenantSettingsObj');
    let isShowDefault =
      tenantSetting &&
      tenantSetting.ui_element_visibility_settings &&
      tenantSetting.ui_element_visibility_settings
        .show_study_player_left_panel_collection_desc === false
        ? tenantSetting.ui_element_visibility_settings
          .show_study_player_left_panel_collection_desc
        : true;
    return isShowDefault;
  }),

  isAtcViewDefaultProgressSelection: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');

    if (tenantSettingsObj !== null && tenantSettingsObj !== undefined) {
      if (
        tenantSettingsObj &&
        tenantSettingsObj.ui_element_visibility_settings &&
        tenantSettingsObj.ui_element_visibility_settings
          .atc_view_default_progress_selection
      ) {
        return (
          tenantSettingsObj &&
          tenantSettingsObj.ui_element_visibility_settings &&
          tenantSettingsObj.ui_element_visibility_settings
            .atc_view_default_progress_selection
        );
      }
    }
  }),

  showStudyPlayerLeftPanelOnInitialLoad: Ember.computed(function() {
    let tenantSettingsObj = this.get('tenantSettingsObj');
    if (tenantSettingsObj !== null && tenantSettingsObj !== undefined) {
      return tenantSettingsObj &&
        tenantSettingsObj.ui_element_visibility_settings &&
        tenantSettingsObj.ui_element_visibility_settings
          .show_study_player_left_panel_on_initial_load === false
        ? tenantSettingsObj.ui_element_visibility_settings
          .show_study_player_left_panel_on_initial_load
        : true;
    }
  }),

  isEnableCaBaseline: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    return tenantSetting &&
      tenantSetting.enable_ca_baseline_and_regular_workflow
      ? tenantSetting.enable_ca_baseline_and_regular_workflow
      : false;
  }),

  isPathRouteView: Ember.computed(function() {
    let tenantSetting = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );
    const uiElement =
      tenantSetting && tenantSetting.ui_element_visibility_settings;
    return !!(
      uiElement &&
      uiElement.default_lj_route_view &&
      uiElement.default_lj_route_view === 'path'
    );
  }),

  isKnowMoreAboutUserQuestions: Ember.computed(function() {
    let tenantSetting = this.get('tenantSettingsObj');
    let knowMoreAboutUserQuestions =
      tenantSetting &&
      tenantSetting.know_more_about_user_questions &&
      tenantSetting.know_more_about_user_questions.length;
    return knowMoreAboutUserQuestions;
  }),

  isEnableNavigatorPrograms: Ember.computed(function() {
    let tenantSetting = this.get('tenantSettingsObj');
    let enableNavigatorPrograms =
      tenantSetting &&
      tenantSetting.ui_element_visibility_settings &&
      tenantSetting.ui_element_visibility_settings.enable_navigator_programs;
    return enableNavigatorPrograms;
  }),

  isDefaultShowFW: Ember.computed(
    'tenantSettingsObj',
    'class',
    'currentClass',
    function() {
      let isDefaultShowFW = false;
      if (this.get('class') || this.get('currentClass')) {
        let classPreferenceSetting =
          this.get('class.preference') || this.get('currentClass.preference');
        let subject =
          classPreferenceSetting && classPreferenceSetting.get('subject');
        let fwk =
          classPreferenceSetting && classPreferenceSetting.get('framework');
        let tenantSetting = this.get('tenantSettingsObj');
        if (
          tenantSetting &&
          tenantSetting.default_show_fw_competency_proficiency_view &&
          tenantSetting.default_show_fw_competency_proficiency_view.length &&
          subject &&
          fwk
        ) {
          let classPreference = subject.concat('.', fwk);
          isDefaultShowFW =
            tenantSetting.default_show_fw_competency_proficiency_view.indexOf(
              classPreference
            ) !== -1;
        }
      }
      return isDefaultShowFW;
    }
  ),

  setToolLength(userId, toolList) {
    const showToolIcon = toolList && toolList.length > 0;
    window.localStorage.setItem(
      userId.concat('_showToolIcon'),
      JSON.stringify(showToolIcon)
    );
  },

  getToolLength() {
    let currntUser = this.get('session');
    let userId = currntUser.get('userId');
    const settings = JSON.parse(
      window.localStorage.getItem(userId.concat('_showToolIcon'))
    );
    return settings;
  }
});
