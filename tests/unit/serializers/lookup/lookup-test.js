import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:lookup/lookup',
  'Unit | Serializer | lookup/lookup'
);

test('normalizeReadAudiences', function(assert) {
  const serializer = this.subject();
  const data = {
    audience: [
      {
        id: '1',
        label: 'AA',
        sequence_id: 1
      },
      {
        id: '2',
        label: 'BB',
        sequence_id: 2
      }
    ]
  };

  const audiences = serializer.normalizeReadAudiences(data);
  assert.equal(audiences.length, 2, 'Wrong audiences length');
  assert.equal(audiences[0].get('id'), '1', 'Wrong id');
  assert.equal(audiences[0].get('name'), 'AA', 'Wrong name');
  assert.equal(audiences[0].get('order'), 1, 'Wrong order');
});

test('normalizeReadLicenses', function(assert) {
  const serializer = this.subject();
  const data = {
    license: [
      {
        id: '1',
        label: 'AA',
        sequence_id: 1
      },
      {
        id: '2',
        label: 'BB',
        sequence_id: 2
      }
    ]
  };

  const licenses = serializer.normalizeReadLicenses(data);
  assert.equal(licenses.length, 2, 'Wrong licenses length');
  assert.equal(licenses[0].get('id'), '1', 'Wrong id');
  assert.equal(licenses[0].get('name'), 'AA', 'Wrong name');
  assert.equal(licenses[0].get('order'), 1, 'Wrong order');
});

test('normalizeReadDepthOfKnowledgeItems', function(assert) {
  const serializer = this.subject();
  const data = {
    depth_of_knowledge: [
      {
        id: '1',
        label: 'AA',
        sequence_id: 1
      },
      {
        id: '2',
        label: 'BB',
        sequence_id: 2
      }
    ]
  };

  const dok = serializer.normalizeReadDepthOfKnowledgeItems(data);
  assert.equal(dok.length, 2, 'Wrong dok length');
  assert.equal(dok[0].get('id'), '1', 'Wrong id');
  assert.equal(dok[0].get('name'), 'AA', 'Wrong name');
  assert.equal(dok[0].get('order'), 1, 'Wrong order');
});

test('normalizeReadCountries', function(assert) {
  const serializer = this.subject();
  const countryData = {
    countries: [
      {
        id: '1',
        name: 'Afghanistan',
        code: 'AF'
      },
      {
        id: '2',
        name: 'Albania',
        code: 'AL'
      }
    ]
  };

  const countries = serializer.normalizeReadCountries(countryData);
  assert.equal(countries.length, 2, 'Wrong countries length');
  assert.equal(countries[0].get('id'), '1', 'Wrong id');
  assert.equal(countries[0].get('name'), 'Afghanistan', 'Wrong name');
  assert.equal(countries[0].get('code'), 'AF', 'Wrong code');
});

test('normalizeReadStates', function(assert) {
  const serializer = this.subject();
  const statesData = {
    states: [
      {
        id: '1',
        name: 'A',
        code: 'AA'
      },
      {
        id: '2',
        name: 'B',
        code: 'BB'
      }
    ]
  };

  const states = serializer.normalizeReadStates(statesData);
  assert.equal(states.length, 2, 'Wrong states length');
  assert.equal(states[0].get('id'), '1', 'Wrong id');
  assert.equal(states[0].get('name'), 'A', 'Wrong name');
  assert.equal(states[0].get('code'), 'AA', 'Wrong code');
});

test('normalizeReadDistricts', function(assert) {
  const serializer = this.subject();
  const districtsData = {
    'school-districts': [
      {
        id: '1',
        name: 'A',
        code: 'AA'
      },
      {
        id: '2',
        name: 'B',
        code: 'BB'
      }
    ]
  };

  const districts = serializer.normalizeReadDistricts(districtsData);
  assert.equal(districts.length, 2, 'Wrong districts length');
  assert.equal(districts[0].get('id'), '1', 'Wrong id');
  assert.equal(districts[0].get('name'), 'A', 'Wrong name');
  assert.equal(districts[0].get('code'), 'AA', 'Wrong code');
});
