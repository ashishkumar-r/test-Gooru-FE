import Ember from 'ember';
import RemixBaseModal from 'gooru-web/components/content/modals/gru-base-remix';

export default RemixBaseModal.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Unit service API SDK
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-unit-remix'],

  // -------------------------------------------------------------------------
  // Actions

  copyContent: function(unit) {
    return this.get('unitService').copyUnit(
      this.get('courseId'),
      unit.get('id')
    );
  },

  updateContent: function(unit) {
    return this.get('unitService').updateUnit(this.get('courseId'), unit);
  },

  showSuccessNotification: function(unit) {
    var component = this;
    var successMsg = component
      .get('i18n')
      .t('common.remix-unit-success', { unitTitle: unit.get('title') });
    component.get('notifications').success(`${successMsg}`);
  },

  showFailureNotification: function() {
    const message = this.get('i18n').t('common.errors.unit-not-copied').string;
    this.get('notifications').error(message);
  },

  init: function() {
    this._super(...arguments);
    this.set('courseId', this.get('model.courseId'));
  },

  courseId: null
});
