import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
/**
 * Service for the Tour steps
 *
 * @typedef {Object} Tour steps Service
 */
export default Ember.Service.extend(UIHelperMixin, TenantSettingsMixin, {
  i18n: Ember.inject.service(),
  /**
   * Returns the Assessment Settings tour object
   *
   * @returns {Ember.A}
   */
  getAssessmentSettingsTourSteps: function() {
    const service = this;
    return new Ember.A([
      {
        elementSelector:
          '.assessments.edit .gru-settings-edit .nav-score-settings h3 span',
        title: service
          .get('i18n')
          .t('gru-tour.assessments-settings.stepOne.title'),
        description: service
          .get('i18n')
          .t('gru-tour.assessments-settings.stepOne.description')
      },
      {
        elementSelector:
          '.assessments.edit .gru-settings-edit .key-attempts-settings h3 span',
        title: service
          .get('i18n')
          .t('gru-tour.assessments-settings.stepTwo.title'),
        description: service
          .get('i18n')
          .t('gru-tour.assessments-settings.stepTwo.description')
      }
    ]);
  },
  /**
   * Returns the Assessment Settings tour object
   *
   * @returns {Ember.A}
   */
  getRealTimeTourSteps: function() {
    const service = this;
    return new Ember.A([
      {
        elementSelector:
          '.gru-class-assessment-report .gru-questions-summary ol',
        title: service.get('i18n').t('gru-tour.real-time.stepOne.title'),
        description: service
          .get('i18n')
          .t('gru-tour.real-time.stepOne.description')
      },
      {
        title: service.get('i18n').t('gru-tour.real-time.stepTwo.title'),
        description: service
          .get('i18n')
          .t('gru-tour.real-time.stepTwo.description'),
        image: 'real-time-tour-image'
      },
      {
        elementSelector: '.gru-class-assessment-report .gru-view-layout-picker',
        title: service.get('i18n').t('gru-tour.real-time.stepThree.title'),
        description: service
          .get('i18n')
          .t('gru-tour.real-time.stepThree.description')
      },
      {
        elementSelector:
          '.gru-class-assessment-report .overview .average-score',
        title: service.get('i18n').t('gru-tour.real-time.stepFour.title'),
        description: service
          .get('i18n')
          .t('gru-tour.real-time.stepFour.description')
      },
      {
        elementSelector: '.controller.reports .header .actions .anonymous',
        title: service.get('i18n').t('gru-tour.real-time.stepFive.title'),
        description: service
          .get('i18n')
          .t('gru-tour.real-time.stepFive.description')
      }
    ]);
  },
  /**
   * Returns the Assessment Settings tour object
   *
   * @returns {Ember.A}
   */
  getStudentHomePageTourSteps: function() {
    const service = this;
    let elementRender = this.checkElementRender(
      '.student-content-panel .student-class-active-list #secondorder .gru-student-class-current-card'
    );
    let isEnableNavigatorPrograms = service.get('isEnableNavigatorPrograms');

    if (isEnableNavigatorPrograms) {
      return new Ember.A([
        {
          elementSelector: 'body.student-landing .student-content-panel',
          title: service.get('i18n').t('gru-tour.student-home.stepOne.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepOne.description')
        },
        {
          elementSelector:
            '.student-content-panel .student-navigator .nav-tabs li #nav-classroom-tab',
          title: service.get('i18n').t('gru-tour.student-home.stepTwo.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepTwo.description')
        },
        {
          elementSelector:
            '.student-content-panel .student-class-active-list #secondorder .gru-student-class-current-card',
          title: service.get('i18n').t('gru-tour.student-home.stepThree.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepThree.description'),
          image: !elementRender ? 'demo-image' : ''
        },
        {
          elementSelector:
            '.student-content-panel .student-navigator .nav-tabs li #nav-navigator-tab',
          title: service
            .get('i18n')
            .t('gru-tour.student-home.stepFive.my.navigator.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepFive.my.navigator.description')
        }
      ]);
    } else {
      return new Ember.A([
        {
          elementSelector: 'body.student-landing .student-content-panel',
          title: service.get('i18n').t('gru-tour.student-home.stepOne.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepOne.description')
        },
        {
          elementSelector:
            '.student-content-panel .student-navigator .nav-tabs li #nav-classroom-tab',
          title: service.get('i18n').t('gru-tour.student-home.stepTwo.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepTwo.description')
        },
        {
          elementSelector:
            '.student-content-panel .student-class-active-list #secondorder .gru-student-class-current-card',
          title: service.get('i18n').t('gru-tour.student-home.stepThree.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepThree.description'),
          image: !elementRender ? 'demo-image' : ''
        },
        {
          elementSelector:
            '.student-content-panel .student-class-active-list #firstorder .class-join-card-panel',
          title: service.get('i18n').t('gru-tour.student-home.stepFour.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepFour.description')
        },
        {
          elementSelector:
            '.student-content-panel .student-navigator .nav-tabs li #nav-independent-tab',
          title: service.get('i18n').t('gru-tour.student-home.stepFive.title'),
          description: service
            .get('i18n')
            .t('gru-tour.student-home.stepFive.description')
        }
      ]);
    }
  },

  getStudentHomePageIndependentTourSteps: function() {
    const service = this;
    return new Ember.A([
      {
        elementSelector:
          '.student-independent-study .student-independent-panel-list .class-current-status .title',
        title: service.get('i18n').t('gru-tour.student-home.stepSix.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.stepSix.description')
      },
      {
        elementSelector:
          '.student-independent-study .current-class-list-panel .gru-student-featured-card-container .featured-card-panel',
        title: service.get('i18n').t('gru-tour.student-home.stepSeven.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.stepSeven.description')
      }
    ]);
  },

  getStudentHomePageMyNavigatorSteps: function() {
    const service = this;
    return new Ember.A([
      {
        elementSelector:
          '.student-navigator-study .jump-start-container .jump-start-panel-cards .jump-start-course-container-panel .program-course-list-panel .navigator-class-cards .cards-section .card-layout',
        title: service
          .get('i18n')
          .t('gru-tour.student-home.jump.start.card.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.jump.start.card.description')
      }
    ]);
  },

  getStudentHomePageMyNavigatorCurrentlyStudyingSteps: function() {
    const service = this;
    return new Ember.A([
      {
        elementSelector:
          '.jump-start-cards .current-class-list-panel .navigator-class-cards .cards-section .card-layout',
        title: service
          .get('i18n')
          .t('gru-tour.student-home.jump.start.currently.studying.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.jump.start.currently.studying.description')
      }
    ]);
  },

  getStudentHomePageTourNoIndependentTabSteps: function() {
    const service = this;
    let elementRender = this.checkElementRender(
      '.student-content-panel .student-class-active-list #secondorder .gru-student-class-current-card'
    );

    return new Ember.A([
      {
        elementSelector: 'body.student-landing .student-content-panel',
        title: service.get('i18n').t('gru-tour.student-home.stepOne.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.stepOne.description')
      },
      {
        elementSelector:
          '.student-content-panel .student-navigator .nav-tabs li #nav-classroom-tab',
        title: service.get('i18n').t('gru-tour.student-home.stepTwo.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.stepTwo.description')
      },
      {
        elementSelector:
          '.student-content-panel .student-class-active-list #secondorder .gru-student-class-current-card',
        title: service.get('i18n').t('gru-tour.student-home.stepThree.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.stepThree.description'),
        image: !elementRender ? 'demo-image' : ''
      },
      {
        elementSelector:
          '.student-content-panel .student-class-active-list #firstorder .class-join-card-panel',
        title: service.get('i18n').t('gru-tour.student-home.stepFour.title'),
        description: service
          .get('i18n')
          .t('gru-tour.student-home.stepFour.description')
      }
    ]);
  }
});
