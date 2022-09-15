import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-quick-remove-content',
  'Integration | Component | content/modals/gru quick remove content',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
    }
  }
);

test('it renders', function(assert) {
  const model = {
    content: {
      title: 'Test String'
    }
  };
  this.set('model', model);

  this.render(hbs`{{content/modals/gru-quick-remove-content model=model}}`);

  const $component = this.$('.gru-quick-remove-content');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');

  Object.keys(CONTENT_TYPES).forEach(
    function(content_type) {
      Ember.run(() => {
        this.set('model.type', CONTENT_TYPES[content_type]);
      });
      assert.equal(
        $component.find('h4.modal-title').text(),
        `${this.get('i18n').t('common.remove').string} ${
          this.get('i18n').t(`common.${model.type}`).string
        }`,
        'Incorrect Title'
      );
    }.bind(this)
  );

  assert.ok($component.find('p.legend').length, 'Missing Remove Course Legend');

  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions .remove').length,
    'Missing Remove Button'
  );
});

test('it calls a generic remove method and then a callback (if provided) after clicking on the remove button', function(assert) {
  assert.expect(36);

  const model = {
    removeMethod: function() {
      assert.ok(true, 'Remove method invoked');
      return Ember.RSVP.resolve(true);
    },
    callback: {
      success: function() {
        assert.ok(true, 'Success callback run');
      }
    }
  };

  this.set('model', model);
  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(hbs`{{content/modals/gru-quick-remove-content model=model}}`);
  const $component = this.$('.gru-quick-remove-content');

  Object.keys(CONTENT_TYPES).forEach(
    function(question_type) {
      Ember.run(() => {
        this.set('model.type', CONTENT_TYPES[question_type]);
      });

      $component.find('.actions .remove').click();
    }.bind(this)
  );
});

test('it calls a generic remove method and then redirects (if a route is provided) after clicking on the remove button', function(assert) {
  assert.expect(48);

  const model = {
    removeMethod: function() {
      assert.ok(true, 'Remove method invoked');
      return Ember.RSVP.resolve(true);
    },
    redirect: {
      route: 'route.name',
      params: {
        id: '345'
      }
    }
  };

  const router = {
    transitionTo: function(route, id) {
      assert.ok(route, 'Should have route');
      assert.ok(id, 'Should have id');
    }
  };

  this.set('model', model);
  this.set('router', router);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-quick-remove-content model=model router=router}}`
  );
  const $component = this.$('.gru-quick-remove-content');

  Object.keys(CONTENT_TYPES).forEach(
    function(question_type) {
      Ember.run(() => {
        this.set('model.type', CONTENT_TYPES[question_type]);
      });

      $component.find('.actions .remove').click();
    }.bind(this)
  );
});

test('show spinner button component while the server response, after clicking on the remove button', function(assert) {
  assert.expect(4);

  const model = {
    removeMethod: function() {
      assert.ok(true, 'Remove method invoked');
      return Ember.RSVP.resolve(true);
    },
    type: 'resource'
  };

  this.set('model', model);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(hbs`{{content/modals/gru-quick-remove-content model=model}}`);
  const $component = this.$('.gru-quick-remove-content');

  $component.find('.actions button.remove').click();

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions> button.remove').length,
      'Remove Button should not be visible'
    );
  });
});
