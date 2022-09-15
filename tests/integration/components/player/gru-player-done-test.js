import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'player/gru-player-done',
  'Integration | Component | player/gru player done',
  {
    integration: true
  }
);

test('Layot', function(assert) {
  this.render(hbs`{{player/gru-player-done}}`);

  const $component = this.$();
  T.exists(assert, $component.find('.description'), 'Missing description');
});
