import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-remove-content',
  'Integration | Component | content/modals/gru remove content',
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
    type: CONTENT_TYPES.RESOURCE
  };
  this.set('model', model);

  this.render(hbs`{{content/modals/gru-remove-content model=model}}`);

  const $component = this.$('.gru-remove-content');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    `${this.get('i18n').t('common.remove').string} ${this.get('i18n').t(
      `common.${model.type}`
    ).string}`,
    'Incorrect Title'
  );
  assert.ok($component.find('p.legend').length, 'Missing Delete Course Legend');
  assert.ok(
    $component.find('p.legend').text().indexOf(model.content.title) > -1,
    'Incorrect legend'
  );
  assert.ok(
    $component.find('.remove-info').length,
    'Missing Delete Information'
  );
  assert.equal(
    $component.find('.remove-info ul li:eq(0) label span').text(),
    this.get('i18n').t('common.delete-instructions.links-inaccessible').string,
    'Incorrect links inaccessible check'
  );
  assert.equal(
    $component.find('.remove-info ul li:eq(1) label span').text(),
    this.get('i18n').t('common.delete-instructions.content-inaccessible')
      .string,
    'Incorrect content inaccessible check'
  );

  assert.ok(
    $component.find('p.confirmation').length,
    'Missing Delete Confirmation'
  );
  assert.equal(
    $component.find('p.confirmation').text(),
    this.get('i18n').t('content.modals.remove-content.confirmation').string,
    'Incorrect Confirmation Text'
  );
  assert.ok($component.find('.remove-input').length, 'Missing Remove Input');
  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions .remove').length,
    'Missing Remove Button'
  );
  assert.equal(
    $component.find('.actions .remove').prop('disabled'),
    true,
    'Remove Button Should be disabled'
  );
});

test('it calls a generic remove method and then a callback (if provided) after clicking on the remove button from resource', function(
  assert
) {
  assert.expect(3);

  const model = {
    removeMethod: function() {
      assert.ok(true, 'Remove method invoked');
      return Ember.RSVP.resolve(true);
    },
    callback: {
      success: function() {
        assert.ok(true, 'Success callback run');
      }
    },
    type: CONTENT_TYPES.RESOURCE
  };

  const validator = Ember.Object.create({
    confirm: 'remove',
    check1: true,
    check2: true
  });

  this.set('model', model);
  this.set('validator', validator);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-remove-content model=model validator=validator}}`
  );
  const $component = this.$('.gru-remove-content');
  $component.find('.actions .remove').click();
});

test('it calls a generic delete method and then redirects (if a route is provided) after clicking on the remove button', function(
  assert
) {
  assert.expect(4);

  const model = {
    removeMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    },
    redirect: {
      route: 'route.name',
      params: {
        id: '345'
      }
    },
    type: CONTENT_TYPES.RESOURCE
  };

  const validator = Ember.Object.create({
    confirm: 'remove',
    check1: true,
    check2: true
  });

  const router = {
    transitionTo: function(route, id) {
      assert.ok(route, 'Should have route');
      assert.ok(id, 'Should have id');
    }
  };

  this.set('model', model);
  this.set('validator', validator);
  this.set('router', router);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-remove-content model=model validator=validator router=router}}`
  );
  const $component = this.$('.gru-remove-content');
  $component.find('.actions .remove').click();
});

test('show spinner button component while the server response, after clicking on the remove button from resource', function(
  assert
) {
  assert.expect(5);

  var isLoading = false;

  const model = {
    removeMethod: function() {
      assert.ok(true, 'Remove method invoked');
      return Ember.RSVP.resolve(true);
    },
    callback: {
      success: function() {
        assert.ok(true, 'Success callback run');
      }
    },
    type: CONTENT_TYPES.RESOURCE
  };

  const validator = Ember.Object.create({
    confirm: 'remove',
    check1: true,
    check2: true
  });

  this.set('model', model);
  this.set('validator', validator);
  this.set('isLoading', isLoading);

  this.render(
    hbs`{{content/modals/gru-remove-content model=model validator=validator isLoading=isLoading}}`
  );
  const $component = this.$('.gru-remove-content');

  assert.ok(
    $component.find('.actions button.remove').length,
    'Remove Button should be visible'
  );

  $component.find('.actions button.remove').click();

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button').length,
      'Missing gru-spinner-button component '
    );
    assert.ok(
      !$component.find('.actions> button.remove').length,
      'Remove Button should not be visible'
    );
  });
});
