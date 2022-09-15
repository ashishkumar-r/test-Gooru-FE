import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'teacher/class/gru-class-navigation',
  'Integration | Component | teacher/class/gru class navigation',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Class Navigation', function(assert) {
  assert.expect(6);
  const classMock = Ember.Object.create({
    id: '1',
    name: 'Class A1',
    code: 'ABCDEF',
    greetings:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    startDate: '9.2.2015',
    endDate: '12.15.2015'
  });

  this.set('class', classMock);

  this.render(
    hbs`{{teacher/class/gru-class-navigation class=class selectedMenuItem='course-map'}}`
  );

  var $component = this.$(); //component dom element
  const $navigation = $component.find('.gru-class-navigation');
  assert.equal(
    $navigation.find('.nav a').length,
    4,
    'Number of class navigator links'
  );
  T.exists(
    assert,
    $navigation.find('.nav .course-map'),
    'Missing course-map link'
  );
  T.exists(
    assert,
    $navigation.find('.nav .performance'),
    'Missing performance link'
  );
  T.exists(
    assert,
    $navigation.find('.nav .class-management'),
    'Missing class management link'
  );
  T.exists(
    assert,
    $navigation.find('.nav .class-activities'),
    'Missing class activities link'
  );

  //$menu item Selected
  T.exists(
    assert,
    $navigation.find('.course-map.active'),
    'Missing selected course-map item'
  );
});

test('Layout when a menu Item is selected', function(assert) {
  assert.expect(5);

  this.on('itemSelected', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{teacher/class/gru-class-navigation onItemSelected='itemSelected'}}`
  );
  var $navigation = this.$(); //component dom element

  const $courseMapMenuItem = $navigation.find('.nav .course-map a');
  const $performanceMenuItem = $navigation.find('.nav .performance a');

  assert.ok($courseMapMenuItem, 'Missing course-map item in the class menu');
  assert.ok($performanceMenuItem, 'Missing performance item in the class menu');
  $courseMapMenuItem.click();
  $performanceMenuItem.click();
  assert.equal(
    $navigation.find('.nav .tab.active').length,
    1,
    'The class menu should have only one item selected'
  );
});
