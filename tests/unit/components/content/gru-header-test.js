import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'content/gru-header',
  'Unit | Component | content/gru header',
  {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  }
);

test('select', function(assert) {
  let component = this.subject();
  component.set('selected', 'option1');
  component.send('select', 'option2');
  assert.equal(
    component.get('selected'),
    'option2',
    'Selected should be updated'
  );
});
