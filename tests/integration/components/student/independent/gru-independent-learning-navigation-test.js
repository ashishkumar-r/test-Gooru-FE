import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'student/independent/gru-independent-learning-navigation',
  'Integration | Component | student/independent/gru independent-learning navigation',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Independent learning Navigation', function(assert) {
  this.render(
    hbs`{{student/independent/gru-independent-learning-navigation selectedMenuItem='current-study'}}`
  );

  var $component = this.$(); //component dom element
  const $navigation = $component.find('.gru-independent-learning-navigation');
  assert.equal(
    $navigation.find('.nav a').length,
    2,
    'Number of class navigator links'
  );
  T.exists(
    assert,
    $navigation.find('.nav .bookmarks'),
    'Missing bookmarks link'
  );
  T.exists(
    assert,
    $navigation.find('.nav .current-study'),
    'Missing current-study link'
  );

  //$menu item Selected
  T.exists(
    assert,
    $navigation.find('.current-study.active'),
    'Missing selected current-study item'
  );
});

test('Layout when a menu Item is selected', function(assert) {
  this.on('itemSelected', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{student/independent/gru-independent-learning-navigation onItemSelected='itemSelected'}}`
  );
  var $navigation = this.$(); //component dom element

  const $studyMentItem = $navigation.find('.nav .current-study a');
  const $bookmarksMenuItem = $navigation.find('.nav .bookmarks a');

  assert.ok($studyMentItem, 'Missing current-study item in the class menu');
  assert.ok($bookmarksMenuItem, 'Missing bookmarks item in the class menu');
  $studyMentItem.click();
  $bookmarksMenuItem.click();
  assert.equal(
    $navigation.find('.nav .tab.active').length,
    1,
    'The menu should have only one item selected'
  );
});
