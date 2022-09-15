import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import TaxonomyRoot from 'gooru-web/models/taxonomy/taxonomy-root';

moduleForComponent(
  'gru-standard-picker',
  'Integration | Component | taxonomy/modals/gru standard picker',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
    }
  }
);

test('Standard picker layout - standard labels', function(assert) {
  var subjectStandards = TaxonomyTagData.create({
    id: 'term-123',
    code: 'ST.03',
    frameworkCode: 'GDF',
    parentTitle: 'Subject'
  });

  var subject = TaxonomyRoot.create({
    id: 'subject.K12.1',
    frameworkId: 'framework-1',
    title: 'Subject',
    subjectTitle: 'Subject 1.1',
    code: 'subject.K12.1-code',
    frameworks: []
  });

  var model = {
    selected: subjectStandards,
    subject: subject,
    standardLabel: true
  };

  this.set('model', model);

  this.render(hbs`{{taxonomy/modals/gru-standard-picker model=model}}`);

  const $component = this.$('.gru-standard-picker');
  assert.ok($component.length, 'Missing Component');
  const $title = $component.find('h4.modal-title');

  assert.ok($title, 'Missing Title');
  assert.equal(
    T.text($title),
    this.get('i18n').t('common.add-standards').string,
    'Wrong modal title'
  );
  assert.ok(
    $component.find('.gru-taxonomy-picker'),
    'Missing gru-taxonomy-picker component'
  );
});

test('Standard labels - from Search', function(assert) {
  var subjectStandards = TaxonomyTagData.create({
    id: 'term-123',
    code: 'ST.03',
    frameworkCode: 'GDF',
    parentTitle: 'Subject'
  });

  var subject = TaxonomyRoot.create({
    id: 'subject.K12.1',
    frameworkId: 'framework-1',
    title: 'Subject',
    subjectTitle: 'Subject 1.1',
    code: 'subject.K12.1-code',
    frameworks: []
  });

  var model = {
    selected: subjectStandards,
    subject: subject,
    standardLabel: true,
    fromSearch: true
  };

  this.set('model', model);

  this.render(hbs`{{taxonomy/modals/gru-standard-picker model=model}}`);

  const $component = this.$('.gru-standard-picker');
  const $title = $component.find('h4.modal-title');

  assert.ok($title, 'Missing Title');
  assert.equal(
    T.text($title),
    this.get('i18n').t('common.search-standards').string,
    'Wrong modal title'
  );
});

test('Competency labels', function(assert) {
  var subjectStandards = TaxonomyTagData.create({
    id: 'term-123',
    code: 'ST.03',
    frameworkCode: 'GDF',
    parentTitle: 'Subject'
  });

  var subject = TaxonomyRoot.create({
    id: 'subject.K12.1',
    frameworkId: 'framework-1',
    title: 'Subject',
    subjectTitle: 'Subject 1.1',
    code: 'subject.K12.1-code',
    frameworks: []
  });

  var model = {
    selected: subjectStandards,
    subject: subject,
    standardLabel: false
  };

  this.set('model', model);

  this.render(hbs`{{taxonomy/modals/gru-standard-picker model=model}}`);

  const $component = this.$('.gru-standard-picker');
  const $title = $component.find('h4.modal-title');

  assert.ok($title, 'Missing Title');
  assert.equal(
    T.text($title),
    this.get('i18n').t('common.add-competency').string,
    'Wrong modal title'
  );
});

test('Competency labels - from Search', function(assert) {
  var subjectStandards = TaxonomyTagData.create({
    id: 'term-123',
    code: 'ST.03',
    frameworkCode: 'GDF',
    parentTitle: 'Subject'
  });

  var subject = TaxonomyRoot.create({
    id: 'subject.K12.1',
    frameworkId: 'framework-1',
    title: 'Subject',
    subjectTitle: 'Subject 1.1',
    code: 'subject.K12.1-code',
    frameworks: []
  });

  var model = {
    selected: subjectStandards,
    subject: subject,
    standardLabel: false,
    fromSearch: true
  };

  this.set('model', model);

  this.render(hbs`{{taxonomy/modals/gru-standard-picker model=model}}`);

  const $component = this.$('.gru-standard-picker');
  const $title = $component.find('h4.modal-title');

  assert.ok($title, 'Missing Title');
  assert.equal(
    T.text($title),
    this.get('i18n').t('common.search-competency').string,
    'Wrong modal title'
  );
});
