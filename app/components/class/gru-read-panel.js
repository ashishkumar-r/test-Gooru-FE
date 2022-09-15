import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-read-panel'],

  sortByFirstnameEnabled: false,

  sortByLastnameEnabled: true,

  reportDatas: Ember.computed('reportData', function() {
    return this.get('reportData.details');
  }),

  actions: {
    onPullUpClose() {
      let component = this;
      component.sendAction('onClosePullUp');
    },
    sortByFirstName() {
      let component = this;
      component.toggleProperty('sortByFirstnameEnabled');
      if (component.get('sortByFirstnameEnabled')) {
        component.set(
          'reportDatas',
          component.get('reportDatas').sortBy('firstName')
        );
      } else {
        component.set(
          'reportDatas',
          component
            .get('reportDatas')
            .sortBy('firstName')
            .reverse()
        );
      }
    },

    sortByLastName() {
      let component = this;
      component.toggleProperty('sortByLastnameEnabled');
      if (component.get('sortByLastnameEnabled')) {
        component.set(
          'reportDatas',
          component.get('reportDatas').sortBy('lastName')
        );
      } else {
        component.set(
          'reportDatas',
          component
            .get('reportDatas')
            .sortBy('lastName')
            .reverse()
        );
      }
    }
  },
  didInsertElement() {
    this.fontChangerOne();
  },

  fontChangerOne() {
    let component = this;
    component
      .$('.font-changer .font-title')
      .on('input', '.font-size-loader .font-changer', function() {
        let el = component.$(this).closest('.read-body-container');
        let fontChanger = el.find('.left-panel .questionText');
        const value = $(this).val();
        fontChanger.css('font-size', `${value}px`);
      });
  }
});
