import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'gru-century-skills',
  'Integration | Component | gru century skills',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');
    }
  }
);

test('Century skills Layout', function(assert) {
  this.render(hbs`{{century-skills/modals/gru-century-skills}}`);

  const $component = this.$('.gru-century-skills');
  assert.ok($component, 'Missing Component');
  assert.ok($component.find('h4.modal-title'), 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('common.add-century-skills').string,
    'Incorrect Title'
  );
  assert.ok(
    $component.find('.gru-century-skills-legend'),
    'Missing gru-century-skills-legend component'
  );
  assert.ok(
    $component.find('.gru-century-skills-content'),
    'Missing gru-century-skills-content component'
  );
});
