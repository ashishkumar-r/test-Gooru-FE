import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'gru-breadcrumb',
  'Integration | Component | gru breadcrumb',
  {
    integration: true
  }
);

test('Layout and click', function(assert) {
  assert.expect(6);

  const breadcrumb = Ember.A([
    {
      value: { id: '111', type: 'course' },
      label: 'Course Name'
    },
    {
      value: { id: '222', type: 'unit' },
      label: 'Unit number one'
    },
    {
      value: { id: '333', type: 'lesson' },
      label: 'Lesson number one'
    },
    {
      value: { id: '444', type: 'collection' },
      label: 'Collection one'
    }
  ]);

  this.set('breadcrumb', breadcrumb);
  this.on('mySelectItem', function(item) {
    assert.equal(item.value.id, '111', 'Wrong id');
  });

  this.render(
    hbs`{{gru-breadcrumb items=breadcrumb onSelectedItem='mySelectItem'}}`
  );

  const $component = this.$();

  assert.ok($component.find('.item').length, 4, 'Missing breadcrumb items');
  assert.ok(
    $component.find('.item:first-child .greater-than').length,
    'Missing >'
  );
  assert.ok(
    $component.find('.item:first-child .greater-than .chevron_right').length,
    'Incorrect icon'
  );
  assert.notOk(
    $component.find('.item:last-child .greater-than:visible').length,
    'Last element should not have >'
  );
  assert.equal(
    T.text($component.find('.item:eq(0) .breadcrumb-item')),
    'Course Name',
    'Wrong item label'
  );

  $component.find('.item:eq(0) .breadcrumb-item').click();
});
