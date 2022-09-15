import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';

export default Ember.Component.extend(ModalMixin, {
  classNames: ['uploaded-evidence-report'],

  /**
   * Maintain the status of sort by firstName
   * @type {String}
   */
  sortByFirstnameEnabled: false,

  /**
   * Maintain the status of sort by lastName
   * @type {String}
   */
  sortByLastnameEnabled: true,

  tableHeaders: Ember.A([]),

  studentEvidence: Ember.A([]),

  classId: null,

  context: null,

  isAdwReport: false,

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  reportService: Ember.inject.service('api-sdk/report'),

  didRender() {
    this.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  actions: {
    showImageModal: function(thumbnail) {
      this.actions.showModal.call(
        this,
        'player.qz-image-modal',
        {
          thumbnail: thumbnail
        },
        null,
        null,
        null,
        false
      );
    },
    sortByFirstName() {
      let component = this;
      component.toggleProperty('sortByFirstnameEnabled');
      if (component.get('sortByFirstnameEnabled')) {
        component.set(
          'studentEvidence',
          component.get('studentEvidence').sortBy('user.firstName')
        );
      } else {
        component.set(
          'studentEvidence',
          component
            .get('studentEvidence')
            .sortBy('user.firstName')
            .reverse()
        );
      }
    },

    sortByLastName() {
      let component = this;
      component.toggleProperty('sortByLastnameEnabled');
      if (component.get('sortByLastnameEnabled')) {
        component.set(
          'studentEvidence',
          component.get('studentEvidence').sortBy('user.lastName')
        );
      } else {
        component.set(
          'studentEvidence',
          component
            .get('studentEvidence')
            .sortBy('user.lastName')
            .reverse()
        );
      }
    }
  }
});
