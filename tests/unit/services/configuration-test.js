import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import FeaturesConfiguration from 'gooru-web/config/env/features';

moduleForService('service:configuration', 'Unit | Service | configuration', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

test('loadConfiguration', function(assert) {
  const service = this.subject();
  assert.expect(6);

  service.set(
    'configurationAdapter',
    Ember.Object.create({
      loadConfiguration: function(key, configBaseUrl) {
        assert.equal(key, 'localhost', 'loadConfiguration function was called');
        assert.equal(
          configBaseUrl,
          null,
          'no config url was provided, it should ne null'
        );
        return Ember.RSVP.resolve({
          teams: {
            url: 'any'
          }
        });
      },
      reservedWords: function(configBaseUrl) {
        assert.equal(
          configBaseUrl,
          null,
          'no config url was provided, it should ne null'
        );
        return Ember.RSVP.resolve({
          reservedWords: ['about']
        });
      }
    })
  );

  var done = assert.async();
  service.loadConfiguration().then(function(configuration) {
    assert.equal(
      configuration.get('endpoint.url'),
      'http://localhost:7357',
      'endpoints.url should match config/env/test.js value'
    );
    assert.equal(
      configuration.get('teams.url'),
      'any',
      'teams.url was not overridden'
    );

    //checking default features
    assert.deepEqual(
      configuration.get('features'),
      FeaturesConfiguration.features,
      'features should not be affected'
    );
    done();
  });
});

test('loadConfiguration - default features loaded', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'configurationAdapter',
    Ember.Object.create({
      loadConfiguration: function() {
        return Ember.RSVP.resolve({});
      },
      reservedWords: function() {
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.loadConfiguration().then(function(configuration) {
    //checking default features
    const defaultFeatures = {
      header: {
        enabled: true
      },
      collections: {
        player: {
          showReactionBar: true,
          showReportLink: true,
          showBackLink: true,
          showRemix: true,
          showCollectionName: true,
          showCollectionAuthor: true,
          showResourceNumber: true,
          showQuestionFeedback: undefined,
          allowProfileNavigation: true
        }
      }
    };
    //making sure default features are not affected
    assert.deepEqual(
      configuration.get('features'),
      defaultFeatures,
      'features should not be affected'
    );
    done();
  });
});

test('loadConfiguration with config url', function(assert) {
  const service = this.subject();
  assert.expect(6);

  service.set(
    'configurationAdapter',
    Ember.Object.create({
      loadConfiguration: function(key, configBaseUrl) {
        assert.equal(key, 'localhost', 'loadConfiguration function was called');
        assert.equal(configBaseUrl, 'any-url', 'wrong config url');
        return Ember.RSVP.resolve({
          teams: {
            url: 'any'
          }
        });
      },
      reservedWords: function(configBaseUrl) {
        assert.equal(configBaseUrl, 'any-url', 'wrong config url');
        return Ember.RSVP.resolve({
          reservedWords: ['about']
        });
      }
    })
  );

  var done = assert.async();
  service.loadConfiguration('any-url').then(function(configuration) {
    assert.equal(
      configuration.get('endpoint.url'),
      'http://localhost:7357',
      'endpoints.url should match config/env/test.js value'
    );
    assert.equal(
      configuration.get('teams.url'),
      'any',
      'teams.url was not overridden'
    );

    //checking default features
    assert.deepEqual(
      configuration.get('features'),
      FeaturesConfiguration.features,
      'features should not be affected'
    );

    done();
  });
});
