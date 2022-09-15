import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-helper'],

  helpInfo: Ember.computed('helpModel', function() {
    return this.get('helpModel');
  }),

  infoDescription: Ember.computed('helpInfoDescription', function() {
    return this.get('helpInfoDescription');
  }),

  didInsertElement() {
    const component = this;
    component.$().on('click', '.description a', function(e) {
      e.preventDefault();
      component.set('isShowLinkPullUP', true);
      const url = e.currentTarget.href;
      $('body').addClass('gruHelpSupportPopup');
      component.set('anchorLink', url);
    });
  },

  actions: {
    closeHelpPullUp() {
      const controller = this;
      controller.set('isShowLinkPullUP', false);
      $('body').removeClass('gruHelpSupportPopup');
      let dataModel = controller.get('anchorLink');
      if (dataModel) {
        dataModel = '';
      }
      controller.set('anchorLink', dataModel);
    }
  }
});
