import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['ca-student-list-suggestion'],

  /**
   * @requires service:api-sdk/profile
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  suggestedToContext: Ember.computed.alias('suggestion.suggestedToContext'),

  actions: {
    onPullUpClose() {
      const component = this;
      component.closePullUp();
    },

    openPerformanceReport(student) {
      const component = this;
      const suggestion = component.get('suggestion');
      let params = {
        userId: student.get('userId'),
        classId: component.get('classId'),
        collectionId: suggestion.get('suggestedContentId'),
        type: suggestion.get('suggestedContentType'),
        isStudent: false,
        collection: suggestion,
        studentPerformance: student.get('performance')
      };
      component.set('studentReportContextData', params);
      component.set('showStudentDcaReport', true);
    },

    onClosePullUp() {
      const component = this;
      component.set('showStudentDcaReport', false);
    }
  },

  init() {
    const component = this;
    component._super(...arguments);
    component.fetchStudentProfiles();
  },

  //--------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.openPullUp();
  },

  //--------------------------------------------------------------------------
  // Methods
  fetchStudentProfiles() {
    const component = this;
    const profileIds = component
      .get('suggestedToContext')
      .map(context => context.get('userId'));
    component
      .get('profileService')
      .readMultipleProfiles(profileIds)
      .then(function(profiles) {
        component.get('suggestedToContext').map(context => {
          const profile = profiles.findBy('id', context.get('userId'));
          context.set('profile', profile);
        });
      });
  },

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

  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.sendAction('onClosePullUp');
      }
    );
  }
});
