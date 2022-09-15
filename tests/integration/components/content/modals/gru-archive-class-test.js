import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent(
  'content/modals/gru-archive-class',
  'Integration | Component | content/modals/gru archive class',
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
      title: 'Class title'
    }
  };
  this.set('model', model);

  this.render(hbs`{{content/modals/gru-archive-class model=model}}`);

  const $component = this.$('.gru-archive-class');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title').length, 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('content.modals.archive-class.title').string,
    'Incorrect Title'
  );

  assert.ok($component.find('p.legend').length, 'Missing Archive Class Legend');
  assert.ok(
    $component.find('p.legend').text(),
    'You are about to archive your classroom Class title',
    'Incorrect legend'
  );
  assert.ok(
    $component.find('.archive-info').length,
    'Missing Archive Information'
  );
  assert.equal(
    $component.find('.archive-info ul li:eq(0) label span').text(),
    this.get('i18n').t('content.modals.archive-class.links-not-accessible')
      .string,
    'Incorrect text for first checkbox'
  );
  assert.equal(
    $component.find('.archive-info ul li:eq(1) label span').text(),
    this.get('i18n').t('content.modals.archive-class.students-no-access')
      .string,
    'Incorrect text for second checkbox'
  );
  assert.equal(
    $component.find('.archive-info ul li:eq(2) label span').text(),
    this.get('i18n').t('content.modals.archive-class.not-add-students').string,
    'Incorrect text for third checkbox'
  );

  assert.ok(
    $component.find('p.confirmation').length,
    'Missing Archive Confirmation'
  );
  assert.equal(
    $component.find('p.confirmation').text(),
    this.get('i18n').t('content.modals.archive-class.confirmation').string,
    'Incorrect Confirmation Text'
  );
  assert.ok(
    $component.find('.actions .cancel').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions .archive').length,
    'Missing Archive Button'
  );
  assert.equal(
    $component.find('.actions .archive').prop('disabled'),
    true,
    'Archive Button Should be disabled'
  );
});

test('it enables the archive button under the appropriate conditions', function(
  assert
) {
  const model = {
    content: {
      title: 'Class title'
    }
  };

  const validator = Ember.Object.create({
    check1: true,
    check2: true,
    check3: true
  });

  this.set('model', model);
  this.set('validator', validator);

  this.render(
    hbs`{{content/modals/gru-archive-class model=model validator=validator}}`
  );
  const $component = this.$('.gru-archive-class');
  assert.equal(
    $component.find('.actions .archive').prop('disabled'),
    false,
    'Archive Button Should be enabled'
  );
});

test('it calls a generic archive method and then a callback (if provided) after clicking on the archive button', function(
  assert
) {
  assert.expect(2);

  const model = {
    archiveMethod: function() {
      assert.ok(true, 'Archive method invoked');
      return Ember.RSVP.resolve(true);
    }
  };

  const validator = Ember.Object.create({
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
    hbs`{{content/modals/gru-archive-class model=model validator=validator}}`
  );
  const $component = this.$('.gru-archive-class');
  $component.find('.actions .archive').click();
});
