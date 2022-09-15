import Ember from 'ember';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(
  StudentLearnerProficiency,
  tenantSettingsMixin,
  {
    // --------------------------------------------------------------------
    // Attributes
    classNames: ['gru-milestone-student-proficiency'],

    /**
     * Inject the  student class parent controller.
     */
    currentClass: null,

    /**
     * @property {Array} fwCompetencies
     */
    fwCompetencies: Ember.A(),

    /**
     * @property {Array} fwDomains
     */
    fwDomains: Ember.A(),

    /**
     * A link to the parent class controller
     * @see controllers/class.js
     * @property {studentTimespentData}
     */
    studentTimespentData: Ember.A(),

    /**
     * @property {Boolean}
     */
    isPublicClass: false,

    course: null,

    isShowProficiency: false,

    // ----------------------------------------------------------------------------
    // Hooks

    didInsertElement() {
      this.loadData();
    },

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
      },
      onChangeToBack() {
        this.set('isShowProficiency', false);
      }
    },

    // ------------------------------------------------------------------
    // Methods

    changeLanguage() {
      const controller = this;
      let classes = controller.get('class');
      controller.changeLanguages(classes);
    }
  }
);
