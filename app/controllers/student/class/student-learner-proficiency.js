import Ember from 'ember';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import Language from 'gooru-web/mixins/language';

export default Ember.Controller.extend(
  StudentLearnerProficiency,
  TenantSettingsMixin,
  Language,
  {
    /**
     * Inject the  student class parent controller.
     */
    studentClassController: Ember.inject.controller('student.class'),

    /**
     * @property {Array} fwCompetencies
     */
    fwCompetencies: Ember.computed.alias(
      'studentClassController.fwCompetencies'
    ),

    /**
     * @property {Array} fwDomains
     */
    fwDomains: Ember.computed.alias('studentClassController.fwDomains'),

    /**
     * A link to the parent class controller
     * @see controllers/class.js
     * @property {studentTimespentData}
     */
    studentTimespentData: Ember.computed.alias(
      'studentClassController.studentTimespentData'
    ),

    /**
     * @property {Boolean}
     */
    isPublicClass: Ember.computed.alias('class.isPublic'),

    getTenantFWs: Ember.observer('activeSubject', function() {
      let tenantSetting = this.get('tenantSettingsObj');
      if (
        tenantSetting &&
        tenantSetting.tx_fw_prefs &&
        this.get('isPublicClass') &&
        this.get('isEnableNavigatorPrograms')
      ) {
        let activeSubject = this.get('activeSubject');
        let isFound = tenantSetting.tx_fw_prefs[activeSubject.id];
        let tenantFW = isFound ? isFound.default_fw_id : null;
        this.set('tenantFW', tenantFW);
      }
    }),

    classFramework: Ember.computed.alias(
      'studentClassController.classFramework'
    ),

    isDefaultShowFW: Ember.computed.alias(
      'studentClassController.isDefaultShowFW'
    ),

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      closePullUp() {
        const component = this;
        component.set('isOpenPlayer', false);
      },

      playContent(queryParams, contentId, content) {
        const component = this;
        component.set(
          'playerUrl',
          component.target
            .get('router')
            .generate('player', contentId, { queryParams })
        );
        component.set('isOpenPlayer', true);
        component.set('playerContent', content);
      }
    },

    changeLanguage() {
      const controller = this;
      let classes = controller.get('class');
      controller.changeLanguages(classes);
    }
  }
);
