import Ember from 'ember';
export default Ember.Component.extend({
  classNames: ['note-tool'],

  actions: {
    onCloseNote: function() {
      $('#note-tool-div').hide();
    }
  }
});
