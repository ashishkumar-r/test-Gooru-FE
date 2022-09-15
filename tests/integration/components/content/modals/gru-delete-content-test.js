import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-delete-content',
  'Integration | Component | content/modals/gru delete content',
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

  this.render(hbs`{{content/modals/gru-delete-content model=model}}`);

  const $component = this.$('.gru-delete-content');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');

  Object.keys(CONTENT_TYPES).forEach(
    function(content_type) {
      Ember.run(() => {
        this.set('model.type', CONTENT_TYPES[content_type]);
      });

      var hasWarning =
        content_type !== 'QUESTION' && content_type !== 'RESOURCE';

      assert.equal(
        $component.find('h4.modal-title').text(),
        `${this.get('i18n').t('common.delete').string} ${
          this.get('i18n').t(`common.${model.type}`).string
        }`,
        'Incorrect Title'
      );
      if (hasWarning) {
        assert.equal(
          $component.find('.delete-info ul li:eq(2) label span').text(),
          this.get('i18n').t('content.modals.delete-content.delete-warning', {
            type: this.get('i18n').t(`common.${model.type}`).string
          }).string,
          'Incorrect content warning'
        );
      }
    }.bind(this)
  );

  assert.ok($component.find('p.legend').length, 'Missing Delete Course Legend');
  assert.ok(
    $component
      .find('p.legend')
      .text()
      .indexOf(model.content.title) > -1,
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

test('it enables the delete button under the appropriate conditions', function(assert) {
  const model = {
    content: {
      title: 'Course Title'
    },
    type: 'course',
    callback: null
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
    hbs`{{content/modals/gru-delete-content model=model validator=validator}}`
  );
  const $component = this.$('.gru-delete-content');
  assert.equal(
    $component.find('.actions .delete').prop('disabled'),
    false,
    'Delete Button Should be enabled'
  );
});

test('it calls a generic delete method and then a callback (if provided) after clicking on the delete button', function(assert) {
  assert.expect(36);

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

  const validator = Ember.Object.create({
    confirm: 'delete',
    check1: true,
    check2: true,
    check3: true
  });

  this.set('model', model);
  this.set('validator', validator);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-delete-content model=model validator=validator}}`
  );
  const $component = this.$('.gru-delete-content');

  Object.keys(CONTENT_TYPES).forEach(
    function(question_type) {
      Ember.run(() => {
        this.set('model.type', CONTENT_TYPES[question_type]);
      });

      $component.find('.actions .delete').click();
    }.bind(this)
  );
});

test('it calls a generic delete method and then redirects (if a route is provided) after clicking on the delete button', function(assert) {
  assert.expect(48);

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
    confirm: 'delete',
    check1: true,
    check2: true,
    check3: true
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
    hbs`{{content/modals/gru-delete-content model=model validator=validator router=router}}`
  );
  const $component = this.$('.gru-delete-content');

  Object.keys(CONTENT_TYPES).forEach(
    function(question_type) {
      Ember.run(() => {
        this.set('model.type', CONTENT_TYPES[question_type]);
      });

      $component.find('.actions .delete').click();
    }.bind(this)
  );
});

test('show spinner button component while the server response, after clicking on the delete button', function(assert) {
  assert.expect(4);

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Delete method invoked');
      return Ember.RSVP.resolve(true);
    },
    type: 'resource'
  };

  const validator = Ember.Object.create({
    confirm: 'delete',
    check1: true,
    check2: true,
    check3: true
  });

  this.set('model', model);
  this.set('validator', validator);

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.render(
    hbs`{{content/modals/gru-delete-content model=model validator=validator}}`
  );
  const $component = this.$('.gru-delete-content');

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
