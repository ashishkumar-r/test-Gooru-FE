import Ember from 'ember';
import { SEARCH_FILTER_BY_CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['pull-up', 'competency-completion-report'],

  // -------------------------------------------------------------------------
  // Dependencies
  competencyService: Ember.inject.service('api-sdk/competency'),

  searchService: Ember.inject.service('api-sdk/search'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    this.openPullUp();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when select a competency
    onSelectCompetency(competencyData) {
      const component = this;
      let domainData = component.get('domainData');
      if (!competencyData.get('usersCompletionSummary')) {
        component.set('isLoading', true);
        component
          .fetchUsersCompetencyPerformanceSummary(
            domainData.domainCode,
            competencyData.competencyCode
          )
          .then(function(usersCompletionSummary) {
            competencyData.set(
              'usersCompletionSummary',
              component
                .selectAllStudents(usersCompletionSummary)
                .sortBy('status')
            );
            component.set('isLoading', false);
          });
        component.getSuggestionCount(competencyData);
      }
      component.toggleCompetencyContainer(competencyData);
      if (
        competencyData.get('isExpanded') ||
        component.get('activeCompetency.competencyCode') !==
          competencyData.get('competencyCode')
      ) {
        component.selectAllStudents(
          competencyData.get('usersCompletionSummary')
        );
      }
      component.set('activeCompetency', competencyData);
    },

    //Action triggered when close pullup
    onClosePullup() {
      const component = this;
      component.closePullUp();
    },

    //Action triggered when click on competency suggestion
    onSuggestAtCompetency(competency) {
      const component = this;
      if (
        component.get('activeCompetency.competencyCode') !==
        competency.get('competencyCode')
      ) {
        component.resetSelectedUserIds();
      }
      component.sendAction('onSuggestAtCompetency', competency);
    },

    //Action triggered when filter by content type
    onSuggestAtStudents(contentType) {
      const component = this;
      let activeCompetency = component.get('activeCompetency');
      let userIds = component.get('selectedUserIds');
      component.sendAction(
        'onSuggestAtCompetency',
        activeCompetency,
        contentType,
        userIds
      );
    },

    //Action triggered when select/unselect a student
    onSelectStudent(userCompletionData) {
      const component = this;
      let selectedUserIds = component.get('selectedUserIds');
      if (userCompletionData.get('selected')) {
        userCompletionData.set('selected', false);
        selectedUserIds.removeObject(userCompletionData);
      } else {
        userCompletionData.set('selected', true);
        selectedUserIds.pushObject(userCompletionData);
      }
    },

    //Action triggered when click on the x mark
    onClearStudents() {
      const component = this;
      component.resetSelectedUserIds();
    },

    onSelectAllStudent() {
      const component = this;
      let competencyData = component.get('activeCompetency');

      if (
        competencyData.get('isExpanded') ||
        component.get('activeCompetency.competencyCode') !==
          competencyData.get('competencyCode')
      ) {
        component.selectAllStudents(
          competencyData.get('usersCompletionSummary')
        );
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} contentTypes
   */
  contentTypes: SEARCH_FILTER_BY_CONTENT_TYPES,

  /**
   * @property {Object} activeCompetency
   */
  activeCompetency: null,

  /**
   * @property {Array} selectedUserIds
   */
  selectedUserIds: Ember.A([]),

  /**
   * @property {Boolean} isShowStudentSuggestion
   */
  isShowStudentSuggestion: Ember.computed('selectedUserIds.[]', function() {
    return this.get('selectedUserIds.length') >= 0;
  }),

  /**
   * @property {Number} maxLimitToSuggestContent
   */
  maxLimitToSuggestContent: 6,

  // -------------------------------------------------------------------------
  // Functions

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
        component.resetSelectedUserIds();
        component.set('showPullUp', false);
      }
    );
  },

  /**
   * @function toggleCompetencyContainer
   * Method to toggle competency container view
   */
  toggleCompetencyContainer(competencyData) {
    const component = this;
    let activeCompetency = component.get('activeCompetency');
    if (
      activeCompetency &&
      competencyData.get('competencyCode') !==
        activeCompetency.get('competencyCode')
    ) {
      activeCompetency.set('isExpanded', !activeCompetency.get('isExpanded'));
    }
    competencyData.set('isExpanded', !competencyData.get('isExpanded'));
  },

  /**
   * @function fetchUsersCompetencyPerformanceSummary
   * Method to fetch user competency performance summary
   */
  fetchUsersCompetencyPerformanceSummary(domain, tx_code) {
    const controller = this;
    const competencyService = controller.get('competencyService');
    const classId = controller.get('classId');
    let month = controller.get('activeMonth');
    let year = controller.get('activeYear');
    let agent = controller.get('userAgent');
    let requestBody = {
      classId,
      domain,
      tx_code,
      month,
      year,
      agent
    };
    return Ember.RSVP.hash({
      usersPerformanceSummary: competencyService.getUsersCompetencyPerformanceSummary(
        requestBody
      )
    }).then(({ usersPerformanceSummary }) => {
      return usersPerformanceSummary;
    });
  },

  /**
   * @function resetSelectedUserIds
   * Method to reset selected userIds
   */
  resetSelectedUserIds() {
    const component = this;
    let selectedUsers = component.get('selectedUserIds');
    selectedUsers.map(selectedUser => selectedUser.set('selected', false));
    component.set('selectedUserIds', Ember.A([]));
  },

  /**
   * @function selectAllStudents
   * Method to select all the students in a competency
   */
  selectAllStudents(usersCompletionSummary) {
    const component = this;
    let usersCompletionSummarybyDefaultAllSelected = Ember.A([]);
    component.resetSelectedUserIds();
    if (usersCompletionSummary) {
      let selectedUsers = component.get('selectedUserIds');
      usersCompletionSummarybyDefaultAllSelected = usersCompletionSummary.map(
        userCompletionData => {
          userCompletionData.set('selected', true);
          selectedUsers.pushObject(userCompletionData);
          return userCompletionData;
        }
      );
      component.set('selectedUserIds', selectedUsers);
    }
    return usersCompletionSummarybyDefaultAllSelected;
  },

  /**
   * @function fetchLearningMapsContent
   * Method to fetch learning maps content of given gutCode
   */
  fetchLearningMapsContent(gutCode) {
    const component = this;
    const searchService = component.get('searchService');
    let filters = {
      startAt: 0,
      isCrosswalk: false,
      length: 6
    };
    return searchService.fetchLearningMapsCompetencyContent(gutCode, filters);
  },

  /**
   * @function getSuggestionCount
   * Method to get suggestion content count
   */
  getSuggestionCount(competencyData) {
    const component = this;
    let gutCode = competencyData.get('competencyCode');
    let maxLimitToSuggestContent = component.get('maxLimitToSuggestContent');
    component
      .fetchLearningMapsContent(gutCode)
      .then(function(learningMapsContent) {
        let learningMapContents = learningMapsContent.get('contents');
        let collectionCount = learningMapContents.collection.totalHitCount || 0;
        competencyData.set(
          'suggestionContentCount',
          collectionCount > maxLimitToSuggestContent
            ? maxLimitToSuggestContent
            : collectionCount
        );
      });
  }
});
