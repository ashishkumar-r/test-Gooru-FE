import Ember from 'ember';

export default Ember.Service.extend({
  readAll: function() {
    return Ember.A([
      Ember.Object.create({
        id: 'CCSS',
        name: 'CCSS',
        title: 'Common Core State Standard',
        disabled: false
      }),
      Ember.Object.create({
        id: 'CA',
        name: 'CA SS',
        title: 'California State Standards',
        disabled: false
      }),
      Ember.Object.create({
        id: 'C3',
        name: 'C3',
        title: 'College, Career, and Civic Life',
        disabled: false
      }),
      Ember.Object.create({
        id: 'NGSS',
        name: 'NGSS',
        title: 'Next Generation Science Standards',
        disabled: false
      }),
      Ember.Object.create({
        id: 'TEKS',
        name: 'TEKS',
        title: 'Texas Essential Knowledge and Skills',
        disabled: true
      }),
      Ember.Object.create({
        id: 'B21',
        name: 'LWMCS',
        title: 'Learning What Matters Competency Sets',
        disabled: false
      })
    ]);
  },

  getCheckableStandards: function() {
    return Ember.A(['CCSS', 'CA', 'NGSS', 'TEKS']);
  }
});
