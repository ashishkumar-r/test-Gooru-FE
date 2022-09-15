import Answer from 'gooru-web/models/content/answer';
import { QUESTION_TYPES } from 'gooru-web/config/question';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'model:content/question',
  'Unit | Model | content/question',
  {
    unit: true,
    needs: [
      'validator:presence',
      'validator:presence-html',
      'validator:square-bracket'
    ]
  }
);

test('fibText having correct answer', function(assert) {
  var model = this.subject({
    text: 'The ball is [red] and [white]'
  });
  assert.equal(
    model.get('fibText'),
    'The ball is _______ and _______',
    'Wrong FIB text'
  );
});

test('fibText having sqrt math expression', function(assert) {
  var model = this.subject({
    text: 'The ball is [red] and [white] and sqrt[2]'
  });
  assert.equal(
    model.get('fibText'),
    'The ball is _______ and _______ and sqrt[2]',
    'Wrong FIB text'
  );
});

test('fibText having no correct answers', function(assert) {
  var model = this.subject({
    text: 'The ball is red and white'
  });
  assert.equal(
    model.get('fibText'),
    'The ball is red and white',
    'Wrong FIB text'
  );
});

test('isLegacyFIB', function(assert) {
  var model = this.subject({
    questionType: QUESTION_TYPES.MA,
    text: 'The car is red'
  });

  assert.ok(
    !model.get('isLegacyFIB'),
    'Should not be Legacy FIB, incorrect type'
  );

  model.set('questionType', QUESTION_TYPES.fib);
  assert.ok(
    !model.get('isLegacyFIB'),
    'Should not be Legacy FIB, correct type but has no ______'
  );

  model.set('text', 'The car is [red]'); // new format
  assert.ok(
    !model.get('isLegacyFIB'),
    'Should not be Legacy FIB, correct type but has no ______'
  );

  model.set('text', 'The car is _______'); // legacy format
  assert.ok(
    model.get('isLegacyFIB'),
    'Should be Legacy FIB, correct type and has  ______'
  );
});

test('updateLegacyFIBText with no text', function(assert) {
  var model = this.subject({
    questionType: QUESTION_TYPES.fib
  });

  model.updateLegacyFIBText();

  assert.equal(model.get('text'), null, 'Should have no text still');
});

test('updateLegacyFIBText with text not following the legacy format', function(assert) {
  var model = this.subject({
    questionType: QUESTION_TYPES.fib,
    text: 'The car is [red] and [blue]'
  });

  model.updateLegacyFIBText();

  assert.equal(model.get('text'), 'The car is [red] and [blue]', 'Wrong text');
});

test('updateLegacyFIBText with text following the legacy format, but no answer', function(assert) {
  var model = this.subject({
    questionType: QUESTION_TYPES.fib,
    text: 'The car is _______ and _______ and _______'
  });

  model.updateLegacyFIBText();

  assert.equal(
    model.get('text'),
    'The car is _______ and _______ and _______',
    'Wrong text'
  );
});

test('updateLegacyFIBText with text following the legacy format and answers', function(assert) {
  var model = this.subject({
    questionType: QUESTION_TYPES.fib,
    text: 'The car is _______ and _______ and _______',
    answers: [
      Answer.create({ text: 'red', sequence: 1 }),
      Answer.create({ text: 'yellow', sequence: 2 }),
      Answer.create({ text: 'white', sequence: 3 })
    ]
  }); // we are assuming the answers are always sorted

  model.updateLegacyFIBText();

  assert.equal(
    model.get('text'),
    'The car is [red] and [yellow] and [white]',
    'Wrong text'
  );
});
