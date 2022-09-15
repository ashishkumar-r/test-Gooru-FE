import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'player/gru-navigation',
  'Integration | Component | player/gru navigation',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Not submitted layout', function(assert) {
  const collection = Ember.Object.create({
    isAssessment: true
  });

  this.set('collection', collection);
  this.render(hbs`{{player/gru-navigation collection=collection}}`);

  var $component = this.$(); //component dom element
  const $navigation = $component.find('.gru-navigation');
  T.exists(assert, $navigation, 'Missing navigation section');
  T.exists(
    assert,
    $navigation.find('.navigation-bar span'),
    'Missing clickable span'
  );
  T.exists(
    assert,
    $navigation.find('.reaction-bar .gru-emotion-picker'),
    'Missing reaction bar span'
  );
});

test('Submitted layout', function(assert) {
  const collection = Ember.Object.create({
    isAssessment: true
  });

  this.set('collection', collection);
  this.render(
    hbs`{{player/gru-navigation submitted=true collection=collection}}`
  );

  var $component = this.$(); //component dom element
  const $navigation = $component.find('.gru-navigation');
  T.exists(assert, $navigation, 'Missing navigation section');
  T.exists(
    assert,
    $navigation.find('.navigation-bar span'),
    'Missing clickable span'
  );
  T.notExists(
    assert,
    $navigation.find('button.finish-collection'),
    'Finish collection button should be hidden'
  );
});

test('Layout when navigator is opened', function(assert) {
  assert.expect(2);

  this.on('parentAction', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(hbs`{{player/gru-navigation onOpenNavigator='parentAction'}}`);
  var $component = this.$(); //component dom element
  var $menuButton = $component.find('.navigation-bar span');

  assert.ok($menuButton, 'Missing menu button');
  $menuButton.click();
});

test('Not showing reaction bar / Layout from course player', function(assert) {
  const collection = Ember.Object.create({
    isAssessment: true
  });

  this.set('collection', collection);
  this.render(
    hbs`{{player/gru-navigation collection=collection showReactionBar=false}}`
  );

  var $component = this.$(); //component dom element
  const $navigation = $component.find('.gru-navigation.without-reaction-bar');
  T.exists(assert, $navigation, 'Missing navigation section');
  T.exists(
    assert,
    $navigation.find('.navigation-bar span'),
    'Missing clickable span'
  );
  T.notExists(
    assert,
    $navigation.find('.reaction-bar .gru-emotion-picker'),
    'Missing reaction bar span'
  );
});
