import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Goal from 'gooru-web/models/goal/goal';

moduleForComponent('serializer:goal/goal', 'Unit | Serializer | goal/goal');

test('serializeCreateGoal', function(assert) {
  const serializer = this.subject();
  const modelInstance = Goal.create({
    title: 'Goal Title',
    status: 'not_started',
    description: 'the desc',
    reflection: 'the reflection',
    startDate: new Date(1994, 12, 10),
    endDate: new Date(1994, 12, 10)
  });
  const modelObject = serializer.serializeCreateGoal(modelInstance);
  assert.equal(modelObject.title, 'Goal Title', 'Wrong title');
  assert.equal(modelObject.status, 'not_started', 'Wrong status');
  assert.equal(modelObject.description, 'the desc', 'Wrong description');
  assert.equal(modelObject.reflection, 'the reflection', 'Wrong reflection');
  assert.ok(modelObject.start_date, 'Missing startDate');
  assert.ok(modelObject.end_date, 'Missing endDate');
});

test('serializeCreateGoal with no dates', function(assert) {
  const serializer = this.subject();
  const modelInstance = Goal.create({
    title: 'Goal Title',
    status: 'not_started',
    description: 'the desc',
    reflection: 'the reflection'
  });
  const modelObject = serializer.serializeCreateGoal(modelInstance);
  assert.equal(modelObject.title, 'Goal Title', 'Wrong title');
  assert.equal(modelObject.status, 'not_started', 'Wrong status');
  assert.equal(modelObject.description, 'the desc', 'Wrong description');
  assert.equal(modelObject.reflection, 'the reflection', 'Wrong reflection');
  assert.ok(!modelObject.start_date, 'startDate should not be present');
  assert.ok(!modelObject.end_date, 'endDate should not be present');
});

test('serializeGoal', function(assert) {
  const serializer = this.subject();
  const modelInstance = Goal.create({
    title: 'Goal Title',
    status: 'not_started',
    description: 'the desc',
    reflection: 'the reflection',
    startDate: new Date(1994, 12, 10),
    endDate: new Date(1994, 12, 10)
  });
  const modelObject = serializer.serializeGoal(modelInstance);
  assert.equal(modelObject.title, 'Goal Title', 'Wrong title');
  assert.equal(modelObject.status, 'not_started', 'Wrong status');
  assert.equal(modelObject.description, 'the desc', 'Wrong description');
  assert.equal(modelObject.reflection, 'the reflection', 'Wrong reflection');
  assert.ok(modelObject.start_date, 'Missing startDate');
  assert.ok(modelObject.end_date, 'Missing endDate');
});

test('serializeCreateGoal with no dates', function(assert) {
  const serializer = this.subject();
  const modelInstance = Goal.create({
    title: 'Goal Title',
    status: 'not_started',
    description: 'the desc',
    reflection: 'the reflection'
  });
  const modelObject = serializer.serializeGoal(modelInstance);
  assert.equal(modelObject.title, 'Goal Title', 'Wrong title');
  assert.equal(modelObject.status, 'not_started', 'Wrong status');
  assert.equal(modelObject.description, 'the desc', 'Wrong description');
  assert.equal(modelObject.reflection, 'the reflection', 'Wrong reflection');
  assert.ok(!modelObject.start_date, 'startDate should not be present');
  assert.ok(!modelObject.end_date, 'endDate should not be present');
});

test('normalizeGoal', function(assert) {
  const serializer = this.subject();
  const data = {
    id: 'goal-id',
    title: 'My Fitness Goal',
    description: 'This is Description to Goal',
    start_date: 1409175049,
    end_date: 1409175049,
    sequence_id: 1,
    status: 'not_started',
    reflection: 'need to do better'
  };
  const goal = serializer.normalizeGoal(data);
  assert.equal(goal.get('id'), data.id, 'Wrong id');
  assert.equal(goal.get('title'), data.title, 'Wrong title');
  assert.equal(goal.get('status'), data.status, 'Wrong status');
  assert.equal(goal.get('description'), data.description, 'Wrong description');
  assert.equal(goal.get('reflection'), data.reflection, 'Wrong reflection');
  assert.equal(goal.get('order'), data.sequence_id, 'Wrong sequence id');
  assert.ok(goal.get('startDate'), 'startDate should be present');
  assert.ok(goal.get('endDate'), 'endDate should be present');
});

test('normalizeGetGoals', function(assert) {
  const serializer = this.subject();
  const data = [
    {
      id: 'goal-id',
      title: 'My Fitness Goal',
      description: 'This is Description to Goal',
      start_date: 1409175049,
      end_date: 1409175049,
      sequence_id: 1,
      status: 'not_started',
      reflection: 'need to do better'
    }
  ];
  const goals = serializer.normalizeGetGoals(data);
  assert.equal(goals.length, 1, 'Wrong number of goals');
  assert.equal(goals[0].get('id'), data[0].id, 'Wrong id');
});
