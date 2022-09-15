import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import QuestionModel from 'gooru-web/models/content/question';
import AnswerModel from 'gooru-web/models/content/answer';

moduleForComponent(
  'serializer:content/question',
  'Unit | Serializer | content/question'
);

test('serializeCreateQuestion', function(assert) {
  const serializer = this.subject();
  const questionObject = QuestionModel.create({
    title: 'question-title',
    description: 'question-desc',
    type: 'MA',
    audience: [1],
    depthOfknowledge: [4]
  });
  const response = serializer.serializeCreateQuestion(questionObject);
  assert.equal(response.title, 'question-title', 'Wrong title');
  assert.equal(response.description, 'question-desc', 'Wrong description');
  assert.equal(
    response.content_subformat,
    'multiple_answer_question',
    'Wrong sub format'
  );
  assert.equal(response.visible_on_profile, false, 'Wrong visible on profile');
  assert.equal(response.metadata.audience[0], 1, 'Wrong audience');
  assert.equal(
    response.metadata.depth_of_knowledge[0],
    4,
    'Wrong depth_of_knowledge'
  );
});

test('serializeUpdateQuestion null values', function(assert) {
  const serializer = this.subject();
  const question = QuestionModel.create({
    title: 'Question title',
    //type: 'MA',
    text: null,
    narration: null,
    isVisibleOnProfile: false,
    questionType: 'word',
    standards: [],
    audience: [1],
    depthOfknowledge: [4],
    answers: null
  });
  const response = serializer.serializeUpdateQuestion(question);

  assert.equal(response.title, 'Question title', 'Wrong title');
  assert.notOk(response.description, 'Wrong description');
  assert.notOk(response.narration, 'Wrong narration');
  assert.equal(response.visible_on_profile, false, 'Wrong visible_on_profile');
  assert.notOk(response.answer, 'Wrong answer');
  assert.equal(response.taxonomy, null, 'Wrong taxonomy object');
  assert.equal(response.metadata.audience[0], 1, 'Wrong audience');
  assert.equal(
    response.metadata.depth_of_knowledge[0],
    4,
    'Wrong depth_of_knowledge'
  );
});

test('serializeUpdateQuestion for hot spot image', function(assert) {
  assert.expect(3);
  const serializer = this.subject();
  const question = QuestionModel.create({
    title: 'Question title',
    questionType: 'HS_IMG',
    text: 'This is the question text?',
    narration: 'This is the question narration',
    isVisibleOnProfile: false,
    standards: [],
    audience: [1],
    depthOfknowledge: [4],
    answers: Ember.A([
      AnswerModel.create({
        sequence: 1,
        isCorrect: false,
        text: 'Answer #1 text',
        type: 'text'
      })
    ])
  });

  serializer.serializerAnswer = function(answer, index, isHotSpotImage) {
    assert.equal(answer.get('sequence'), 1, 'Wrong sequence');
    assert.equal(index, 1, 'Wrong index');
    assert.equal(isHotSpotImage, true, 'Wrong isHotSpotImage');
  };
  serializer.serializeUpdateQuestion(question);
});

test('serializeUpdateQuestion', function(assert) {
  const serializer = this.subject();
  const question = QuestionModel.create({
    title: 'Question title',
    //type: 'MA',
    text: 'This is the question text?',
    narration: 'This is the question narration',
    isVisibleOnProfile: false,
    questionType: 'word',
    standards: [],
    audience: [1],
    depthOfknowledge: [4],
    answers: Ember.A([
      AnswerModel.create({
        sequence: 1,
        isCorrect: false,
        text: 'Answer #1 text',
        type: 'text'
      }),
      AnswerModel.create({
        sequence: 2,
        isCorrect: true,
        text: 'Answer #2 text',
        type: 'text'
      }),
      AnswerModel.create({
        sequence: 3,
        isCorrect: false,
        text: 'Answer #3 text',
        type: 'text'
      })
    ])
  });
  const response = serializer.serializeUpdateQuestion(question);

  assert.equal(response.title, 'Question title', 'Wrong title');
  assert.equal(
    response.description,
    'This is the question text?',
    'Wrong description'
  );
  assert.equal(
    response.narration,
    'This is the question narration',
    'Wrong narration'
  );
  assert.equal(response.visible_on_profile, false, 'Wrong visible_on_profile');
  assert.equal(response.answer.length, 3, 'Wrong answer array length');
  assert.equal(response.taxonomy, null, 'Wrong taxonomy object');
  assert.equal(response.metadata.audience[0], 1, 'Wrong audience');
  assert.equal(
    response.metadata.depth_of_knowledge[0],
    4,
    'Wrong depth_of_knowledge'
  );
});

test('serializeUpdateQuestionTitle', function(assert) {
  const serializer = this.subject();
  const response = serializer.serializeUpdateQuestionTitle('Title');

  assert.equal(response.title, 'Title', 'Wrong title');
});

test('serializeAnswer', function(assert) {
  const serializer = this.subject();
  const answer = AnswerModel.create({
    isCorrect: true,
    text: 'Answer #1 text',
    type: 'text'
  });
  const response = serializer.serializerAnswer(answer, 1, false);

  assert.equal(response.sequence, 1, 'Wrong sequence');
  assert.equal(response.is_correct, 1, 'Wrong is_correct');
  assert.equal(response.answer_text, 'Answer #1 text', 'Wrong answer_text');
  assert.equal(response.answer_type, 'text', 'Wrong answer_type');
});

test('serializeAnswer for image', function(assert) {
  const serializer = this.subject();
  const answer = AnswerModel.create({
    isCorrect: true,
    text: '//content-url/answer-thumbnail',
    type: 'text'
  });
  const response = serializer.serializerAnswer(answer, 1, true);

  assert.equal(response.sequence, 1, 'Wrong sequence');
  assert.equal(response.is_correct, 1, 'Wrong is_correct');
  assert.equal(response.answer_text, 'answer-thumbnail', 'Wrong answer_text');
  assert.equal(response.answer_type, 'text', 'Wrong answer_type');
});

test('normalizeReadQuestion', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const questionData = {
    id: 'abcd',
    title: 'question-title',
    content_subformat: 'multiple_answer_question',
    description: 'any desc',
    narration: 'any narration',
    publish_status: 'published',
    taxonomy: {},
    thumbnail: 'image.png',
    sequence_id: 3,
    answer: [
      {
        sequence: 1,
        is_correct: 0,
        answer_text: 'Answer #1 text',
        answer_type: 'text'
      },
      {
        sequence: 2,
        is_correct: 1,
        answer_text: 'Answer #2 text',
        answer_type: 'text'
      },
      {
        sequence: 3,
        is_correct: 0,
        answer_text: 'Answer #3 text',
        answer_type: 'text'
      }
    ],
    metadata: {
      audience: [1],
      depth_of_knowledge: [4]
    },
    course_id: 'course-id',
    unit_id: 'unit-id',
    lesson_id: 'lesson-id',
    collection_id: 'collection-id'
  };

  const question = serializer.normalizeReadQuestion(questionData);
  assert.equal(question.get('id'), 'abcd', 'Wrong id');
  assert.equal(question.get('title'), 'question-title', 'Wrong title');
  assert.equal(question.get('text'), 'any desc', 'Wrong description');
  assert.equal(question.get('narration'), 'any narration', 'Wrong narration');
  assert.equal(question.get('publishStatus'), 'published', 'Wrong publish');
  assert.equal(question.get('standards').length, 0, 'Wrong standards');
  assert.equal(question.get('type'), 'MA', 'Wrong format'); //format is converted at the normalizer
  assert.equal(question.get('isVisibleOnProfile'), true, 'Wrong format');
  assert.equal(
    question.get('thumbnail'),
    'http://test-bucket01.s3.amazonaws.com/image.png',
    'Wrong thumbnail'
  );
  assert.equal(question.get('answers').length, 3, 'Wrong answers array length');
  assert.equal(question.get('order'), 3, 'Wrong order');
  assert.equal(question.get('audience'), 1, 'Wrong audience');
  assert.equal(question.get('depthOfknowledge'), 4, 'Wrong depthOfknowledge');
  assert.equal(question.get('courseId'), 'course-id', 'Wrong course id');
  assert.equal(question.get('unitId'), 'unit-id', 'Wrong unit id');
  assert.equal(question.get('lessonId'), 'lesson-id', 'Wrong lesson id');
  assert.equal(
    question.get('collectionId'),
    'collection-id',
    'Wrong collection id'
  );
});

test('normalizeAnswer', function(assert) {
  const serializer = this.subject();
  const answerData = {
    sequence: 1,
    is_correct: 0,
    answer_text: 'Answer #1 text',
    answer_type: 'text'
  };
  const answer = serializer.normalizeAnswer(answerData, 'MC');
  const id = window.btoa(encodeURIComponent(answerData.answer_text));

  assert.equal(answer.get('id'), id, 'Wrong id');
  assert.equal(answer.get('sequence'), 1, 'Wrong sequence');
  assert.equal(answer.get('isCorrect'), false, 'Wrong isCorrect');
  assert.equal(answer.get('text'), 'Answer #1 text', 'Wrong text');
  assert.equal(answer.get('type'), 'text', 'Wrong type');
});

test('normalizeAnswer - MA type', function(assert) {
  const serializer = this.subject();
  const answerData = {
    sequence: 1,
    is_correct: 0,
    answer_text: 'Answer #1 text',
    answer_type: 'text'
  };
  const answer = serializer.normalizeAnswer(answerData, 'MA');
  const id = `answer_${answerData.sequence}`;

  assert.equal(answer.get('id'), id, 'Wrong id');
  assert.equal(answer.get('sequence'), 1, 'Wrong sequence');
  assert.equal(answer.get('isCorrect'), false, 'Wrong isCorrect');
  assert.equal(answer.get('text'), 'Answer #1 text', 'Wrong text');
  assert.equal(answer.get('type'), 'text', 'Wrong type');
});

test('normalizeReadQuestion - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const questionData = {
    id: 'abcd'
  };

  const question = serializer.normalizeReadQuestion(questionData);
  assert.equal(question.get('id'), 'abcd', 'Wrong id');
  assert.equal(
    question.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
});

test('normalizeReadQuestion - if it is not visible on profile', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const questionData = {
    id: 'abcd',
    visible_on_profile: false
  };

  const question = serializer.normalizeReadQuestion(questionData);
  assert.equal(question.get('id'), 'abcd', 'Wrong id');
  assert.equal(
    question.get('isVisibleOnProfile'),
    false,
    'Wrong isVisibleOnProfile'
  );
});
