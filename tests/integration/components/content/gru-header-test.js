import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/gru-header',
  'Integration | Component | content/gru header',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  this.set('options', [
    {
      text: 'option1-text'
    },
    {
      text: 'option2-text'
    }
  ]);
  this.set('headerActions', [
    {
      name: 'action1',
      text: 'action1-text',
      icon: 'action1-icon'
    },
    {
      name: 'action2',
      text: 'action2-text',
      icon: 'action2-icon'
    }
  ]);

  this.render(
    hbs`{{content/gru-header title='title1' headerActions=headerActions options=options}}`
  );

  const $component = this.$();
  assert.equal(
    $component.find('h1').text().trim(),
    'title1',
    'Title should match'
  );

  let $scrollingTabs = $component.find('nav.scrolling-tabs');
  assert.notOk($scrollingTabs.length, 'Tabs should not scrolling');

  let $options = $component.find('.tab');
  assert.equal(
    $options.filter(':first-child').text().trim(),
    'option1-text',
    'Option 1 text should match'
  );
  assert.equal(
    $options.filter(':last-child').text().trim(),
    'option2-text',
    'Option 2 text should match'
  );

  let $firstAction = $component.find('.action1');
  assert.ok($firstAction.length, 'Action 1 should exist');
  assert.equal(
    $firstAction.attr('title').trim(),
    'action1-text',
    'Action 1 title should match'
  );
  assert.equal(
    $firstAction.find('i').text().trim(),
    'action1-icon',
    'Action 1 icon should match'
  );

  let $lastAction = $component.find('.action2');
  assert.ok($lastAction.length, 'Action 2 should exist');
  assert.equal(
    $lastAction.attr('title').trim(),
    'action2-text',
    'Action 2 title should match'
  );
  assert.equal(
    $lastAction.find('i').text().trim(),
    'action2-icon',
    'Action 2 icon should match'
  );
});

test('Layout when use scrolling', function(assert) {
  this.set('options', [
    {
      text: 'option1-text'
    },
    {
      text: 'option2-text'
    }
  ]);
  this.set('headerActions', [
    {
      name: 'action1',
      text: 'action1-text',
      icon: 'action1-icon'
    },
    {
      name: 'action2',
      text: 'action2-text',
      icon: 'action2-icon'
    }
  ]);

  this.render(
    hbs`{{content/gru-header title='title1' headerActions=headerActions options=options useScroll=true}}`
  );

  const $component = this.$();
  assert.equal(
    $component.find('h1').text().trim(),
    'title1',
    'Title should match'
  );

  let $scrollingTabs = $component.find('nav.scrolling-tabs');
  assert.ok($scrollingTabs.length, 'Missing scrolling tabs');

  let $options = $scrollingTabs.find('a');
  assert.equal(
    $options.filter(':first-child').text().trim(),
    'option1-text',
    'Option 1 text should match'
  );
  assert.equal(
    $options.filter(':last-child').text().trim(),
    'option2-text',
    'Option 2 text should match'
  );

  let $firstAction = $component.find('.action1');
  assert.ok($firstAction.length, 'Action 1 should exist');
  assert.equal(
    $firstAction.attr('title').trim(),
    'action1-text',
    'Action 1 title should match'
  );
  assert.equal(
    $firstAction.find('i').text().trim(),
    'action1-icon',
    'Action 1 icon should match'
  );

  let $lastAction = $component.find('.action2');
  assert.ok($lastAction.length, 'Action 2 should exist');
  assert.equal(
    $lastAction.attr('title').trim(),
    'action2-text',
    'Action 2 title should match'
  );
  assert.equal(
    $lastAction.find('i').text().trim(),
    'action2-icon',
    'Action 2 icon should match'
  );
});

test('Change selected', function(assert) {
  this.set('options', [
    {
      name: 'option1',
      text: 'option1-text'
    },
    {
      name: 'option2',
      text: 'option2-text'
    }
  ]);
  this.render(
    hbs`{{content/gru-header title='title1' selected='option1' options=options}}`
  );

  const $component = this.$();
  assert.equal(
    $component.find('h1').text().trim(),
    'title1',
    'Title should match'
  );

  let $options = $component.find('.tab');
  let $firstOption = $options.filter(':first-child');
  let $lastOption = $options.filter(':last-child');
  assert.ok($firstOption.hasClass('selected'), 'Option 1 should be selected');
  assert.notOk(
    $lastOption.hasClass('selected'),
    'Option 2 should not be selected'
  );

  $lastOption.click();

  let done = assert.async();
  return wait().then(function() {
    assert.notOk(
      $options.filter(':first-child').hasClass('selected'),
      'Option 1 should be selected'
    );
    assert.ok(
      $options.filter(':last-child').hasClass('selected'),
      'Option 2 should not be selected'
    );
    done();
  });
});
