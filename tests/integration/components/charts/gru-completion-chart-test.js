import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'charts/gru-completion-chart',
  'Integration | Component | charts/gru completion chart',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  this.set('completed', 4);
  this.set('total', 10);
  this.set('color', '#DD0000');

  this.render(
    hbs`{{charts/gru-completion-chart color=color completed=completed total=total}}`
  );

  const $component = this.$('.charts.gru-completion-chart');
  assert.ok($component.length, 'Component does not have the component classes');

  const $bar = $component.find('.gru-x-bar-chart');
  assert.equal($bar.find('.segment').length, 1, 'Bar chart');
  assert.equal(
    $bar.find('.segment:nth-child(1)').attr('style'),
    'background-color: #DD0000; width: 40%;',
    'Segment'
  );
  assert.equal($component.find('span').text(), '4/10', 'Text label');
});

test('it renders correctly when the total value is zero', function(assert) {
  this.set('completed', 0);
  this.set('total', 0);

  this.render(
    hbs`{{charts/gru-completion-chart completed=completed total=total}}`
  );

  const $component = this.$('.charts.gru-completion-chart');
  const $bar = $component.find('.gru-x-bar-chart');
  assert.equal($bar.length, 0, 'Bar chart should not be visible');
  assert.equal(
    $component.find('.no-info').length,
    1,
    'No info panel should be visible'
  );
});
