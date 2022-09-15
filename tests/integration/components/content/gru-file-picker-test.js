import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'content/gru-file-picker',
  'Integration | Component | content/gru file picker',
  {
    integration: true
  }
);

test('it renders', function(assert) {
  this.render(hbs`{{content/gru-file-picker}}`);
  const $component = this.$('.content.gru-file-picker');
  assert.ok($component.length, 'Component');
  assert.ok(
    $component.find('div:first-child input[readonly]').length,
    'Readonly input'
  );
  assert.ok(
    $component.find('div:first-child div.upload.btn').length,
    'Upload button'
  );
  assert.ok($component.find('.validation').length, 'Validation section');
});
