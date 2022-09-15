import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['competency-meta-data'],

  actions: {
    openMicroCompetencies(index) {
      if (event.type === 'keypress') {
        if ($(`.micro-competencies div #collapse-${index}`).hasClass('in')) {
          $(`.micro-competencies div #collapse-${index}`).removeClass('in');
        } else {
          $(`.micro-competencies div #collapse-${index}`).addClass('in');
          $(`.micro-competencies div #collapse-${index}`).css('height', 'auto');
        }
      }
    }
  }
});
