import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('search-filter', 'Integration | Component | search filter', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
  }
});

test('search-filter-default', function(assert) {
  const standards = Ember.A();
  standards.addObject(
    Ember.Object.create({
      libraryId: 1,
      name: 'CCSS',
      title: 'Common Core State Standard'
    })
  );
  standards.addObject(
    Ember.Object.create({
      libraryId: 2,
      name: 'CA SS',
      title: 'California State Standard'
    })
  );
  standards.addObject(
    Ember.Object.create({
      libraryId: 2,
      name: 'NGSS',
      title: 'Next Generation State Standard'
    })
  );

  this.set('standards', standards);

  this.render(hbs`{{search-filter standards=standards}}`); //render the component
  var $component = this.$(); //component dom element

  assert.expect(13); //making sure all asserts are called

  const $collectionButton = $component.find('.collections');
  T.exists(assert, $collectionButton, 'Missing collections button');
  T.exists(
    assert,
    $collectionButton.find('.icon'),
    'Missing icon collections button'
  );
  assert.equal(
    T.text($collectionButton.find('.text')),
    'Collections',
    'Incorrect collections button text'
  );

  const $assessmentsButton = $component.find('.assessments');
  T.exists(assert, $assessmentsButton, 'Missing assessments button');
  T.exists(
    assert,
    $assessmentsButton.find('.icon'),
    'Missing icon assessments button'
  );
  assert.equal(
    T.text($assessmentsButton.find('.text')),
    'Assessments',
    'Incorrect assessments button text'
  );

  const $resourcesButton = $component.find('.resources');
  T.exists(assert, $resourcesButton, 'Missing resources button');
  T.exists(
    assert,
    $resourcesButton.find('.icon'),
    'Missing icon resources button'
  );
  assert.equal(
    T.text($resourcesButton.find('.text')),
    'Resources',
    'Incorrect resources button text'
  );

  const $questionsButton = $component.find('.questions');
  T.exists(assert, $questionsButton, 'Missing questions button');
  T.exists(
    assert,
    $questionsButton.find('.icon'),
    'Missing icon questions button'
  );
  assert.equal(
    T.text($questionsButton.find('.text')),
    'Questions',
    'Incorrect questions button text'
  );

  const $standardsButton = $component.find('.standards button');
  T.exists(assert, $standardsButton, 'Missing standards button');
});

test('search-filter-onCollectionFilterClick', function(assert) {
  assert.expect(1); //making sure all asserts are called
  const standards = Ember.A();
  standards.addObject(
    Ember.Object.create({
      libraryId: 1,
      name: 'CCSS',
      title: 'Common Core State Standard'
    })
  );
  standards.addObject(
    Ember.Object.create({
      libraryId: 2,
      name: 'CA SS',
      title: 'California State Standard'
    })
  );
  standards.addObject(
    Ember.Object.create({
      libraryId: 2,
      name: 'NGSS',
      title: 'Next Generation State Standard'
    })
  );

  this.set('standards', standards);

  this.on('filterType', function(term, filterType) {
    assert.equal(filterType, 'collection', 'Incorrect assessment filter type');
  });

  this.render(
    hbs`{{search-filter standards=standards onFilterType='filterType' selectedFilterType='collection'}}`
  );

  var $component = this.$(); //component dom element

  const $collectionsFilterSelected = $component.find(
    '.collections.btn-search-filter.selected'
  );
  T.exists(
    assert,
    $collectionsFilterSelected,
    'Missing collection filter selected'
  );
});

test('search-filter-onAssessmentFilterClick', function(assert) {
  assert.expect(1); //making sure all asserts are called

  const standards = Ember.A();
  standards.addObject(
    Ember.Object.create({
      libraryId: 1,
      name: 'CCSS',
      title: 'Common Core State Standard'
    })
  );
  standards.addObject(
    Ember.Object.create({
      libraryId: 2,
      name: 'CA SS',
      title: 'California State Standard'
    })
  );
  standards.addObject(
    Ember.Object.create({
      libraryId: 2,
      name: 'NGSS',
      title: 'Next Generation State Standard'
    })
  );

  this.set('standards', standards);

  this.on('onFilterType', function(term, filterType) {
    assert.equal(filterType, 'assessment', 'Incorrect assessment filter type');
  });

  this.render(
    hbs`{{search-filter standards=standards onFilterType='filterType' selectedFilterType='assessment'}}`
  );

  var $component = this.$(); //component dom element

  const $assessmentsFilterSelected = $component.find(
    '.assessments.btn-search-filter.selected'
  );
  T.exists(
    assert,
    $assessmentsFilterSelected,
    'Missing assessment filter selected'
  );
});
