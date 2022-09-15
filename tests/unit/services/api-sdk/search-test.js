import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/search',
  'Unit | Service | api-sdk/search',
  {
    // needs: []
  }
);

test('searchCollections', function(assert) {
  const service = this.subject();

  assert.expect(4);
  service.set(
    'searchAdapter',
    Ember.Object.create({
      searchCollections: function(term, params) {
        assert.equal(term, 'the-term', 'Wrong search collections term');
        assert.equal(params.page, 1, 'Wrong page');
        assert.deepEqual(params.taxonomies, ['a', 'b'], 'Wrong taxonomies');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'searchSerializer',
    Ember.Object.create({
      normalizeSearchCollections: function(payload) {
        assert.deepEqual({}, payload, 'Wrong search collections payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .searchCollections('the-term', { page: 1, taxonomies: ['a', 'b'] })
    .then(function() {
      done();
    });
});

test('searchAssessments', function(assert) {
  const service = this.subject();

  assert.expect(4);
  service.set(
    'searchAdapter',
    Ember.Object.create({
      searchAssessments: function(term, params) {
        assert.equal(term, 'the-term', 'Wrong search collections term');
        assert.equal(params.page, 1, 'Wrong page');
        assert.deepEqual(params.taxonomies, ['a', 'b'], 'Wrong taxonomies');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'searchSerializer',
    Ember.Object.create({
      normalizeSearchAssessments: function(payload) {
        assert.deepEqual({}, payload, 'Wrong search collections payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .searchAssessments('the-term', { page: 1, taxonomies: ['a', 'b'] })
    .then(function() {
      done();
    });
});

test('searchResources', function(assert) {
  const service = this.subject();

  assert.expect(6);

  service.set(
    'searchAdapter',
    Ember.Object.create({
      searchResources: function(term, params) {
        assert.equal(term, 'the-term', 'Wrong search resources term');
        assert.equal(params.page, 2, 'Wrong page');
        assert.deepEqual(
          params.formats,
          ['image', 'interactive', 'question'],
          'Wrong categories value'
        );
        assert.deepEqual(params.taxonomies, ['a', 'b'], 'Wrong taxonomies');
        assert.ok(true, 'searchResources() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'searchSerializer',
    Ember.Object.create({
      normalizeSearchResources: function(payload) {
        assert.deepEqual({}, payload, 'Wrong search resources payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .searchResources('the-term', {
      page: 2,
      formats: ['image', 'interactive', 'question'],
      taxonomies: ['a', 'b']
    })
    .then(function() {
      done();
    });
});

test('searchQuestions', function(assert) {
  const service = this.subject();

  assert.expect(6);

  service.set(
    'searchAdapter',
    Ember.Object.create({
      searchQuestions: function(term, params) {
        assert.equal(term, 'the-term', 'Wrong search resources term');
        assert.equal(params.page, 2, 'Wrong page');
        assert.deepEqual(
          params.types,
          ['a', 'b', 'c'],
          'Wrong categories value'
        );
        assert.deepEqual(params.taxonomies, ['a', 'b'], 'Wrong taxonomies');
        assert.ok(true, 'searchQuestions() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'searchSerializer',
    Ember.Object.create({
      normalizeSearchQuestions: function(payload) {
        assert.deepEqual({}, payload, 'Wrong search resources payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .searchQuestions('the-term', {
      page: 2,
      types: ['a', 'b', 'c'],
      taxonomies: ['a', 'b']
    })
    .then(function() {
      done();
    });
});

test('searchFeaturedCourses', function(assert) {
  const service = this.subject();

  assert.expect(3);

  service.set(
    'searchAdapter',
    Ember.Object.create({
      searchFeaturedCourses: function(term) {
        assert.equal(term, 'the-term', 'Wrong search course term');
        assert.ok(true, 'searchFeaturedCourses() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'searchSerializer',
    Ember.Object.create({
      normalizeSearchCourses: function(payload) {
        assert.deepEqual({}, payload, 'Wrong search courses payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.searchFeaturedCourses('the-term').then(function() {
    done();
  });
});

test('searchCourses', function(assert) {
  const service = this.subject();

  assert.expect(3);

  service.set(
    'searchAdapter',
    Ember.Object.create({
      searchCourses: function(term) {
        assert.equal(term, 'the-term', 'Wrong search course term');
        assert.ok(true, 'searchCourses() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'searchSerializer',
    Ember.Object.create({
      normalizeSearchCourses: function(payload) {
        assert.deepEqual({}, payload, 'Wrong search courses payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.searchCourses('the-term').then(function() {
    done();
  });
});
