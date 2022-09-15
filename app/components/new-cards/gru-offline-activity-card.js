import Ember from 'ember';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import ModalMixin from 'gooru-web/mixins/modal';

export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['new-cards', 'gru-offline-activity-card'],

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on edit
    onEditContent() {
      const component = this;
      const contentId = component.get('offlineActivity.id');
      const isLibraryContent = component.get('isLibraryContent');
      component.get('router').transitionTo('content.activity.edit', contentId, {
        queryParams: { editingContent: true, isLibraryContent }
      });
    },

    selectSingleBox: function(content) {
      this.sendAction('selectSingleBox', content);
    },

    /**
     * Action triggered to add to classroom or daily class activities
     */
    onAddContent() {
      const component = this;

      component.addStudentCountToClasses();

      let model = Ember.Object.create({
        classroomList: this.get('classroomList'),
        classActivity: true,
        content: this.get('offlineActivity')
      });

      if (this.get('isCourse')) {
        model.set('callback', {
          success: function() {
            component.sendAction('onUpdateUserClasses');
          }
        });
      }
      component.send(
        'showModal',
        'content.modals.gru-add-to-classroom',
        model,
        null,
        'add-to'
      );
    },

    //Action triggered when click on play
    onShowOfflineActivityPreview() {
      const component = this;
      let offlineActivity = component.get('offlineActivity');
      offlineActivity.set('tabindex', this.get('tabindex'));
      component.sendAction('onShowOfflineActivityPreview', offlineActivity);
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  oaStandards: Ember.computed('offlineActivity.standards.[]', function() {
    var standards = this.get('offlineActivity.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
    }
    return TaxonomyTag.getTaxonomyTags(standards);
  }),

  /**
   * @property {Boolean} isSameOwnerAndCreator
   */
  isSameOwnerAndCreator: Ember.computed(
    'offlineActivity.originalCreatorId',
    function() {
      const component = this;
      const offlineActivity = component.get('offlineActivity');
      return (
        offlineActivity.get('originalCreatorId') ===
        offlineActivity.get('ownerId')
      );
    }
  ),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Add student count to classes
   */
  addStudentCountToClasses: function() {
    let component = this;
    let classStudentCount = component.get('classStudentCount');
    let classRoomList = component.get('classroomList');
    if (classRoomList) {
      classRoomList.forEach(function(classroom) {
        let studentCount = component.studentCount(classStudentCount, classroom);
        classroom.set('studentCount', studentCount);
      });
    }
  },

  /**
   * @property {Number} Count of students in the class
   */
  studentCount: function(studentCount, classroom) {
    let classStudentCount = studentCount;
    return classStudentCount && Ember.keys(classStudentCount).length
      ? classStudentCount[classroom.get('id')]
        ? classStudentCount[classroom.get('id')]
        : 0
      : 0;
  }
});
