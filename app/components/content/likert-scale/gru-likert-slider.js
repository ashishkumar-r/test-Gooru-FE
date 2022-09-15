import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-likert-slider'],

  scaleItems: Ember.A([]),

  likertScalePoints: Ember.A([]),

  userAnswer: Ember.A([]),

  oneAtTime: false,

  isPlayer: false,

  likertItems: Ember.computed(
    'likertScalePoints',
    'scaleItems.@each',
    function() {
      const scaleItems = this.get('scaleItems');
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
            'selectedItem',
            parseInt(option ? option.scale_point : -1)
          );
        }
        Ember.set(item, 'likertScalePoints', Ember.A(likertScalePoints));
        return item;
      });
    }
  ),

  actions: {
    onChangeAnswer() {
      const likertItems = this.get('likertItems');
      const answers = [];
      likertItems.forEach(item => {
        const activeScale = item.likertScalePoints.find(
          scale => scale.levelPoint === item.selectedItem
        );
        answers.push({
          scale_name: activeScale ? activeScale.levelName : '',
          scale_point: item.selectedItem,
          item_name: item.label
        });
      });
      const answer = {
        value: JSON.stringify({ liket_scale_selected_items: answers })
      };
      this.sendAction('onChangeAnswer', [answer]);
    }
  },

  didInsertElement() {
    this.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  }
});
