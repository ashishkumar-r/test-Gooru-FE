import Ember from 'ember';
import { getGradeColor } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  /**
   * Config properties of the card
   */
  displayInfo: null,

  /**
   * Card Data model
   */
  timeSession: null,

  /**
   * @property {String} barColor
   * Computed property to know the color of the small bar
   */
  colorStyle: Ember.computed('performanceSummary', function() {
    let score = this.get('timeSession.scoreInPercentage');
    return Ember.String.htmlSafe(`background-color: ${getGradeColor(score)};`);
  }),

  /**
   * Set the static display properties to model
   */
  setCardDisplay: Ember.computed('timeSession', function() {
    let model = this.get('timeSession');
    if (model) {
      model.cardImage = this.displayInfo[model.collectionType];
      this.set('timeSession', model);
    }
    if (!this.get('timeSession')) {
      let timesession = {
        collectionType: 'nodata',
        title: 'nodata'
      };
      this.set('timeSession', timesession);
    }
  }),
  init() {
    this._super(...arguments);
    if (!this.get('timeSession')) {
      let timesession = {
        collectionType: 'nodata',
        title: 'nodata'
      };
      this.set('timeSession', timesession);
    }
  }
});
