import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { roundFloat } from 'gooru-web/utils/math';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-question-report'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    reportClose() {
      let component = this;
      component.$().animate(
        {
          top: '100%'
        },
        400,
        function() {
          component.set('showPullUp', false);
        }
      );
    }
  },

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
    this.initialize();
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains context data
   * @type {Object}
   */
  context: null,

  /**
   * ClassId belongs to this collection report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * CourseId belongs to this collection report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Unit belongs to this collection report.
   * @type {String}
   */
  unit: Ember.computed.alias('context.unit'),

  /**
   * Lesson belongs to this question report.
   * @type {[type]}
   */
  lesson: Ember.computed.alias('context.lesson'),

  /**
   * Collection belongs to this question report.
   * @type {Object}
   */
  collection: Ember.computed.alias('context.collection'),

  /**
   * collectionId of this  question report.
   * @type {String}
   */
  collectionId: Ember.computed.alias('context.collection.id'),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  initialize: function() {
    const component = this;
    let resultArray = [];
    let scalePoints = component.get('scalePoint.questionScalePoints');
    resultArray.scalePoints = scalePoints;
    scalePoints.map(dataSet => {
      let userLength = dataSet.userInfo.length;
      let userPercentage = roundFloat(
        (userLength / component.get('classMembers').length) * 100
      );
      dataSet.set('userPercentage', userPercentage);
    });
    component.set('userScalePoints', scalePoints);
  },

  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  }
});
