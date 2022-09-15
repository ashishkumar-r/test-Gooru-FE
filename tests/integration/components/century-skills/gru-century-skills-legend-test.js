import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'century-skills/gru-century-skills-legend',
  'Integration | Component | century-skills/gru century skills legend',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
    }
  }
);

test('Century skills legend Layout', function(assert) {
  this.render(hbs`{{century-skills/gru-century-skills-legend}}`);

  var $container = this.$('header.gru-century-skills-legend');
  assert.ok($container.length, 'Component');

  const $legends = $container.find('> ul');
  assert.ok($legends.length, 'List of Legends');
  assert.equal($legends.find('> li.legend').length, 4, 'Number of legends');
  assert.ok($legends.find('> li.legend .circle').length, 'Icon of the Legend');
});
