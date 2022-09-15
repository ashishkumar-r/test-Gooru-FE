import Ember from 'ember';

export default Ember.Route.extend({
  // --------------------------------------------------------
  // Dependencies
  reportService: Ember.inject.service('api-sdk/report'),

  // -----------------------------------------------------------------
  // Hooks
  model() {
    let route = this;
    let currentClass = route.modelFor('teacher.class').class;
    return Ember.RSVP.hash({
      getStudentSelReport: route
        .get('reportService')
        .fetchStudentSelReport(currentClass.get('id')),
      currentClass
    });
  },

  setupController(controller, model) {
    controller.set('currentClass', model.currentClass);
    controller.set('studentSelReport', model.getStudentSelReport);
    controller.set(
      'rangeStartDate',
      moment()
        .startOf('month')
        .format('YYYY-MM-DD')
    );
    controller.set(
      'rangeEndDate',
      moment()
        .endOf('month')
        .format('YYYY-MM-DD')
    );
    controller.set('forMonth', moment().format('MM'));
    controller.set('forYear', moment().format('YYYY'));
    controller.set('isDaily', false);
    controller.set('isMonthly', true);
    controller.loadSelReportChart(model.getStudentSelReport);
  }
});
