import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-slider'],

  scaleItems: Ember.A([]),

  likertScalePoints: Ember.A([]),

  //----------------------------------------------------------------------
  //Properties
  /**
   *
   * @property {string}
   */
  fillLevel: null,

  fillPercentage: 0,

  connectors: Ember.computed('likertScalePoints', function() {
    const likertScalePoints = this.get('likertScalePoints');
    const totalCount = likertScalePoints.length;
    const connectors = Ember.A([]);
    for (let i = 0; i < likertScalePoints.length; i++) {
      connectors[i] = ((i + 1) / totalCount) * 100 - 1.5;
    }
    connectors[0] = 0;
    return connectors;
  }),

  rangeColor: Ember.computed(
    'scaleItems',
    'scaleItems.selectedItem',
    function() {
      const scaleItems = this.get('scaleItems');
      const selectedItem = parseInt(scaleItems.selectedItem, 0);
      const connectorLength = this.get('connectors.length');
      if (selectedItem) {
        const activeItem = selectedItem;
        const percentage = (activeItem / connectorLength) * 100;
        if (percentage > 75 && percentage <= 100) {
          return 'slider-range-100';
        }
        if (percentage > 50 && percentage <= 75) {
          return 'slider-range-75';
        }
        if (percentage > 25 && percentage <= 50) {
          return 'slider-range-50';
        }
        if (percentage > 0 && percentage <= 25) {
          return 'slider-range-25';
        }
      }
      return '';
    }
  ),

  didInsertElement() {
    this.loadUserAnswer();
  },

  //------------------
  //Actions
  actions: {
    onSelectSlider(connector, index) {
      const likertItems = this.get('likertItems');
      this.set('fillPercentage', `${event.target.offsetLeft}px`);
      const scalePoint = this.get('likertScalePoints');
      const activeScale = scalePoint[index];
      Ember.set(this.get('scaleItems'), 'selectedItem', activeScale.levelPoint);
      const currentIndex = likertItems.indexOf(this.get('scaleItems'));
      const nextItem = likertItems[currentIndex + 1];
      if (nextItem) {
        Ember.set(nextItem, 'isShow', true);
      }
      this.sendAction('onChangeAnswer', this.get('scaleItems'));
    }
  },

  loadUserAnswer() {
    const scaleItems = this.get('scaleItems');
    const selectedItem = this.get('likertScalePoints').findIndex(
      item => item.levelPoint === scaleItems.selectedItem
    );
    if (selectedItem >= 0) {
      const fillPoint = this.$(`.span-item-${selectedItem}`)[0].offsetLeft;
      this.set('fillPercentage', `${fillPoint}px`);
    }
  }
});
