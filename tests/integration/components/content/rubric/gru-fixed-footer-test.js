import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'content/rubric/gru-fixed-footer',
  'Integration | Component | content/rubric/gru fixed footer',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  var actions = [
    {
      name: 'action1',
      text: 'action1-text',
      class: 'action1-class'
    },
    {
      name: 'action2',
      text: 'action2-text',
      class: 'action2-class'
    }
  ];

  this.set('footerActions', actions);

  this.render(
    hbs`{{content/rubric/gru-fixed-footer footerActions=footerActions}}`
  );
  const $component = this.$();
  assert.ok(
    $component.find(`button.${actions[0].name}.${actions[0].class}`).length,
    'Missing first action'
  );
  assert.ok(
    $component.find(`button.${actions[1].name}.${actions[1].class}`).length,
    'Missing second action'
  );
});
