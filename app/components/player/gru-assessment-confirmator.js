import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';

export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Ember.Service} Service to do retrieve audiences
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-assessment-confirmator'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {bool} Boolean used to determine whether you can navigate both ways on an assessment or only forward
   */
  bidirectional: null,
  /**
   * @property {number} Ammount of attempts left on the assessment
   */
  attempts: null,

  didInsertElement() {
    this._super(...arguments);
    var model = {
      bidirectional: this.get('bidirectional'),
      attempts: this.get('attempts'),
      title: this.get('title'),
      onStart: function() {
        return this.sendAction('onStart');
      }.bind(this),
      onCancel: function() {
        return this.sendAction('onCancel');
      }.bind(this),
      isAssessmentStarted: this.get('isAssessmentStarted')
    };

    this.actions.showModal.call(
      this,
      'content.modals.gru-assessment-confirmation',
      model
    );
  }
});
