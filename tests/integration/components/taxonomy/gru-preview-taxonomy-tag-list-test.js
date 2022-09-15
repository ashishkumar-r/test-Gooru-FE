import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'taxonomy/gru-preview-taxonomy-tag-list',
  'Integration | Component | taxonomy/gru preview taxonomy tag list',
  {
    integration: true
  }
);

test('it renders all tags correctly', function(assert) {
  const standards = [
    Ember.Object.create({
      code: 'CA.SCI.9-12.LS.3a',
      frameworkCode: 'CA',
      id: 'CA.K12.SC-LS-G-03.01',
      parentTitle: 'Science',
      taxonomyLevel: 'standard',
      title: 'Students know how to predict the probable'
    }),
    Ember.Object.create({
      code: 'CA.SCI.9-12.LS.3a',
      frameworkCode: 'CA',
      id: 'CA.K12.SC-LS-G-03.02',
      parentTitle: 'Science',
      taxonomyLevel: 'standard',
      title: 'Students know how to predict the probable'
    })
  ];

  this.set('standards', standards);

  this.render(
    hbs`{{taxonomy/gru-preview-taxonomy-tag-list standards=standards}}`
  );

  const $component = this.$('.taxonomy.gru-preview-taxonomy-tag-list');
  assert.ok($component.length, 'Missing Component');
  assert.ok(
    !$component.find('.non-visible').length,
    'Non visible tags should not be visible'
  );

  assert.equal(
    $component.find('> .gru-taxonomy-tag').length,
    2,
    '2 tags should be visible'
  );
});

test('it renders max allowed tags correctly', function(assert) {
  const standards = [
    Ember.Object.create({
      code: 'CA.SCI.9-12.LS.3a',
      frameworkCode: 'CA',
      id: 'CA.K12.SC-LS-G-03.01',
      parentTitle: 'Science',
      taxonomyLevel: 'standard',
      title: 'Students know how to predict the probable'
    }),
    Ember.Object.create({
      code: 'CA.SCI.9-12.LS.3a',
      frameworkCode: 'CA',
      id: 'CA.K12.SC-LS-G-03.02',
      parentTitle: 'Science',
      taxonomyLevel: 'standard',
      title: 'Students know how to predict the probable'
    })
  ];

  this.set('standards', standards);

  this.render(
    hbs`{{taxonomy/gru-preview-taxonomy-tag-list standards=standards tagsVisible=1}}`
  );

  const $component = this.$('.taxonomy.gru-preview-taxonomy-tag-list');
  assert.ok($component.length, 'Missing Component');
  assert.ok(
    $component.find('.non-visible').length,
    'Non visible tags should be visible'
  );

  assert.equal(
    $component.find('> .gru-taxonomy-tag').length,
    1,
    'Number of Tags visible'
  );
});
