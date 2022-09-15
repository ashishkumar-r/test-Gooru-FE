import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-delete-question',
  'Integration | Component | content/modals/gru delete question',
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
    },
    type: 'question'
  };
  this.set('model', model);

  this.render(hbs`{{content/modals/gru-delete-question model=model}}`);

  const $component = this.$('.gru-delete-question');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    'Delete Question',
    'Incorrect Title'
  );

  assert.ok($component.find('p.legend').length, 'Missing Delete Course Legend');

  assert.equal(
    $component.find('p.legend').text(),
    'Confirm you want to permanently delete Test String',
    'Incorrect legend'
  );

  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions .delete').length,
    'Missing Delete Button'
  );
  assert.equal(
    $component.find('.actions .delete').prop('disabled'),
    false,
    'Delete Button Should be enable'
  );
});
test('it calls a generic delete method and then a callback (if provided) after clicking on the delete button', function(assert) {
  assert.expect(3);

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    },
    callback: {
      success: function() {
        assert.ok(true, 'Success callback run');
      }
    },
    type: 'question'
  };

  this.set('model', model);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(hbs`{{content/modals/gru-delete-question model=model}}`);
  const $component = this.$('.gru-delete-question');

  $component.find('.actions .delete').click();
});

test('it calls a generic delete method and then redirects (if a route is provided) after clicking on the delete button', function(assert) {
  assert.expect(4);

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    },
    redirect: {
      route: 'route.name',
      params: {
        id: '345'
      }
    },
    type: 'question'
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
    hbs`{{content/modals/gru-delete-question model=model router=router}}`
  );
  const $component = this.$('.gru-delete-question');

  $component.find('.actions .delete').click();
});

test('show spinner button component while the server response, after clicking on the delete button', function(assert) {
  assert.expect(4);

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    },
    type: 'question'
  };
  var isLoading = false;

  this.set('model', model);

  this.set('isLoading', isLoading);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-delete-question model=model isLoading=isLoading}}`
  );
  const $component = this.$('.gru-delete-question');

  $component.find('.actions> button.delete').click();
  this.set('isLoading', true);
  return wait().then(function() {
    assert.ok(
      $component.find('.actions> .gru-spinner-button').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions> button.delete').length,
      'Delete Button should not be visible'
    );
  });
});
