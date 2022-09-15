import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'content/modals/gru-remove-student',
  'Integration | Component | content/modals/gru remove student',
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
      fullName: 'Full Name'
    }
  };
  this.set('model', model);

  this.render(hbs`{{content/modals/gru-remove-student model=model}}`);

  const $component = this.$('.gru-remove-student');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('content.modals.remove-student.title').string,
    'Incorrect Title'
  );
  assert.ok($component.find('p.legend').length, 'Missing Delete Course Legend');
  assert.ok(
    $component.find('p.legend').text().indexOf(model.content.fullName) > -1,
    'Incorrect legend'
  );
  assert.ok(
    $component.find('.delete-info').length,
    'Missing Delete Information'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(0) label span').text(),
    this.get('i18n').t('content.modals.remove-student.data-inaccessible')
      .string,
    'Incorrect links inaccessible check'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(1) label span').text(),
    this.get('i18n').t('content.modals.remove-student.classroom-access').string,
    'Incorrect student access check'
  );
  assert.equal(
    $component.find('.delete-info ul li:eq(2) label span').text(),
    this.get('i18n').t('content.modals.remove-student.data-lost').string,
    'Incorrect content data deleted check'
  );
  assert.ok(
    $component.find('p.confirmation').length,
    'Missing Delete Confirmation'
  );
  assert.equal(
    $component.find('p.confirmation').text(),
    this.get('i18n').t('content.modals.remove-student.confirmation').string,
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
    hbs`{{content/modals/gru-remove-student model=model validator=validator}}`
  );
  const $component = this.$('.gru-remove-student');
  assert.equal(
    $component.find('.actions .delete').prop('disabled'),
    false,
    'Delete Button Should be enabled'
  );
});

test('it calls a  remove method and then a callback (if provided) after clicking on the remove button from resource', function(
  assert
) {
  assert.expect(3);

  const model = {
    deleteMethod: function() {
      assert.ok(true, 'Remove method invoked');
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
    hbs`{{content/modals/gru-remove-student model=model validator=validator}}`
  );
  const $component = this.$('.gru-remove-student');
  $component.find('.actions .delete').click();
});
