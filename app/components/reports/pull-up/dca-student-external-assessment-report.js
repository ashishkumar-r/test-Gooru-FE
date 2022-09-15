import Ember from 'ember';
import { getBarGradeColor } from 'gooru-web/utils/utils';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import Context from 'gooru-web/models/result/context';

export default Ember.Component.extend({
  classNames: [
    'reports',
    'backdrop-pull-ups',
    'dca-student-external-assessment-report'
  ],

  /**
   * @requires {Ember.Service} session management
   */
  session: Ember.inject.service('session'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @requires {AssessmentService} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicates the status of the spinner
   * @property {Boolean}
   */
  isLoading: false,

  showPullUp: false,

  /**
   * calculate  the class average by student performance score as a width
   * @property {string}
   */
  studentAverage: Ember.computed('performanceScore', function() {
    let component = this;
    let score = component.get('performanceScore');
    return Ember.String.htmlSafe(`width: ${score}%;`);
  }),

  /**
   * @property {String} barColor
   * Computed property to know the color of the small bar
   */
  performanceColorStyle: Ember.computed('performanceScore', function() {
    let component = this;
    let score = component.get('performanceScore');
    component.set('performanceColor', getBarGradeColor(score));
    return Ember.String.htmlSafe(
      `background-color: ${getBarGradeColor(score)};`
    );
  }),

  externalAssessment: Ember.computed('reportData', function() {
    let component = this;
    let reportData = component.get('reportData');
    return reportData.collection;
  }),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('externalAssessmentContent.standards.[]', function() {
    let component = this;
    let standards = component.get('externalAssessmentContent.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * @property {Number} performanceScore
   */
  performanceScore: Ember.computed('reportData', function() {
    let component = this;
    let reportData = component.get('reportData');
    return reportData.studentPerformance
      ? reportData.studentPerformance.score
      : reportData.collection.get('performance.score');
  }),

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },
  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.openPullUp();
    this.loadExternalAssessmentReportData();
  },

  actions: {
    closeAll() {
      this.sendAction('onClosePullUp', true);
    },

    onPullUpClose() {
      this.closePullUp();
    },

    onClosePullUp() {
      let component = this;
      component.closePullUp(true);
    }
  },

  //--------------------------------------------------------------------------
  // Methods

  /**
   * Function to animate the  pullup from bottom to top
   */
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
    component.$().animate({
      top: '100%'
    },
    400,
    function() {
      component.set('showPullUp', false);
      if (closeAll) {
        component.sendAction('onClosePullUp', true);
      }
    });
  },
  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },
  loadExternalAssessmentReportData() {
    let component = this;
    let context = component.get('reportData');
    let profilePromise = new Ember.RSVP.resolve(
      component.get('profileService').readUserProfile(context.userId)
    );
    let assessmentContentPromise = new Ember.RSVP.resolve(
      component
        .get('assessmentService')
        .readExternalAssessment(context.collectionId)
    );
    return Ember.RSVP
      .hash({
        profile: profilePromise,
        externalAssessment: assessmentContentPromise
      })
      .then(function(hash) {
        component.set('profile', hash.profile);
        component.set('externalAssessmentContent', hash.externalAssessment);
      });
  },

  /**
   * Get the player context
   * @param params
   * @returns {Context}
   */
  getContext: function(params) {
    let userId = params.userId;
    const collectionId = params.collectionId;

    return Context.create({
      collectionType: params.type,
      userId: userId,
      collectionId: collectionId,
      classId: params.classId
    });
  }
});
