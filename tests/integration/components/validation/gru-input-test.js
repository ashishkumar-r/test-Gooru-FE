import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';
import SearchModel from 'gooru-web/models/search/content-search';

moduleForComponent('gru-input', 'Integration | Component | gru input', {
  integration: true
});

test('Layout and clear functionality', function(assert) {
  assert.expect(8); // making sure all asserts are called

  this.set(
    'model',
    SearchModel.create(Ember.getOwner(this).ownerInjection(), {
      term: ''
    })
  );
  this.render(
    hbs`{{validation/gru-input model=model valuePath='term' hasClearButton=true inputId='any-id' isRequired=true}}`
  ); // render the component
  var $component = this.$(); // component dom element
  var $input = $component.find('input[type=text]');

  T.exists(assert, $input, 'Input element not found');
  assert.equal($input.val(), '', 'Wrong value');
  assert.equal($input.attr('id'), 'any-id', 'Missing id');
  assert.equal($input.attr('aria-required'), 'true', 'Missing aria required');

  $input.val('So');
  $input.blur();

  return wait().then(function() {
    assert.ok(
      $component.find('.error-messages .error').length,
      'Input error message was hidden'
    );

    $input.val('Sol');
    $input.blur();
    return wait().then(function() {
      assert.ok(
        !$component.find('.error-messages .error').length,
        'Input error message was not hidden'
      );

      $input.val('So');
      $input.blur();

      return wait().then(function() {
        assert.ok(
          $component.find('.error-messages .error').length,
          'Input error message was hidden'
        );
        $component.find('.clear').click();
        assert.equal($input.val(), '', 'wrong value');
      });
    });
  });
});

test('Testing events and observer', function(assert) {
  assert.expect(4);
  this.set(
    'model',
    SearchModel.create(Ember.getOwner(this).ownerInjection(), {
      value: ''
    })
  );
  this.render(
    hbs`{{validation/gru-input model=model valuePath='value' hasClearButton=true}}`
  ); // render the component
  var $component = this.$();
  var $input = $component.find('input[type=text]');
  var $clear = $component.find('span.clear');
  var e = $.Event('keyup');

  $clear.click();
  return wait().then(function() {
    assert.equal(
      $input.val(),
      '',
      'After a clear event the input value should be empty'
    );

    $input.val('Hello World');
    e.which = 13; //ENTER
    $input.trigger(e);
    return wait().then(function() {
      assert.equal(
        $input.val(),
        'Hello World',
        'After the Enter key has been pressed, the input value should be equal to the value property'
      );

      e.which = 65; //A
      $input.trigger(e);
      return wait().then(function() {
        assert.equal(
          $component.find('.error-messages .error').length,
          0,
          'When pressing characters other than Enter, the isTyping property should be true, so there\'s no error message even if it\'s not a valid url'
        );

        e.which = 72; //H
        $input.trigger(e);
        e.which = 101; //e
        $input.trigger(e);
        e.which = 108; //l
        $input.trigger(e);
        e.which = 108; //l
        $input.trigger(e);
        e.which = 111; //o
        $input.trigger(e);
        e.which = 32; //[space]
        $input.trigger(e);
        e.which = 87; //W
        $input.trigger(e);
        e.which = 111; //o
        $input.trigger(e);
        e.which = 114; //r
        $input.trigger(e);
        e.which = 108; //l
        $input.trigger(e);
        e.which = 100; //d
        $input.trigger(e);
        return wait().then(function() {
          assert.equal(
            $input.val(),
            'Hello World',
            'The input should accept all values, even when the url is invalid.'
          );
        });
      });
    });
  });
});
