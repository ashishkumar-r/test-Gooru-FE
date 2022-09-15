import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-delete-rubric',
  'Integration | Component | content/modals/gru delete rubric',
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

  this.render(hbs`{{content/modals/gru-delete-rubric model=model}}`);

  const $component = this.$('.gru-delete-rubric');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');

  assert.equal(
    $component.find('h4.modal-title').text(),
    `${this.get('i18n').t('common.delete').string} ${this.get('i18n').t(
      'common.rubric'
    ).string}`,
    'Incorrect Title'
  );

  assert.ok($component.find('p.legend').length, 'Missing Delete Course Legend');

  assert.equal(
    $component.find('p.legend').text(),
    'Confirm you want to permanently delete Test String',
    'Incorrect legend'
  );

  assert.ok(
    $component.find('.delete-info').length,
    'Missing Delete Information'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(0) label span').text(),
    this.get('i18n').t('content.modals.delete-rubric.first-check').string,
    'Incorrect first check warning'
  );

  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions .delete').length,
    'Missing Delete Button'
  );
  assert.ok(
    $component.find('.actions .delete').prop('disabled'),
    'Delete Button Should be disabled'
  );
});

test('it enables the delete button under the appropriate conditions', function(
  assert
) {
  const model = {
    content: {
      title: 'Course Title'
    },
    callback: null
  };

  const validator = Ember.Object.create({
    check1: false
  });

  this.set('model', model);
  this.set('validator', validator);

  this.render(
    hbs`{{content/modals/gru-delete-rubric model=model validator=validator}}`
  );
  const $component = this.$('.gru-delete-rubric');
  assert.ok(
    $component.find('.actions .delete').prop('disabled'),
    'Delete Button Should be enabled'
  );

  Ember.run(() => validator.set('check1', true));
  assert.notOk(
    $component.find('.actions .delete').prop('disabled'),
    'Delete Button Should be enabled'
  );
});

test('it calls a generic delete method and then redirects (if a route is provided) after clicking on the delete button', function(
  assert
) {
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
    }
  };

  const validator = Ember.Object.create({
    check1: true
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
    hbs`{{content/modals/gru-delete-rubric model=model validator=validator router=router}}`
  );
  const $component = this.$('.gru-delete-rubric');
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
    },
    type: 'resource'
  };

  const validator = Ember.Object.create({
    check1: true
  });

  this.set('model', model);
  this.set('validator', validator);
  this.set('isLoading', isLoading);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-delete-rubric model=model validator=validator isLoading=isLoading}}`
  );
  const $component = this.$('.gru-delete-rubric');

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
