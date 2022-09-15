import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['struggle-answer'],

  // -------------------------------------------------------------------------
  // Properties

  struggleFrame: false,

  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service(),

  /**
   * @property {Ember.Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  strugglingCompetencyService: Ember.inject.service(
    'api-sdk/struggling-competency'
  ),

  studentStruggle: [],

  ischecked: null,

  tempModel: null,

  showClear: false,

  showTriller: false,

  selectedTopic: null,

  seletedCompetency: null,

  showCompetency: null,

  standarsCode: Ember.computed('tempModel.standards', function() {
    return (
      this.get('tempModel.standards') &&
      this.get('tempModel.standards')
        .map(item => item.code)
        .toString()
    );
  }),

  collection: null,

  selectedStruggle: Ember.A(),

  totalStruggle: [],

  newStruggleLists: Ember.A(),

  standards: [],

  observerObj: Ember.observer('studentStruggle', function() {
    this.set('filterContent', getObjectsDeepCopy(this.get('studentStruggle')));
  }),

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let studentStruggle = getObjectsDeepCopy(this.get('studentStruggle'));
    studentStruggle = studentStruggle.sortBy('struggleDisplayText');
    this.set('filterContent', studentStruggle);
    this.set('selectedStruggle', Ember.A([]));
    this.set('newStruggleLists', Ember.A());
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onClosePullUp() {
      this.set('struggleFrame', false);
    },

    onClickTopics(topic) {
      this.$(event.target)
        .closest('.struggle-panel-card')
        .addClass('content-struggles-pannel');
      this.set('selectedTopic', topic);
    },

    onClickCompentency(competency) {
      this.$(event.target)
        .closest('.struggle-panel-card')
        .addClass('content-struggles-pannel');
      this.set('seletedCompetency', competency);
    },

    onClickStruggle() {
      this.$(event.target)
        .closest('.struggle-panel-card')
        .addClass('content-struggles-pannel');
    },

    onBrowseStruggle() {
      this.toggleProperty('showTriller');
    },

    onSelectAllStruggle(event) {
      this.set('ischecked', event.target.checked);
      this.set('studentStruggle', []);
      this.sendAction('onSelectAllStruggle', null, event.target.checked);
    },

    onStruggleConfirm() {
      this.sendAction('onStruggleConfirm');
      this.set('struggleFrame', false);
    },

    onSelectItem(struggle) {
      let isChecked = !struggle.isChecked;
      let standards = this.get('tempModel.standards');
      if (standards.length === 1 && isChecked) {
        this.send('onSelectCompetency', struggle, standards[0]);
      }
      if (!isChecked) {
        struggle.setProperties({
          manifestDisplayCode: null,
          manifestCompCode: null,
          selected: false
        });
      }
      struggle.set('isChecked', isChecked);
      this.get('selectedStruggle')[`${isChecked ? 'push' : 'remove'}Object`](
        struggle
      );
      if (this.get('showCompetency') || this.get('showClear')) {
        this.get('newStruggleLists')[`${isChecked ? 'push' : 'remove'}Object`](
          struggle
        );
      }
    },

    onSelectCompetency(struggle, standard) {
      let fmComp = standard.id.split('.');
      fmComp.shift();
      fmComp = fmComp.join('.');
      struggle.setProperties({
        manifestDisplayCode: standard.code,
        manifestCompCode: fmComp,
        selected: true
      });
    },

    updateStuggle() {
      let activeCompeteny = this.get('selectedStruggle').find(
        item => !item.selected
      );

      if (!activeCompeteny) {
        let selectedStruggle = this.get('selectedStruggle');
        let newStruggleLists = selectedStruggle.filter(item =>
          this.get('newStruggleLists').findBy('struggleCode', item.struggleCode)
        );
        this.sendAction(
          'onSelectedStruggle',
          selectedStruggle,
          newStruggleLists
        );
        this.set('struggleFrame', false);
      }
    },

    onSearch() {
      let searchTxt = this.$(event.target).val();
      this.set('showClear', false);
      if (searchTxt !== '') {
        this.set('showClear', true);
      }
      let filterContent = getObjectsDeepCopy(this.get('totalStruggle'));
      let studentStruggle = getObjectsDeepCopy(this.get('studentStruggle'));
      filterContent = filterContent.filter(item => {
        return (
          (item.originDisplayCode &&
            item.originDisplayCode
              .toLowerCase()
              .indexOf(searchTxt.toLowerCase()) !== -1) ||
          (item.struggleCode &&
            item.struggleCode.toLowerCase().indexOf(searchTxt.toLowerCase()) !==
              -1) ||
          (item.struggleDisplayText &&
            item.struggleDisplayText
              .toLowerCase()
              .indexOf(searchTxt.toLowerCase()) !== -1)
        );
      });
      this.set('filterContent', searchTxt ? filterContent : studentStruggle);
    },

    onClearSearch() {
      this.set('showClear', false);
      this.$('.search-text-box').val('');
      this.set(
        'filterContent',
        getObjectsDeepCopy(this.get('studentStruggle'))
      );
    },

    onClickAllStruggle() {
      let isChecked = event.target.checked;
      let filterContent = getObjectsDeepCopy(this.get('totalStruggle'));
      filterContent = filterContent.sortBy('struggleDisplayText');
      this.set(
        'filterContent',
        isChecked
          ? filterContent
          : getObjectsDeepCopy(this.get('studentStruggle'))
      );
      this.set('showCompetency', isChecked);
    },

    goBack: function() {
      this.set('showClear', false);
      this.$('.search-text-box').val('');
      this.set(
        'filterContent',
        getObjectsDeepCopy(this.get('studentStruggle'))
      );
    }
  }
});
