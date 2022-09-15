import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:real-time/real-time',
  'Unit | Serializer | real-time/real-time'
);

test('normalizeRealTimeEvent for event', function(assert) {
  const serializer = this.subject();
  const payload = {
    userId: '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    event: {
      gooruOId: '46d4a6d4-991b-4c51-a656-f694e037dd68',
      views: 1,
      score: 1,
      reaction: 5,
      timeSpent: 3600000,
      resourceType: 'question',
      questionType: 'MC',
      answerObject: 'NA'
    }
  };
  const userResourcesResult = serializer.normalizeRealTimeEvent(payload);

  assert.equal(
    userResourcesResult.get('user'),
    '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    'Wrong user'
  );
  assert.equal(
    userResourcesResult.get('isAttemptStarted'),
    false,
    'Wrong isAttemptStarted value'
  );
  assert.equal(
    userResourcesResult.get('isAttemptFinished'),
    false,
    'Wrong isAttemptFinished value'
  );
  assert.equal(
    userResourcesResult.get('resourceResults.length'),
    1,
    'Wrong resourceResults length'
  );
});

test('normalizeRealTimeEvent for new attempt', function(assert) {
  const serializer = this.subject();
  const payload = {
    userId: '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    event: {
      isNewAttempt: true
    }
  };
  const userResourcesResult = serializer.normalizeRealTimeEvent(payload);

  assert.equal(
    userResourcesResult.get('user'),
    '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    'Wrong user'
  );
  assert.equal(
    userResourcesResult.get('isAttemptStarted'),
    true,
    'Wrong isAttemptStarted value'
  );
  assert.equal(
    userResourcesResult.get('isAttemptFinished'),
    false,
    'Wrong isAttemptFinished value'
  );
  assert.equal(
    userResourcesResult.get('resourceResults.length'),
    0,
    'Wrong resourceResults length'
  );
});

test('normalizeRealTimeEvent for complete attempt', function(assert) {
  const serializer = this.subject();
  const payload = {
    userId: '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    event: {
      isCompleteAttempt: true
    }
  };
  const userResourcesResult = serializer.normalizeRealTimeEvent(payload);

  assert.equal(
    userResourcesResult.get('user'),
    '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    'Wrong user'
  );
  assert.equal(
    userResourcesResult.get('isAttemptStarted'),
    false,
    'Wrong isAttemptStarted value'
  );
  assert.equal(
    userResourcesResult.get('isAttemptFinished'),
    true,
    'Wrong isAttemptFinished value'
  );
  assert.equal(
    userResourcesResult.get('resourceResults.length'),
    0,
    'Wrong resourceResults length'
  );
});
