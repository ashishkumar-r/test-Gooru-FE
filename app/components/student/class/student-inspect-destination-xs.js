import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-inspect-destination-xs'],

  classNameBindings: ['type', 'isPublic:public-class'],

  session: Ember.inject.service('session'),

  /**
   * @property {Boolean} isAllContentsAreRescoped
   */
  isAllContentsAreRescoped: false,

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  actions: {
    onClosePullUp() {
      let component = this;
      component.closePullUp();
      component.set('isLocationUpdate', false);
      component.set('showInfo', false);
      component.set('showLocationInfo', false);
    },

    onOpenPullUp() {
      let component = this;
      component.openPullUp();
    },

    takeDiagnostic() {
      this.sendAction('takeDiagnostic');
    },
    changesMyLevel() {
      this.set('isMathGradeChange', !this.get('isMathGradeChange'));
    },

    updateLocation(show) {
      this.openPullUp();
      let component = this;
      component.set('isLocationUpdate', show);
      component.set('isMathGradeChange', false);
    },

    updateMathLevel(grage) {
      this.set('isMathGradeChange', false);
      this.set('isNextEnable', true);
      this.set('studentMathGrade', grage);
      this.set('isShowLoader', true);
      this.sendAction('updateMathLevel', grage);
    },

    /**
     * Action triggered when move to next screen
     */
    onMoveNext(curStep) {
      this.openPullUp();
      let component = this;
      component.sendAction('onMoveNext', curStep);
    },

    /**
     * Action triggered when toggle route0 course-map view expanded/collapsed
     */
    onToggleRoute0View() {
      let component = this;
      component.sendAction('onToggleRoute0View');
    },

    /**
     * Action triggered when accept route0 suggestion
     */
    onRoute0Accept() {
      let component = this;
      component.sendAction('onRoute0Accept');
    },

    /**
     * Action triggered when reject route0 suggestion
     */
    onRoute0Reject() {
      let component = this;
      component.sendAction('onRoute0Reject');
    },

    //Action triggered in init for check all the milestone contents are rescoped
    checkAllContentsAreRescoped(milestoneData) {
      const milestones = milestoneData;
      const rescopeMilestone = milestones.filterBy('rescope', true);
      let isAllContentsAreRescoped =
        milestones.length === rescopeMilestone.length;
      this.set('isAllContentsAreRescoped', isAllContentsAreRescoped);
    }
  },

  openPullUp() {
    let component = this;
    if (!component.get('isExpanded')) {
      component.$().animate(
        {
          top: '10%'
        },
        400,
        function() {
          component.set('isExpanded', true);
        }
      );
    }
  },

  closePullUp() {
    let component = this;
    if (component.get('isExpanded')) {
      component.$().animate(
        {
          top: '90%'
        },
        400,
        function() {
          if (component.get('isPublic')) {
            component.$().css('top', 'calc(100% - 160px)');
          } else {
            component.$().css('top', 'calc(100% - 140px)');
          }
          component.set('isExpanded', false);
        }
      );
    }
  },

  didInsertElement() {
    if (this.type === 'route') {
      this.openPullUp();
    }
    this.$('.route-item, .location-item').popover('destroy');
    this.$('.route-item, .location-item').off('click');
    this.setupTooltip('route-item', 'show-route-description');
    this.setupTooltip('location-item', 'show-location-description');
    if (this.get('defaultGradeLevel')) {
      this.send('updateLocation', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Boolean} isExpanded
   */
  isExpanded: false,

  taxonomyGrades: null,

  /**
   * @property {JSON} activeGrade
   */
  grade: null,
  /**
   * @type {Boolean}
   */
  isMathGradeChange: false,

  showInfo: false,

  showLocationInfo: false,

  isShowLoader: false,

  /**
   * The class is premium
   * @property {String}
   */
  isPremiumClass: Ember.computed('class', function() {
    const controller = this;
    let currentClass = controller.get('class');
    let classSetting = currentClass.get('setting');
    return classSetting ? classSetting['course.premium'] : false;
  }),
  /**
   * @property {Boolean} isPublicClass
   */
  isPublic: Ember.computed.alias('class.isPublic'),

  /**
   * @property {Boolean} isJoinedPublicClass
   */
  isJoinedPublicClass: Ember.computed('isPublic', 'class', function() {
    let isPublic = this.get('isPublic');
    let userId = this.get('session.userId');
    let gradeBounds = this.get('class.memberGradeBounds');
    let gradeBound = gradeBounds.findBy(userId);
    let studentGradeBound = Ember.Object.create(gradeBound.get(userId));
    return (
      isPublic &&
      studentGradeBound.get('grade_lower_bound') &&
      studentGradeBound.get('grade_upper_bound')
    );
  }),

  /**
   * @property {JSON} studentMathGrade
   */
  studentMathGrade: Ember.computed(
    'currentCourseBounds',
    'taxonomyGrades',
    function() {
      let taxonomyGrades = this.get('taxonomyGrades');
      let studentGradeMath = null;
      if (this.get('isPublic') && this.get('isPremiumClass')) {
        let gradeLowerBound = this.get('currentCourseBounds.gradeLowerBound');
        studentGradeMath = taxonomyGrades.findBy('id', gradeLowerBound);
      }
      return studentGradeMath;
    }
  ),

  /**
   * @property {Object} currentCourseBounds
   */
  currentCourseBounds: Ember.computed(
    'isPublic',
    'independentCourses',
    function() {
      let courseBounds = null;
      let independentCourses = this.get('independentCourses');
      if (this.get('isPublic') && this.get('isPremiumClass')) {
        let currentCourse = independentCourses.findBy(
          'id',
          this.get('courseId')
        );
        let courseSettings = currentCourse.get('settings');
        courseBounds = Ember.Object.create({
          gradeCurrent: courseSettings.get('gradeCurrent'),
          gradeLowerBound: courseSettings.get('gradeLowerBound'),
          gradeUpperBound: courseSettings.get('gradeUpperBound')
        });
      }
      return courseBounds;
    }
  ),

  isDiagnosticApplicable: Ember.computed(
    'isPublic',
    'independentCourses',
    function() {
      let diagnosticApplicable = false;
      let independentCourses = this.get('independentCourses');
      if (this.get('isPublic') && this.get('isPremiumClass')) {
        let currentCourse = independentCourses.findBy(
          'id',
          this.get('courseId')
        );
        let courseSettings = currentCourse.get('settings');
        diagnosticApplicable = courseSettings.get('isDiagnosticApplicable');
      }
      return diagnosticApplicable;
    }
  ),
  /**
   * @property {Array} mathLevelGrades
   */
  mathLevelGrades: Ember.computed('currentCourseBounds', function() {
    let mathLevelGrades = Ember.A([]);
    if (this.get('isPublic') && this.get('isPremiumClass')) {
      let currentCourseBounds = this.get('currentCourseBounds');
      let taxonomyGrades = this.get('taxonomyGrades').sortBy('sequence');
      let gradeCurrent = currentCourseBounds.get('gradeCurrent');
      let startGrade = taxonomyGrades.get('firstObject');
      let startGradeIndex = taxonomyGrades.indexOf(startGrade);
      let endGrade = taxonomyGrades.findBy('id', gradeCurrent);
      let endGradeIndex = taxonomyGrades.indexOf(endGrade);
      mathLevelGrades = taxonomyGrades.slice(
        startGradeIndex,
        endGradeIndex + 1
      );
    }
    return mathLevelGrades;
  }),

  setupTooltip: function(tooltipDiv, descriptionDiv) {
    var component = this;
    var $anchor = this.$(`.${tooltipDiv}`);
    $anchor.attr('data-html', 'true');
    $anchor.popover({
      placement: 'top',
      content: function() {
        return component.$(`.${descriptionDiv}`).html();
      },
      trigger: 'manual',
      container: 'body'
    });

    $anchor.on('click', function() {
      var $this = $(this);
      if (!$this.hasClass('list-open')) {
        // Close all tag tooltips by simulating a click on them
        $(`.${tooltipDiv}.list-open`).click();
        $this.addClass('list-open').popover('show');
      } else {
        $this.removeClass('list-open').popover('hide');
      }
    });
  }
});
