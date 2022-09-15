import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService('service:century-skill', 'Unit | Service | century-skill', {});

test('findCenturySkills', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'centurySkillAdapter',
    Ember.Object.create({
      getCenturySkills: function() {
        assert.ok(true, 'getCenturySkills() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'centurySkillSerializer',
    Ember.Object.create({
      normalizeCenturySkills: function(centuriesPayload) {
        assert.deepEqual({}, centuriesPayload, 'Wrong my centuries payload');
        return Ember.Object.create({
          '21-century-skills': []
        });
      }
    })
  );

  var done = assert.async();
  service.findCenturySkills().then(function() {
    done();
  });
});
