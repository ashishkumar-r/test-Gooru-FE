import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  queryParams: {
    activeReport: {
      refreshModel: true
    }
  },

  // Actions
  actions: {
    willTransition() {
      const viewport = Ember.$('head meta[name="viewport"]');
      viewport.attr(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=12, user-scalable=1'
      );
    },
    didTransition() {
      const viewport = Ember.$('head meta[name="viewport"]');
      viewport.attr(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      );
      // Load crosswalk framework for given class subject and framework
      this.get('controller')
        .get('classController')
        .loadCrosswalkFramework();
    }
  },

  setupController(controller, model) {
    controller.get('classController').selectMenuItem('atc');
    controller.set('classController.isShowExpandedNav', true);
    if (model.activeReport) {
      controller.set('isReportView', true);
      controller.set('isMilestoneReport', model.activeReport === 'milestone');
      let router = this.get('router');
      router.replaceWith(
        router.generate('teacher.class.atc', controller.get('classId'))
      );
    }
    controller.changeLanguage();
  },

  resetController(controller) {
    controller.set('activeMonth', moment().format('MM'));
    controller.set('selectedSecondary', null);
    controller.set('activeYear', moment().format('YYYY'));
    controller.set('isReportView', false);
  },

  model: function(params) {
    const currentClass = this.modelFor('teacher.class').class;
    this.setTitle('Performance Overview', currentClass.title);
    return params;
  }
});
