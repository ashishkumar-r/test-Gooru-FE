import Ember from 'ember';
import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import ClassModel from 'gooru-web/models/content/class';

moduleForComponent('gru-header', 'Integration | Component | Header', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
  }
});

test('header layout for anonymous', function(assert) {
  assert.expect(8); //making sure all asserts are called

  this.set(
    'session',
    Ember.Object.create({ isAnonymous: true, isGooruClientId: true })
  );

  this.on('myAuthenticateAction', function() {
    assert.ok(false, 'onAuthenticateAction should not be called');
  });

  this.render(
    hbs`{{gru-header session=session onAuthenticateAction='myAuthenticateAction'}}`
  );

  var $component = this.$(); //component dom element

  T.exists(
    assert,
    $component.find('header.gru-header'),
    'Root element not found'
  );

  var $navHeader = $component.find('.navbar-header');
  T.exists(assert, $navHeader, 'Missing nav header');
  T.exists(assert, $navHeader.find('.home-link'), 'Missing home link');

  var $navMenu = $component.find('.menu-navbar');
  T.notExists(
    assert,
    $navMenu.find('.home-link'),
    'Link should be available for authenticated users only'
  );
  T.exists(assert, $navMenu.find('.library-link'), 'Missing library link');
  T.exists(assert, $navMenu.find('.sign-in-button'), 'Missing sign in button');
  T.exists(assert, $navMenu.find('.sign-up-button'), 'Missing sign up button');
  T.notExists(
    assert,
    $navMenu.find('.user-logged'),
    'User info should not be present'
  );
});

test('header layout for accessibility', function(assert) {
  assert.expect(3); //making sure all asserts are called

  this.set('session', Ember.Object.create({ isAnonymous: true }));
  this.render(hbs`{{gru-header session=session}}`);

  var $component = this.$(); //component dom element

  T.exists(
    assert,
    $component.find('header.gru-header'),
    'Root element not found'
  );
  var $navHeaderLink = $component.find('.navbar-header .home-link');
  T.exists(assert, $navHeaderLink, 'Missing home link');
  assert.equal($navHeaderLink.attr('aria-label'), 'Home', 'Missing aria label');
});

skip('header layout with user', function(assert) {
  assert.expect(4); //making sure all asserts are called

  this.set(
    'session',
    Ember.Object.create({
      isAnonymous: false,
      userData: { username: 'jperez' }
    })
  );

  this.set('classes', [
    ClassModel.create({
      id: 'id-1',
      title: 'title-1'
    }),
    ClassModel.create({
      id: 'id-2',
      title: 'title-2'
    })
  ]);

  this.render(hbs`{{gru-header session=session classes=classes}}`);

  const $component = this.$(); //component dom element

  const $navMenu = $component.find('.menu-navbar');
  T.notExists(
    assert,
    $component.find('.sign-in-button'),
    'Missing sign-in-btn button'
  );
  T.exists(
    assert,
    $navMenu.find('.library-link'),
    'Library link should be present'
  );
  T.exists(
    assert,
    $navMenu.find('.profile .username'),
    'User info should be present'
  );
  assert.equal(
    T.text($navMenu.find('.profile .username')),
    'jperez',
    'Wrong username'
  );
});

skip('Links as student', function(assert) {
  assert.expect(2); //making sure all asserts are called

  let profile = Ember.Object.create({
    isTeacher: false
  });

  this.set('profile', profile);

  this.render(hbs`{{gru-header profile=profile}}`);

  const $component = this.$(); //component dom element

  const $notificationsLink = $component.find('.notifications-link');
  assert.ok($notificationsLink.length, 'Missing notifications link');
  const $libraryLink = $component.find('.library-link');
  assert.ok($libraryLink.length, 'Missing library link');
});

test('hidden links as teacher', function(assert) {
  assert.expect(3); //making sure all asserts are called

  let profile = Ember.Object.create({
    isTeacher: true
  });

  this.set('profile', profile);

  this.render(hbs`{{gru-header profile=profile}}`);

  const $component = this.$(); //component dom element

  const $classroomsLink = $component.find('.classrooms-link');
  assert.ok($classroomsLink.length, 'Missing classrooms link');
  const $toolsTab = $component.find('.tools-link');
  assert.ok($toolsTab.length, 'Missing tools tab');
  const $notificationsLink = $component.find('.notifications-link');
  assert.ok($notificationsLink.length, 'Missing notifications link');
});

test('tools tab as teacher', function(assert) {
  assert.expect(3); //making sure all asserts are called

  let profile = Ember.Object.create({
    isTeacher: true
  });

  this.set('profile', profile);

  this.render(hbs`{{gru-header profile=profile}}`);

  const $component = this.$(); //component dom element

  const $toolsTab = $component.find('.tools-link');
  assert.ok($toolsTab.length, 'Missing tools tab');

  const $toolsMenu = $toolsTab.find('.tools-menu');
  assert.ok(
    $toolsMenu.find('.assessments-link').hasClass('out-of-scope'),
    'Live assessments link should not appear'
  );
  assert.ok(
    $toolsMenu.find('.performance-dashboard-link').hasClass('out-of-scope'),
    'Performance dashboard link should not appear'
  );
});
