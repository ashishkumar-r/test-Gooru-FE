import ResourceResult from 'gooru-web/models/result/resource';
import { module, test } from 'qunit';

module('Unit | Model | result/resource');

test('Change submittedAt', function(assert) {
  let resourceResult = ResourceResult.create({
    timeSpent: 99999,
    startedAt: new Date('October 13, 2014 11:40:00'),
    submittedAt: new Date('October 13, 2014 11:40:00')
  });

  assert.equal(
    resourceResult.get('timeSpent'),
    99999,
    'Wrong initial time spent, the observer is not thrown on init'
  );

  resourceResult.set('submittedAt', new Date('October 13, 2014 11:41:00'));
  assert.equal(resourceResult.get('timeSpent'), 60000, 'Wrong new time spent');

  resourceResult.set('submittedAt', null);
  assert.equal(
    resourceResult.get('timeSpent'),
    0,
    'Wrong time spent, should be 0'
  );
});

test('Change startedAt', function(assert) {
  let resourceResult = ResourceResult.create({
    timeSpent: 99999,
    startedAt: new Date('October 13, 2014 11:40:00'),
    submittedAt: new Date('October 13, 2014 11:41:00')
  });

  assert.equal(
    resourceResult.get('timeSpent'),
    99999,
    'Wrong initial time spent, the observer is not thrown on init'
  );

  resourceResult.set('startedAt', new Date('October 13, 2014 11:41:00'));
  assert.equal(
    resourceResult.get('submittedAt'),
    null,
    'SubmittedAt should be null'
  );
  assert.equal(resourceResult.get('timeSpent'), 0, 'Time spent should be 0');
});

test('submitted', function(assert) {
  let resourceResult = ResourceResult.create({
    submittedAt: new Date()
  });

  //when correct is valid
  assert.ok(resourceResult.get('submitted'), 'It should be submitted');

  //when correct is null
  resourceResult.set('submittedAt', null);
  assert.ok(
    !resourceResult.get('submitted'),
    'It should not be submitted when null'
  );

  //when correct is undefined
  resourceResult.set('submittedAt', undefined);
  assert.ok(
    !resourceResult.get('submitted'),
    'It should not be submitted when undefined'
  );
});

test('started', function(assert) {
  let resourceResult = ResourceResult.create({
    timeSpent: 10
  });

  //when correct is valid
  assert.ok(resourceResult.get('started'), 'It should be started');

  //when correct is 0
  resourceResult.set('timeSpent', 0);
  assert.ok(!resourceResult.get('started'), 'It should not be started when 0');

  //when correct is null
  resourceResult.set('timeSpent', null);
  assert.ok(
    !resourceResult.get('started'),
    'It should not be started when null'
  );

  //when correct is undefined
  resourceResult.set('timeSpent', undefined);
  assert.ok(
    !resourceResult.get('started'),
    'It should not be started when undefined'
  );
});

test('completed', function(assert) {
  let resourceResult = ResourceResult.create({
    timeSpent: 10
  });

  //when correct is valid
  assert.ok(resourceResult.get('completed'), 'It should be completed');

  //when correct is 0
  resourceResult.set('timeSpent', 0);
  assert.ok(
    !resourceResult.get('completed'),
    'It should not be completed when 0'
  );

  //when correct is null
  resourceResult.set('timeSpent', null);
  assert.ok(
    !resourceResult.get('completed'),
    'It should not be completed when null'
  );

  //when correct is undefined
  resourceResult.set('timeSpent', undefined);
  assert.ok(
    !resourceResult.get('completed'),
    'It should not be completed when undefined'
  );
});

test('pending', function(assert) {
  let resourceResult = ResourceResult.create({
    startedAt: new Date(),
    submittedAt: new Date()
  });

  //when has startedAt and submittedAt
  assert.ok(!resourceResult.get('pending'), 'It should not be pending');

  //when has not submitted at but started at
  resourceResult.set('submittedAt', null);
  assert.ok(
    resourceResult.get('pending'),
    'It should be pending when no submitted at'
  );

  //when has not submitted at and not started at
  resourceResult.set('startedAt', null);
  assert.ok(
    !resourceResult.get('pending'),
    'It should not be pending when not started at'
  );
});
