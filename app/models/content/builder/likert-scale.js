import Ember from 'ember';

export default Ember.Object.extend({
  scale_point: null,

  scale_point_labels: Ember.A([]),

  items: Ember.A([]),

  ui_display_guide: {
    ui_presentation: 'one_item',
    rating_type: null
  }
});
