import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'library/gru-library-card',
  'Integration | Component | library/gru library card',
  {
    integration: true
  }
);

test('Library card', function(assert) {
  var course = {
    id: 12345,
    title: 'Course title',
    unitCount: 3,
    thumbnailUrl: 'url-image.jpg'
  };

  this.set('model', course);

  this.render(hbs`{{library/gru-library-card model=model}}`);
  const $component = this.$('.library.gru-library-card');
  assert.ok($component.length, 'Component found');
  assert.ok($component.find('.information .title h3'), 'Missing title');
  assert.ok(
    $component.find('.information .title .resource-count'),
    'Missing resource count'
  );
  assert.ok($component.find('.information .image'), 'Missing image');
  assert.ok($component.find('.type i.chrome_reader_mode'), 'Missing type icon');
  assert.ok($component.find('.type span'), 'Missing type');
  assert.ok($component.find('.description'), 'Missing description');
  assert.ok(
    $component.find('.panel-footer .network'),
    'Missing network section'
  );
  assert.ok(
    $component.find('.panel-footer .actions .share-btn'),
    'Missing share button'
  );
  assert.ok(
    $component.find('.panel-footer .actions .bookmark-btn'),
    'Missing bookmark button'
  );
});
