import Ember from 'ember';
import AccordionMixin from '../../../mixins/gru-accordion';
import { CONTENT_TYPES } from 'gooru-web/config/config';
export default Ember.Component.extend(AccordionMixin, {
  classNames: ['gru-accordion', 'gru-accordion-course', 'course-suggestions'],
  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  actions: {
    routeAction: function(actiontype) {
      this.attrs.routeSuggestAction(actiontype);
    },
    /**
     * @function studyNow
     * @param {string} type - collection or assessment
     * @param {string} lessonId - lesson id
     * @param {string} unitId - lesson id
     * @param {string} item - collection, assessment, lesson or resource
     * @see components/class/overview/gru-accordion-lesson
     */
    studyNow: function(type, unitId, lessonId, item) {
      this.sendAction('onStudyNow', type, unitId, lessonId, item);
    },
    selectResource: function(unitId, lessonId, collection) {
      // Send the action so that it bubbles up to the route
      this.sendAction('onSelectResource', unitId, lessonId, collection);
    },
    /**
     * Trigger the 'onLocationUpdate' event handler
     *
     * @function actions:updateLocation
     * @param {string} newLocation - String of the form 'unitId[+lessonId[+resourceId]]'
     */
    updateLocation: function(newLocation) {
      if (this.get('onLocationUpdate')) {
        this.get('onLocationUpdate')(newLocation);
      }
    }
  },
  //action object ends

  /**
   * @prop {String} currentResource - Id of the resource in 'userLocation'
   * This value is not expected to change while on the page so it is put into its own
   * property and sent down to the child accordions. This way, each child accordion is
   * not responsible for extracting the value from 'userLocation'.
   */
  currentResource: Ember.computed('userLocation', 'location', function() {
    const userLocation = this.get('userLocation');
    if (!userLocation) {
      return;
    }

    var parsedLocation = userLocation.split('+');
    var currentResource = null;

    if (parsedLocation.length === 3) {
      currentResource = parsedLocation[2];
    } else {
      Ember.Logger.warn(
        'The user location does not specify a current resource'
      );
    }
    return currentResource;
  }),

  /**
   * @prop {String[]} parsedLocation - Location the user has navigated to
   * parsedLocation[0] - unitId
   * parsedLocation[1] - lessonId
   * parsedLocation[2] - resourceId
   */
  parsedLocation: Ember.computed('userLocation', function() {
    return this.get('userLocation') ? this.get('userLocation').split('+') : [];
  }),

  /**
   * Computed Property to extract framework code from settings
   * @return {String}
   */
  fwCode: Ember.computed('class', function() {
    let preference = this.get('class.preference');
    return preference != null ? preference.get('framework') : null;
  }),

  didInsertElement() {
    const component = this;
    component.performanceDataByUnit();
  },

  performanceDataByUnit() {
    const component = this;
    let performanceService = component.get('performanceService');
    let userId =
      component.get('session.role') === 'student'
        ? component.get('session.userId')
        : component.get('studentId');
    let classId = component.get('class').id;
    let courseId = component.get('course').id;
    let fwCode = component.get('fwCode');
    let units = component.getUnits();
    Ember.RSVP.hash({
      unitsPerformanceScore: performanceService.getPerformanceForMilestoneUnits(
        classId,
        courseId,
        CONTENT_TYPES.ASSESSMENT,
        userId,
        fwCode
      ),
      unitsPerformanceTimeSpent: performanceService.getPerformanceForMilestoneUnits(
        classId,
        courseId,
        CONTENT_TYPES.COLLECTION,
        userId,
        fwCode
      )
    }).then(({ unitsPerformanceScore, unitsPerformanceTimeSpent }) => {
      units.map(unit => {
        let unitPerformanceData = Ember.Object.create({
          hasStarted: false,
          completedCount: 0,
          totalCount: 0,
          completedInPrecentage: 0,
          scoreInPercentage: null,
          timeSpent: null
        });
        let milestonePerformance = unitsPerformanceScore.findBy(
          'unitId',
          unit.get('unitId')
        );
        if (!milestonePerformance) {
          milestonePerformance = unitsPerformanceTimeSpent.findBy(
            'unitId',
            unit.get('unitId')
          );
          unitPerformanceData.set('isCollection', true);
        }
        if (milestonePerformance) {
          milestonePerformance = milestonePerformance.get('performance');
          unitPerformanceData.set(
            'score',
            milestonePerformance.get('scoreInPercentage')
          );
          unitPerformanceData.set(
            'timeSpent',
            milestonePerformance.get('timeSpent')
          );
          unitPerformanceData.set(
            'completedInPrecentage',
            milestonePerformance.get('completedInPrecentage')
          );
          unitPerformanceData.set(
            'completedCount',
            milestonePerformance.get('completedCount')
          );
          unitPerformanceData.set(
            'totalCount',
            milestonePerformance.get('totalCount')
          );
          unitPerformanceData.set(
            'completionTotal',
            milestonePerformance.get('totalCount')
          );
          unitPerformanceData.set(
            'hasStarted',
            milestonePerformance.get('scoreInPercentage') !== null &&
              milestonePerformance.get('scoreInPercentage') >= 0
          );
          unit.set('performance', unitPerformanceData);
        }
      });
    });
    component.set('units', units);
  },

  getUnits() {
    let unitsArray = Ember.A([]);
    this.get('model.milestones').map(milestone => {
      milestone.units.map(unit => {
        unit.milestoneId = milestone.get('milestone_id');
        unitsArray.push(unit);
      });
    });
    return unitsArray;
  },

  performanceData() {
    /* // didReceiveAttrs() { const component = this; component.performanceData(); },
     Move function outside of perfomance data to enable the lesson level performance number
    and make suitable corrections  */
    const component = this;
    const userId = component.get('session.userId');
    var options = {};
    options.classId = component.get('class').id;
    options.courseId = component.get('course').id;
    options.units = this.get('model.route0Content.units');
    options.unitId = options.units[0].unitId;
    options.unitLessons = component.getLessons(options.units[0]);

    component
      .get('performanceService')
      .findStudentPerformanceByUnit(
        userId,
        options.classId,
        options.courseId,
        options.unitId,
        options.unitLessons
      )
      .then(performance => {
        //st
        options.unitLessons.forEach(lesson => {
          if (performance) {
            let lessonPerformance;
            if (options.classId) {
              lessonPerformance = performance.findBy('id', lesson.get('id'));
            } else {
              lessonPerformance = performance.findBy(
                'lessonId',
                lesson.get('id')
              );
              if (lessonPerformance) {
                const score = lessonPerformance.get('scoreInPercentage');
                const timeSpent = lessonPerformance.get('timeSpent');
                const completionDone = lessonPerformance.get('completedCount');
                const completionTotal = lessonPerformance.get('totalCount');
                const hasStarted = score > 0 || timeSpent > 0;
                const isCompleted =
                  completionDone > 0 && completionDone >= completionTotal;
                lessonPerformance.set('hasStarted', hasStarted);
                lessonPerformance.set('isCompleted', isCompleted);
                lessonPerformance.set('completionDone', completionDone);
                lessonPerformance.set('completionTotal', completionTotal);
              }
            }
            lesson.set('performance', lessonPerformance);
          }
        });
        //end
      });
  },
  getLessons(unit) {
    return unit.lessons.map(lesson => {
      let retjson = {
        id: lesson.lessonId,
        title: lesson.lessonTitle
      };
      return Ember.Object.create(retjson);
    });
  }
});
