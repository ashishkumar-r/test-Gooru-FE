import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';
import ClassModel from 'gooru-web/models/content/class';

import { validator, buildValidations } from 'ember-cp-validations';

const FloatValidation = buildValidations({
  minScore: {
    validators: [
      validator('number', {
        allowBlank: true,
        integer: false,
        gte: 0,
        lte: 100,
        message: '{{description}}',
        descriptionKey: 'common.errors.class-min-score'
      })
    ]
  }
});

moduleForComponent(
  'gru-input-number',
  'Integration | Component | gru input number',
  {
    integration: true
  }
);

test('number input invalid', function(assert) {
  assert.expect(5); // making sure all asserts are called

  this.set(
    'model',
    ClassModel.create(Ember.getOwner(this).ownerInjection(), {
      minScore: null
    })
  );
  this.render(
    hbs`{{validation/gru-input-number model=model valuePath='minScore' min=1 max=100 step=1}}`
  ); // render the component
  var $component = this.$(); // component dom element
  var $input = $component.find('input[type=number]');

  T.exists(assert, $input, 'Input number element not found');
  assert.equal($input.val(), '', 'Wrong value');

  $input.val('1.1');
  $input.blur();

  return wait().then(function() {
    assert.ok(
      $component.find('.error-messages .error').length,
      'Input error message should not be hidden'
    );

    $input.val('10');
    $input.blur();
    return wait().then(function() {
      assert.ok(
        !$component.find('.error-messages .error').length,
        'Input error message should be hidden'
      );

      $input.val('11e20');
      $input.blur();

      return wait().then(function() {
        assert.ok(
          $component.find('.error-messages .error').length,
          'Input error message should not be hidden'
        );
      });
    });
  });
});

test('number input range', function(assert) {
  assert.expect(7); // making sure all asserts are called

  this.set(
    'model',
    ClassModel.create(Ember.getOwner(this).ownerInjection(), {
      minScore: null
    })
  );
  this.render(
    hbs`{{validation/gru-input-number model=model valuePath='minScore' min=1 max=9 step=1}}`
  ); // render the component
  var $component = this.$(); // component dom element
  var $input = $component.find('input[type=number]');

  T.exists(assert, $input, 'Input number element not found');
  assert.equal($input.val(), '', 'Wrong value');
  $input.blur();

  return wait().then(function() {
    assert.ok(
      $component.find('.error-messages .error').length,
      'Input error message should not be hidden'
    );

    $input.val('10');
    $input.blur();
    return wait().then(function() {
      assert.ok(
        !$component.find('.error-messages .error').length,
        'Input error message should be hidden'
      );

      $input.val('1');
      $input.blur();

      return wait().then(function() {
        assert.ok(
          !$component.find('.error-messages .error').length,
          'Input error message should be hidden'
        );

        $input.val('-11');
        $input.blur();

        return wait().then(function() {
          assert.ok(
            $component.find('.error-messages .error').length,
            'Input error message should be hidden'
          );
          $input.val('8');
          $input.blur();

          return wait().then(function() {
            assert.ok(
              !$component.find('.error-messages .error').length,
              'Input error message should be hidden'
            );
          });
        });
      });
    });
  });
});
test('Accept float numbers with increment of 0.5', function(assert) {
  assert.expect(4);

  var validation = ClassModel.extend(FloatValidation);

  this.set(
    'model',
    validation.create(Ember.getOwner(this).ownerInjection(), {
      minScore: -1
    })
  );
  this.render(
    hbs`{{validation/gru-input-number model=model valuePath='minScore' min=0 max=10 step='0.5'}}`
  ); // render the component
  var $component = this.$(); // component dom element
  var $input = $component.find('input[type=number]');

  T.exists(assert, $input, 'Input number element not found');
  assert.equal($input.val(), '-1', 'Wrong value');
  $input.blur();

  return wait().then(function() {
    assert.ok(
      $component.find('.error-messages .error').length,
      'Input error message should not be hidden'
    );

    $input.val('0.5');
    $input.blur();
    return wait().then(function() {
      assert.ok(
        !$component.find('.error-messages .error').length,
        'Input error message should be hidden'
      );
    });
  });
});

test('Not allow float numbers with increment of 1', function(assert) {
  assert.expect(3);

  const IntValidation = buildValidations({
    minScore: {
      validators: [
        validator('number', {
          allowBlank: true,
          integer: true,
          gte: 0,
          lte: 100,
          message: '{{description}}',
          descriptionKey: 'common.errors.class-min-score'
        })
      ]
    }
  });

  var validation = ClassModel.extend(IntValidation);

  this.set(
    'model',
    validation.create(Ember.getOwner(this).ownerInjection(), {
      minScore: 0.5
    })
  );
  this.render(
    hbs`{{validation/gru-input-number model=model valuePath='minScore' min=0 max=10 step='1'}}`
  );
  var $component = this.$();
  var $input = $component.find('input[type=number]');

  T.exists(assert, $input, 'Input number element not found');
  assert.equal($input.val(), '0.5', 'Wrong value');
  $input.blur();

  return wait().then(function() {
    assert.ok(
      $component.find('.error-messages .error').length,
      'Input error message should not be hidden'
    );
  });
});
