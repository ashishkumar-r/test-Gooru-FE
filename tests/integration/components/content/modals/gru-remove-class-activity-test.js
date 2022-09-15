import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-remove-class-activity',
  'Integration | Component | content/modals/gru remove class activity',
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
    type: 'course'
  };

  this.set('model', model);

  this.render(hbs`{{content/modals/gru-remove-class-activity model=model}}`);

  const $component = this.$('.gru-remove-class-activity');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');
  assert.ok(
    $component.find('p.confirmation').length,
    'Missing Delete Course Legend'
  );
  assert.ok(
    $component.find('p.confirmation').text().indexOf(model.type) > -1,
    'Incorrect confirmation'
  );
  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions .delete').length,
    'Missing Delete Button'
  );
});

test('it calls a generic delete method and then a callback (if provided) after clicking on the delete button', function(
  assert
) {
  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
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

  this.render(hbs`{{content/modals/gru-remove-class-activity model=model}}`);
  const $component = this.$('.gru-remove-class-activity');

  $component.find('.actions .delete').click();
});

test('show spinner button component while the server response, after clicking on the delete button', function(
  assert
) {
  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    }
  };

  this.set('model', model);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(hbs`{{content/modals/gru-remove-class-activity model=model}}`);
  const $component = this.$('.gru-remove-class-activity');

  $component.find('.actions button.delete').click();

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions> button.delete').length,
      'Delete Button should not be visible'
    );
  });
});
