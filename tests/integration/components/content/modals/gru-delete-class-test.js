import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-delete-class',
  'Integration | Component | content/modals/gru delete class',
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

  this.render(hbs`{{content/modals/gru-delete-class model=model}}`);

  const $component = this.$('.gru-delete-class');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    `${this.get('i18n').t('common.delete').string} ${this.get('i18n').t(
      'common.class'
    ).string}`,
    'Incorrect Title'
  );
  assert.ok($component.find('p.legend').length, 'Missing Delete Course Legend');
  assert.ok(
    $component.find('p.legend').text().indexOf(model.content.title) > -1,
    'Incorrect legend'
  );
  assert.ok(
    $component.find('.delete-info').length,
    'Missing Delete Information'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(0) label span').text(),
    this.get('i18n').t('common.delete-instructions.links-inaccessible').string,
    'Incorrect links inaccessible check'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(1) label span').text(),
    this.get('i18n').t('content.modals.delete-class.student-access').string,
    'Incorrect student access check'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(2) label span').text(),
    this.get('i18n').t('content.modals.delete-class.student-data-deleted')
      .string,
    'Incorrect content data deleted check'
  );
  assert.ok(
    $component.find('p.confirmation').length,
    'Missing Delete Confirmation'
  );
  assert.equal(
    $component.find('p.confirmation').text(),
    this.get('i18n').t('content.modals.delete-content.confirmation').string,
    'Incorrect Confirmation Text'
  );
  assert.ok($component.find('.delete-input').length, 'Missing Delete Input');
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
    true,
    'Delete Button Should be disabled'
  );
});
test('it enables the delete button under the appropriate conditions', function(
  assert
) {
  const model = {
    content: {
      title: 'Class Title'
    }
  };

  const validator = Ember.Object.create({
    confirm: 'delete',
    check1: true,
    check2: true,
    check3: true
  });

  this.set('model', model);
  this.set('validator', validator);

  this.render(
    hbs`{{content/modals/gru-delete-class model=model validator=validator}}`
  );
  const $component = this.$('.gru-delete-class');
  assert.equal(
    $component.find('.actions .delete').prop('disabled'),
    false,
    'Delete Button Should be enabled'
  );
});

test('it calls a generic delete method and then redirects', function(assert) {
  assert.expect(3);

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    }
  };

  const validator = Ember.Object.create({
    confirm: 'delete',
    check1: true,
    check2: true,
    check3: true
  });

  const router = {
    transitionTo: function(route) {
      assert.ok(route, 'Should have route');
    }
  };

  this.set('model', model);
  this.set('validator', validator);
  this.set('router', router);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-delete-class model=model validator=validator router=router}}`
  );
  const $component = this.$('.gru-delete-class');
  $component.find('.actions .delete').click();
});

test('show spinner button component while the server response, after clicking on the delete button', function(
  assert
) {
  assert.expect(4);

  var isLoading = false;

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    }
  };

  const validator = Ember.Object.create({
    confirm: 'delete',
    check1: true,
    check2: true,
    check3: true
  });

  this.set('model', model);
  this.set('validator', validator);
  this.set('isLoading', isLoading);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-delete-class model=model validator=validator isLoading=isLoading}}`
  );
  const $component = this.$('.gru-delete-class');

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
