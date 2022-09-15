import Ember from 'ember';
import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | application', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: true,
      token: 'token-value',
      user: {
        gooruUId: 'anonymous'
      }
    });
  }
});

skip('Theme support - no theme', function(assert) {
  visit('/');

  andThen(function() {
    assert.expect(3); //making sure all asserts are called

    assert.equal(currentURL(), '/');

    assert.ok(!Ember.$('html').attr('id'), 'Html element should have no id');

    const $styleLink = Ember.$('#theme-style-link');
    T.notExists(assert, $styleLink, 'Link element should not be added');
  });
});

skip('Theme support - Having translations and styles url', function(assert) {
  visit('/?themeId=bergen');

  andThen(function() {
    assert.expect(4); //making sure all asserts are called

    assert.equal(currentURL(), '/?themeId=bergen');

    T.exists(
      assert,
      Ember.$('.bergen-theme'),
      'Missing element having theme id'
    );

    const $styleLink = Ember.$('#theme-style-link');
    T.exists(assert, $styleLink, 'Missing link element having theme style');
    assert.equal(
      $styleLink.attr('href'),
      '/assets/themes/bergen/styles.css',
      'Wrong style url'
    );
  });
});

skip('Legacy uri collection-play with no content id', function(assert) {
  visit('/#collection-play&id=all-resource-types-collection-id');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/player/all-resource-types-collection-id?resourceId=image-resource-id&role=student&type=collection'
    );
  });
});

skip('Legacy uri collection-play with content id', function(assert) {
  visit(
    '/#collection-play&id=all-resource-types-collection-id&cid=f86f874c-efc9-4100-9cf7-55eb86ec95ae'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/player/all-resource-types-collection-id?resourceId=image-resource-id&role=student&type=collection'
    );
  });
});

skip('Legacy uri assessment-play with no content id', function(assert) {
  visit('/#assessment-play&id=all-question-types-assessment-id');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/player/all-question-types-assessment-id?resourceId=image-resource-id&role=student&type=assessment'
    );
  });
});

skip('Legacy uri assessment-play with content id', function(assert) {
  visit(
    '/#assessment-play&id=all-question-types-assessment-id&cid=f86f874c-efc9-4100-9cf7-55eb86ec95ae'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/player/all-question-types-assessment-id?resourceId=image-resource-id&role=student&type=assessment'
    );
  });
});

skip('Legacy uri resource-play', function(assert) {
  visit('/#resource-play&id=all-question-types-assessment-id');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/resources/play/all-question-types-assessment-id'
    );
  });
});

skip('Legacy uri profile', function(assert) {
  authenticateSession(this.application, {
    isAnonymous: false,
    token: 'token-value',
    user: {
      gooruUId: 'anonymous'
    }
  });

  visit('/#id-for-pochita');
  andThen(function() {
    assert.equal(currentURL(), '/id-for-pochita/about');
  });
});

skip('Trying the google sign in url', function(assert) {
  authenticateSession(this.application, {
    isAnonymous: false,
    token: 'token-value',
    user: {
      gooruUId: 'anonymous'
    }
  });
  visit('/?access_token=google-sign-token');
  andThen(function() {
    assert.ok(
      Ember.$('.gru-tenant-theme style').length,
      'Tenant theme component should be loaded'
    );
    assert.equal(currentURL(), '/sign-up-finish');
    visit('/teacher-home');
    andThen(function() {
      assert.equal(currentURL(), '/teacher-home');
    });
  });
});
