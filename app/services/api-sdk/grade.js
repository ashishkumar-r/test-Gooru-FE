import Ember from 'ember';

export default Ember.Service.extend({
  i18n: Ember.inject.service(),

  /**
   * Returns all the fixed grades with i18n content
   * @returns {*[]}
   */
  readAll: function() {
    var i18n = this.get('i18n');
    return [
      Ember.Object.create({
        id: 1,
        name: i18n.t('grade-dropdown.pre-k'),
        levels: []
      }),
      Ember.Object.create({
        id: 2,
        name: i18n.t('grade-dropdown.elementary'),
        levels: [
          i18n.t('grade-dropdown.k'),
          i18n.t('grade-dropdown.first'),
          i18n.t('grade-dropdown.second'),
          i18n.t('grade-dropdown.third'),
          i18n.t('grade-dropdown.fourth'),
          i18n.t('grade-dropdown.fifth')
        ]
      }),
      Ember.Object.create({
        id: 3,
        name: i18n.t('grade-dropdown.middle-school'),
        levels: [
          i18n.t('grade-dropdown.sixth'),
          i18n.t('grade-dropdown.seventh'),
          i18n.t('grade-dropdown.eighth')
        ]
      }),
      Ember.Object.create({
        id: 4,
        name: i18n.t('grade-dropdown.high-school'),
        levels: [
          i18n.t('grade-dropdown.ninth'),
          i18n.t('grade-dropdown.tenth'),
          i18n.t('grade-dropdown.eleventh'),
          i18n.t('grade-dropdown.twelfth')
        ]
      }),
      Ember.Object.create({
        id: 5,
        name: i18n.t('grade-dropdown.higher-ed'),
        levels: []
      })
    ];
  }
});
