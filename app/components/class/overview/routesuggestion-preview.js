import Ember from 'ember';
import AccordionMixin from '../../../mixins/gru-accordion';

export default Ember.Component.extend(AccordionMixin, {
  classNames: ['routesuggestion-preview'],
  actions: {
    routeAction: function(actiontype) {
      if (actiontype === 'rejected') {
        Ember.$('.route0-banner').click();
      }
      this.attrs.routeSuggestAction(actiontype);
    },
    selectUnit: function() {
      //ToDo: Add impl on player
    }
  },
  taxonomyList: [
    {
      code: 'D2.Civ.1.K-2',
      frameworkCode: 'C3',
      id: 'C3.K12.SS-K.2-CIV-01',
      parentTitle: 'Social Sciences',
      title: 'Describe roles and responsibilities of people in authority.',
      taxonomyLevel: 'standard'
    },
    {
      code: 'D2.Civ.1.K-3',
      frameworkCode: 'C3',
      id: 'C3.K12.SS-K.2-CIV-01',
      parentTitle: 'Social Sciences',
      title: 'Describe roles and responsibilities of people in authority.',
      taxonomyLevel: 'standard'
    },
    {
      code: 'D2.Civ.1.K-4',
      frameworkCode: 'C3',
      id: 'C3.K12.SS-K.2-CIV-01',
      parentTitle: 'Social Sciences',
      title: 'Describe roles and responsibilities of people in authority.',
      taxonomyLevel: 'standard'
    }
  ]
});
