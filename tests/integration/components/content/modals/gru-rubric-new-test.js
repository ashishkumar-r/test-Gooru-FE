import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const rubricServiceMock = Ember.Service.extend({
  createRubric: function(rubricModel) {
    if (rubricModel) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'rubric-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Rubric creation failed');
    }
  }
});

moduleForComponent(
  'content/modals/gru-rubric-new',
  'Integration | Component | content/modals/gru rubric new',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');
      this.register('service:api-sdk/rubric', rubricServiceMock);
      this.inject.service('api-sdk/rubric');
    }
  }
);

test('New Rubric Layout', function(assert) {
  this.render(hbs`{{content/modals/gru-rubric-new}}`);

  const $component = this.$('.gru-rubric-new');
  assert.ok($component, 'Missing Component');
  assert.ok($component.find('h4.modal-title'), 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('common.create-rubric').string,
    'Incorrect Title'
  );
  assert.ok(
    $component.find('label span.required'),
    'Missing Collection Title label'
  );
  assert.equal(
    $component.find('label span.required').text(),
    this.get('i18n').t('common.rubric-title').string,
    'Incorrect Rubric Title Label'
  );
  assert.ok($component.find('label input'), 'Missing Rubric Title Input');
  assert.ok($component.find('actions .cancel'), 'Missing Cancel Button');
  assert.ok($component.find('actions .add'), 'Missing Add Button');
});

test('Validate if the collection title field is left blank', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-rubric-new}}`);

  const $component = this.$('.gru-rubric-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );
  $component.find('.actions button[type="submit"]').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Title error should be visible'
    );
    $titleField.find('input').val('Rubric Name');
    $titleField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        !$titleField.find('.error-messages .error').length,
        'Title error message was hidden'
      );
    });
  });
});
test('Validate if the Rubric Title field has only whitespaces', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-rubric-new}}`);

  const $component = this.$('.gru-rubric-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Rubric Title error message not visible'
  );

  $component.find('.actions button[type="submit"]').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Rubric Title error should be visible'
    );
    $titleField.find('input').val(' ');
    $component.find('.actions button[type="submi"]').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Rubric Title error message should be visible'
      );
    });
  });
});
test('Validate the character limit in the Rubric title field', function(assert) {
  this.render(hbs`{{content/modals/gru-rubric-new}}`);

  const maxLenValue = this.$('.gru-rubric-new .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});

test('Create a rubric', function(assert) {
  assert.expect(3);
  var transition;
  this.set('router', {
    transitionTo(route, rubricId) {
      transition = {
        route: route,
        rubric: rubricId
      };
    }
  });

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(hbs`{{content/modals/gru-rubric-new router=router}}`);

  const $component = this.$('.gru-rubric-new');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('rubric-title');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type="submit"]').click();

    return wait().then(function() {
      assert.equal(
        transition.route,
        'content.rubric.edit',
        'Transition to correct route'
      );
      assert.equal(transition.rubric.id, 'rubric-id', 'Correct rubric ID');
    });
  });
});

test('show spinner button component while the server response, after clicking on the create button', function(assert) {
  assert.expect(5);

  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, rubricId) {
      assert.ok(route, 'Has route');
      assert.ok(rubricId, 'Has rubricId');
    }
  });

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.set('isLoading', false);

  this.render(
    hbs`{{content/modals/gru-rubric-new router=router isLoading=isLoading }}`
  );

  const $component = this.$('.gru-rubric-new');

  const $titleField = $component.find('.gru-input.title');
  $titleField.find('input').val('rubric-title');
  $titleField.find('input').blur();

  $component.find('.actions .add').click();
  this.set('isLoading', true);

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions > button.add').length,
      'Create should not be visible'
    );
  });
});
