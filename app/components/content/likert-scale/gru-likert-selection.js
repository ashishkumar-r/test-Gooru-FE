import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-likert-selection'],

  scaleItems: Ember.A([]),

  likertScalePoints: Ember.A([]),

  userAnswer: Ember.A([]),

  oneAtTime: false,

  isPlayer: false,

  likertItems: Ember.computed(
    'likertScalePoints',
    'scaleItems.@each.label',
    function() {
      const scaleItems = Ember.A(
        JSON.parse(JSON.stringify(this.get('scaleItems')))
      );
      const userAnswer = this.get('userAnswer');
      const hasAnswer = userAnswer && userAnswer.length;
      return scaleItems.map((item, indexItem) => {
        const isOneByOne = this.get('oneAtTime') && this.get('isPlayer');
        Ember.set(item, 'isShow', isOneByOne && !hasAnswer ? !indexItem : true);
        const likertScalePoints = JSON.parse(
          JSON.stringify(this.get('likertScalePoints'))
        );
        if (userAnswer && userAnswer.length && userAnswer[0].value) {
          const userOptions = JSON.parse(userAnswer[0].value)
            .liket_scale_selected_items;
          const option = userOptions.find(
            optionData => optionData.item_name === item.label
          );
          Ember.set(
            item,
            'selectedPoint',
            parseInt(option ? option.scale_point : -1)
          );
        }
        Ember.set(item, 'likertScalePoints', Ember.A(likertScalePoints));
        return Ember.Object.create(item);
      });
    }
  ),

  //----------------
  //Actions
  actions: {
    onSelectRating(item, scalePoint) {
      const likertItems = this.get('likertItems');
      Ember.set(item, 'selectedPoint', scalePoint.levelPoint);
      const currentIndex = likertItems.indexOf(item);
      const nextItem = likertItems[currentIndex + 1];
      if (nextItem) {
        Ember.set(nextItem, 'isShow', true);
      }
      this.loadAnswerObj();
    }
  },

  loadAnswerObj() {
    const likertItems = this.get('likertItems');
    const answers = [];
    likertItems.forEach(item => {
      const activeScale = item.likertScalePoints.find(
        point => point.levelPoint === item.selectedPoint
      );
      answers.push({
        scale_name: activeScale ? activeScale.levelName : '',
        scale_point: item.selectedPoint,
        item_name: item.label
      });
    });
    const answer = {
      value: JSON.stringify({ liket_scale_selected_items: answers })
    };
    this.sendAction('onChangeAnswer', [answer]);
  },

  didInsertElement() {
    this.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  }
});
