import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Rubric from 'gooru-web/models/rubric/rubric';
import RubricGrade from 'gooru-web/models/rubric/rubric-grade';
import GradeCategoryScore from 'gooru-web/models/rubric/grade-category-score';
import RubricCategory from 'gooru-web/models/rubric/rubric-category';

moduleForComponent(
  'serializer:rubric/rubric',
  'Unit | Serializer | rubric/rubric'
);

test('serializeCreateRubric', function(assert) {
  const serializer = this.subject();

  serializer.set(
    'taxonomySerializer',
    Ember.Object.create({
      serializeTaxonomy: function(taxonomy) {
        assert.equal(taxonomy, 'fake-taxonomy', 'Wrong taxonomy');
        return 'taxonomy-serialized';
      }
    })
  );

  const rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
    title: 'rubric-title',
    description: 'rubric-description',
    type: 'rubric-type',
    thumbnail: 'http://test-bucket01.s3.amazonaws.com/image-id.png',
    standards: 'fake-taxonomy',
    audience: [1]
  });

  const rubricObject = serializer.serializeCreateRubric(rubric);
  assert.equal(rubricObject.title, 'rubric-title', 'Wrong title');
  assert.equal(
    rubricObject.description,
    'rubric-description',
    'Wrong description'
  );
  assert.equal(rubricObject.thumbnail, 'image-id.png', 'Wrong thumbnail');
  assert.equal(rubricObject.taxonomy, 'taxonomy-serialized', 'Wrong taxonomy');
  assert.ok(rubricObject.metadata, 'Missing metadata');
  assert.deepEqual(rubricObject.metadata.audience, [1], 'Wrong audience');
});

test('serializeUpdateRubric uploaded and no feedback required', function(assert) {
  const serializer = this.subject();

  const contentCdnUrl = 'content-url/';
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: contentCdnUrl
      }
    })
  );

  serializer.set(
    'taxonomySerializer',
    Ember.Object.create({
      serializeTaxonomy: function(taxonomy) {
        assert.equal(taxonomy, 'fake-taxonomy', 'Wrong taxonomy');
        return 'taxonomy-serialized';
      }
    })
  );

  const rubric = Rubric.create({
    title: 'rubric-title',
    description: 'rubric-description',
    type: 'rubric-type',
    thumbnail: 'http://test-bucket01.s3.amazonaws.com/image-id.png',
    standards: 'fake-taxonomy',
    audience: [1],
    url: `${contentCdnUrl}any-url`,
    uploaded: true,
    rubricOn: true,
    feedback: 'any-feedback',
    requiresFeedback: false,
    categories: [
      RubricCategory.create(),
      RubricCategory.create(),
      RubricCategory.create()
    ]
  });

  const rubricObject = serializer.serializeUpdateRubric(rubric);
  assert.equal(rubricObject.title, 'rubric-title', 'Wrong title');
  assert.equal(
    rubricObject.description,
    'rubric-description',
    'Wrong description'
  );
  assert.equal(rubricObject.thumbnail, 'image-id.png', 'Wrong thumbnail');
  assert.equal(rubricObject.taxonomy, 'taxonomy-serialized', 'Wrong taxonomy');
  assert.ok(rubricObject.metadata, 'Missing metadata');
  assert.deepEqual(rubricObject.metadata.audience, [1], 'Wrong audience');
  assert.equal(rubricObject.url, 'any-url', 'Wrong url');
  assert.equal(rubricObject.is_remote, false, 'Wrong is remote');
  assert.equal(
    rubricObject.feedback_guidance,
    'any-feedback',
    'Wrong feedback_guidance'
  );
  assert.equal(
    rubricObject.overall_feedback_required,
    false,
    'Wrong overall_feedback_required'
  );
  assert.equal(rubricObject.categories.length, 3, 'Wrong categories length');
});

test('serializeUpdateRubric not uploaded and feedback required', function(assert) {
  const serializer = this.subject();

  serializer.set(
    'taxonomySerializer',
    Ember.Object.create({
      serializeTaxonomy: function(taxonomy) {
        assert.equal(taxonomy, 'fake-taxonomy', 'Wrong taxonomy');
        return 'taxonomy-serialized';
      }
    })
  );

  const rubric = Rubric.create({
    title: 'rubric-title',
    description: 'rubric-description',
    type: 'rubric-type',
    thumbnail: 'http://test-bucket01.s3.amazonaws.com/image-id.png',
    standards: 'fake-taxonomy',
    audience: [1],
    url: 'any-url',
    uploaded: false,
    rubricOn: true,
    feedback: null,
    requiresFeedback: true
  });

  const rubricObject = serializer.serializeUpdateRubric(rubric);
  assert.equal(rubricObject.title, 'rubric-title', 'Wrong title');
  assert.equal(
    rubricObject.description,
    'rubric-description',
    'Wrong description'
  );
  assert.equal(rubricObject.thumbnail, 'image-id.png', 'Wrong thumbnail');
  assert.equal(rubricObject.taxonomy, 'taxonomy-serialized', 'Wrong taxonomy');
  assert.ok(rubricObject.metadata, 'Missing metadata');
  assert.deepEqual(rubricObject.metadata.audience, [1], 'Wrong audience');
  assert.equal(rubricObject.url, 'any-url', 'Wrong url');
  assert.equal(rubricObject.is_remote, true, 'Wrong is remote');
  assert.equal(rubricObject.feedback_guidance, null, 'Wrong feedback_guidance');
  assert.equal(
    rubricObject.overall_feedback_required,
    true,
    'Wrong overall_feedback_required'
  );
});

test('serializeUpdateRubric with empty strings', function(assert) {
  const serializer = this.subject();

  serializer.set(
    'taxonomySerializer',
    Ember.Object.create({
      serializeTaxonomy: function(taxonomy) {
        assert.equal(taxonomy, 'fake-taxonomy', 'Wrong taxonomy');
        return 'taxonomy-serialized';
      }
    })
  );

  const rubric = Rubric.create({
    title: '',
    description: '',
    type: 'rubric-type',
    thumbnail: 'http://test-bucket01.s3.amazonaws.com/image-id.png',
    standards: 'fake-taxonomy',
    audience: [1],
    url: '',
    uploaded: false,
    rubricOn: true,
    feedback: '',
    requiresFeedback: true
  });

  const rubricObject = serializer.serializeUpdateRubric(rubric);
  assert.equal(rubricObject.title, null, 'Wrong title');
  assert.equal(rubricObject.description, null, 'Wrong description');
  assert.equal(rubricObject.thumbnail, 'image-id.png', 'Wrong thumbnail');
  assert.equal(rubricObject.taxonomy, 'taxonomy-serialized', 'Wrong taxonomy');
  assert.ok(rubricObject.metadata, 'Missing metadata');
  assert.deepEqual(rubricObject.metadata.audience, [1], 'Wrong audience');
  assert.equal(rubricObject.url, null, 'Wrong url');
  assert.equal(rubricObject.is_remote, true, 'Wrong is remote');
  assert.equal(rubricObject.feedback_guidance, null, 'Wrong feedback_guidance');
  assert.equal(
    rubricObject.overall_feedback_required,
    true,
    'Wrong overall_feedback_required'
  );
});

test('serializeUpdateScore', function(assert) {
  const serializer = this.subject();

  const rubricScore = Rubric.create({
    scoring: true,
    maxScore: 75,
    increment: 1
  });

  const rubricScoreObject = serializer.serializeUpdateScore(rubricScore);
  assert.equal(rubricScoreObject.scoring, true, 'Wrong scoring');
  assert.equal(rubricScoreObject.max_score, 75, 'Wrong max score');
  assert.equal(rubricScoreObject.increment, 1, 'Wrong increment');
});

test('serializedUpdateRubricCategory', function(assert) {
  const serializer = this.subject();

  const rubricCategory = RubricCategory.create({
    title: 'any-title',
    feedbackGuidance: 'any-feedback',
    requiresFeedback: true,
    allowsLevels: true,
    allowsScoring: false,
    levels: [{ name: 'level-1', score: 10 }, { name: 'level-2', score: 11 }]
  });

  const categoryObject = serializer.serializedUpdateRubricCategory(
    rubricCategory
  );
  assert.equal(
    categoryObject.category_title,
    'any-title',
    'Wrong category_title'
  );
  assert.equal(
    categoryObject.feedback_guidance,
    'any-feedback',
    'Wrong feedback_guidance'
  );
  assert.equal(
    categoryObject.required_feedback,
    true,
    'Wrong required_feedback'
  );
  assert.equal(categoryObject.level, true, 'Wrong level');
  assert.equal(categoryObject.scoring, false, 'Wrong scoring');
  assert.equal(categoryObject.levels.length, 2, 'Wrong levels length');
  assert.equal(
    categoryObject.levels[0].level_name,
    'level-1',
    'Wrong level name'
  );
  assert.equal(categoryObject.levels[0].level_score, 10, 'Wrong level score');
});

test('serializedUpdateRubricCategory empty properties', function(assert) {
  const serializer = this.subject();

  const rubricCategory = RubricCategory.create({
    title: '',
    feedbackGuidance: '',
    categories: []
  });

  const categoryObject = serializer.serializedUpdateRubricCategory(
    rubricCategory
  );
  assert.equal(categoryObject.categories, null, 'Wrong categories');
  assert.equal(categoryObject.category_title, null, 'Wrong category_title');
  assert.equal(
    categoryObject.feedback_guidance,
    null,
    'Wrong feedback_guidance'
  );
});

test('serializedUpdateRubricCategory with null levels', function(assert) {
  const serializer = this.subject();

  const rubricCategory = RubricCategory.create({
    title: 'any-title',
    feedbackGuidance: 'any-feedback',
    requiresFeedback: true,
    allowsLevels: true,
    allowsScoring: false,
    levels: [
      { name: 'level-1', score: null },
      { name: '', score: 11 },
      { name: '', score: null }
    ]
  });

  const categoryObject = serializer.serializedUpdateRubricCategory(
    rubricCategory
  );
  assert.equal(categoryObject.levels.length, 2, 'Wrong category levels');
});

test('normalizeRubricCategory', function(assert) {
  const serializer = this.subject();

  const category = {
    category_title: 'Thesis and Sub-claims',
    feedback_guidance: 'any feedback',
    required_feedback: true,
    level: true,
    scoring: false,
    levels: [
      {
        level_name: 'Exemplary',
        level_score: 4
      },
      {
        level_name: 'Proficient',
        level_score: 3
      },
      {
        level_name: 'Basic',
        level_score: 2
      },
      {
        level_name: 'Below Basic',
        level_score: 1
      }
    ]
  };

  const rubricCategory = serializer.normalizeRubricCategory(category);
  assert.equal(
    rubricCategory.get('title'),
    'Thesis and Sub-claims',
    'Wrong title'
  );
  assert.equal(
    rubricCategory.get('feedbackGuidance'),
    'any feedback',
    'Wrong feedback'
  );
  assert.equal(
    rubricCategory.get('requiresFeedback'),
    true,
    'Wrong requiresFeedback'
  );
  assert.equal(rubricCategory.get('allowsLevels'), true, 'Wrong allowsLevels');
  assert.equal(
    rubricCategory.get('allowsScoring'),
    false,
    'Wrong allowsScoring'
  );
  assert.equal(rubricCategory.get('levels.length'), 4, 'Wrong allowsScoring');
  assert.equal(
    rubricCategory.get('levels')[0].name,
    'Exemplary',
    'Wrong level name'
  );
  assert.equal(rubricCategory.get('levels')[0].score, 4, 'Wrong level score');
});

test('normalizeRubric', function(assert) {
  const serializer = this.subject();
  const contentCdnUrl = 'content-url/';
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: contentCdnUrl
      }
    })
  );

  const rubricData = {
    id: '2c185398-d0e6-42d8-9926-572939fc0784',
    title: 'Rubric - 1',
    description: 'This is the example question for the rubrics association',
    thumbnail: '2c185398-d0e6-42d8-9926-572939fc0784.png',
    publish_date: '2017-02-24T05:55:42Z',
    publishStatus: 'published',
    metadata: {
      audience: [12, 45]
    },
    taxonomy: {},
    url: 'https://en.wikipedia.org/wiki/Rubric_(academic)',
    is_remote: true,
    is_rubric: false,
    feedback_guidance: 'Summarize your feedback on the essay as a whole',
    creator_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
    overall_feedback_required: true,
    categories: [
      {
        category_title: 'Thesis and Sub-claims'
      },
      {
        category_title: 'Thesis and Sub-claims'
      }
    ],
    created_at: '2017-02-24T05:55:42Z',
    updated_at: '2017-02-24T05:55:42Z',
    tenant: 'ba956a97-ae15-11e5-a302-f8a963065976'
  };

  const rubric = serializer.normalizeRubric(rubricData);

  assert.equal(
    rubric.get('id'),
    '2c185398-d0e6-42d8-9926-572939fc0784',
    'Wrong id'
  );
  assert.equal(rubric.get('title'), 'Rubric - 1', 'Wrong title');
  assert.equal(
    rubric.get('description'),
    'This is the example question for the rubrics association',
    'Wrong description'
  );
  assert.equal(
    rubric.get('thumbnail'),
    `${contentCdnUrl}2c185398-d0e6-42d8-9926-572939fc0784.png`,
    'Wrong thumbnail'
  );
  assert.deepEqual(rubric.get('audience'), [12, 45], 'Wrong audience');
  assert.equal(rubric.get('standards.length'), 0, 'Wrong taxonomy');
  assert.equal(
    rubric.get('url'),
    'https://en.wikipedia.org/wiki/Rubric_(academic)',
    'Wrong url'
  );
  assert.notOk(rubric.get('uploaded'), 'Wrong uploaded value');
  assert.equal(
    rubric.get('feedback'),
    'Summarize your feedback on the essay as a whole',
    'Wrong feedback'
  );
  assert.ok(rubric.get('isPublished'), 'Should be published');
  assert.equal(
    rubric.get('publishDate'),
    '2017-02-24T05:55:42Z',
    'Incorrect publish date'
  );
  assert.ok(rubric.get('requiresFeedback'), 'Wrong requires feedback');
  assert.equal(rubric.get('categories.length'), 2, 'Wrong categories length');
  assert.equal(
    rubric.get('owner'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Wrong owner id'
  );
  assert.notOk(rubric.get('rubricOn'), 'Rubric should be off');
});

test('normalizeRubric with uploaded file', function(assert) {
  const serializer = this.subject();
  const contentCdnUrl = 'content-url/';
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: contentCdnUrl
      }
    })
  );

  const rubricData = {
    id: '2c185398-d0e6-42d8-9926-572939fc0784',
    title: 'Rubric - 1',
    description: 'This is the example question for the rubrics association',
    thumbnail: '2c185398-d0e6-42d8-9926-572939fc0784.png',
    publish_date: '2017-02-24T05:55:42Z',
    publishStatus: 'published',
    metadata: {
      audience: [12, 45]
    },
    taxonomy: {},
    url: '2c185398-d0e6-42d8-9926-572939fc0784.png',
    is_remote: false,
    is_rubric: false,
    feedback_guidance: 'Summarize your feedback on the essay as a whole',
    creator_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
    overall_feedback_required: true,
    categories: [
      {
        category_title: 'Thesis and Sub-claims'
      },
      {
        category_title: 'Thesis and Sub-claims'
      }
    ],
    created_at: '2017-02-24T05:55:42Z',
    updated_at: '2017-02-24T05:55:42Z',
    tenant: 'ba956a97-ae15-11e5-a302-f8a963065976'
  };

  const rubric = serializer.normalizeRubric(rubricData);

  assert.equal(
    rubric.get('id'),
    '2c185398-d0e6-42d8-9926-572939fc0784',
    'Wrong id'
  );
  assert.equal(rubric.get('title'), 'Rubric - 1', 'Wrong title');
  assert.equal(
    rubric.get('description'),
    'This is the example question for the rubrics association',
    'Wrong description'
  );
  assert.equal(
    rubric.get('thumbnail'),
    `${contentCdnUrl}2c185398-d0e6-42d8-9926-572939fc0784.png`,
    'Wrong thumbnail'
  );
  assert.deepEqual(rubric.get('audience'), [12, 45], 'Wrong audience');
  assert.equal(rubric.get('standards.length'), 0, 'Wrong taxonomy');
  assert.equal(
    rubric.get('url'),
    `${contentCdnUrl}2c185398-d0e6-42d8-9926-572939fc0784.png`,
    'Wrong url'
  );
  assert.ok(rubric.get('uploaded'), 'Wrong uploaded value');
  assert.equal(
    rubric.get('feedback'),
    'Summarize your feedback on the essay as a whole',
    'Wrong feedback'
  );
  assert.ok(rubric.get('isPublished'), 'Should be published');
  assert.equal(
    rubric.get('publishDate'),
    '2017-02-24T05:55:42Z',
    'Incorrect publish date'
  );
  assert.ok(rubric.get('requiresFeedback'), 'Wrong requires feedback');
  assert.equal(rubric.get('categories.length'), 2, 'Wrong categories length');
  assert.equal(
    rubric.get('owner'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Wrong owner id'
  );
  assert.notOk(rubric.get('rubricOn'), 'Rubric should be off');
});

test('normalizeQuestionsToGrade', function(assert) {
  const serializer = this.subject();

  const question = {
    gradeItems: [
      {
        unitId: 'unit-1',
        lessonId: 'lesson-1',
        collectionId: 'collection-1',
        resourceId: 'resource-1',
        studentCount: 10
      },
      {
        unitId: 'unit-2',
        lessonId: 'lesson-2',
        collectionId: 'collection-2',
        resourceId: 'resource-2',
        studentCount: 20
      }
    ],
    classId: 'class-1',
    courseId: 'course-2'
  };

  const gradeQuestion = serializer.normalizeQuestionsToGrade(question);
  assert.equal(gradeQuestion.get('classId'), 'class-1', 'Wrong classId');
  assert.equal(gradeQuestion.get('courseId'), 'course-2', 'Wrong courseId');
  assert.equal(gradeQuestion.get('gradeItems').length, 2, 'Wrong gradeItems');
});

test('normalizeGradeQuestion', function(assert) {
  const serializer = this.subject();

  const gradeItem = {
    unitId: 'unit-2',
    lessonId: 'lesson-2',
    collectionId: 'collection-2',
    resourceId: 'resource-2',
    studentCount: 10
  };

  const gradeQuestionItem = serializer.normalizeGradeQuestion(gradeItem);
  assert.equal(gradeQuestionItem.get('unitId'), 'unit-2', 'Wrong unitId');
  assert.equal(gradeQuestionItem.get('lessonId'), 'lesson-2', 'Wrong lessonId');
  assert.equal(
    gradeQuestionItem.get('collectionId'),
    'collection-2',
    'Wrong collectionId'
  );
  assert.equal(
    gradeQuestionItem.get('resourceId'),
    'resource-2',
    'Wrong resourceId'
  );
  assert.equal(gradeQuestionItem.get('studentCount'), 10, 'Wrong studentCount');
});

test('normalizeStudentsForQuestion', function(assert) {
  const serializer = this.subject();

  const students = {
    students: ['student-1', 'student-2', 'student-3']
  };

  const gradeQuestionStudents = serializer.normalizeStudentsForQuestion(
    students
  );
  assert.equal(
    gradeQuestionStudents.get('students').length,
    3,
    'Wrong studentCount'
  );
  assert.equal(
    gradeQuestionStudents.get('students')[0],
    'student-1',
    'Wrong student id'
  );
  assert.equal(
    gradeQuestionStudents.get('students')[1],
    'student-2',
    'Wrong student id'
  );
  assert.equal(
    gradeQuestionStudents.get('students')[2],
    'student-3',
    'Wrong student id'
  );
});

test('normalizeAnswerToGrade', function(assert) {
  const serializer = this.subject();

  const payload = {
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionId: 'collection-id',
    questionId: 'question-id',
    session_id: 'session-id',
    questionText: 'NA',
    answerText: [{ text: 'TBD - How will it be obtained and displayed' }],
    submittedAt: '2017-03-05 18:44:04.798',
    timeSpent: 500,
    userId: 'user-id'
  };

  const answerToGrade = serializer.normalizeAnswerToGrade(payload);
  assert.equal(answerToGrade.get('courseId'), 'course-id', 'Wrong course id');
  assert.equal(answerToGrade.get('unitId'), 'unit-id', 'Wrong unit id');
  assert.equal(answerToGrade.get('lessonId'), 'lesson-id', 'Wrong lesson id');
  assert.equal(
    answerToGrade.get('collectionId'),
    'collection-id',
    'Wrong collection id'
  );
  assert.equal(
    answerToGrade.get('questionId'),
    'question-id',
    'Wrong question id'
  );
  assert.equal(
    answerToGrade.get('sessionId'),
    'session-id',
    'Wrong session id'
  );
  assert.equal(answerToGrade.get('questionText'), 'NA', 'Wrong question text');
  assert.equal(
    answerToGrade.get('answerText'),
    'TBD - How will it be obtained and displayed',
    'Wrong answer text'
  );
  assert.equal(answerToGrade.get('timeSpent'), 500, 'Wrong time spent');
  assert.equal(answerToGrade.get('userId'), 'user-id', 'Wrong user id');
});

test('normalizeRubricQuestionSummary', function(assert) {
  const serializer = this.subject();

  const payload = {
    queRubrics: [
      {
        studentId: 'student-id',
        studentScore: 20,
        maxScore: 24,
        overallComment: 'Good Job!',
        categoryScore: [
          {
            level_score: 2,
            level_comment: 'Be more creative',
            category_title: 'Idea in Body Paragraph',
            level_obtained: 'Basic',
            level_max_score: 4
          }
        ]
      }
    ]
  };

  const questionSummary = serializer.normalizeRubricQuestionSummary(payload);
  assert.equal(
    questionSummary.get('studentId'),
    'student-id',
    'Wrong student id'
  );
  assert.equal(questionSummary.get('learnerScore'), 20, 'Wrong learner score');
  assert.equal(questionSummary.get('maxScore'), 24, 'Wrong max score');
  assert.equal(questionSummary.get('comment'), 'Good Job!', 'Wrong comment');
  assert.equal(
    questionSummary.categoriesScore.length,
    1,
    'Wrong categories score length'
  );
});

test('normalizeCategoryScore', function(assert) {
  const serializer = this.subject();

  const categoryScore = {
    level_score: 2,
    level_comment: 'Be more creative',
    category_title: 'Idea in Body Paragraph',
    level_obtained: 'Basic',
    level_max_score: 4
  };

  const categoryScoreItem = serializer.normalizeCategoryScore(categoryScore);
  assert.equal(
    categoryScoreItem.get('title'),
    'Idea in Body Paragraph',
    'Wrong title'
  );
  assert.equal(
    categoryScoreItem.get('levelObtained'),
    'Basic',
    'Wrong levelObtained'
  );
  assert.equal(
    categoryScoreItem.get('levelMaxScore'),
    4,
    'Wrong levelMaxScore'
  );
  assert.equal(categoryScoreItem.get('levelScore'), 2, 'Wrong levelScore');
  assert.equal(
    categoryScoreItem.get('levelComment'),
    'Be more creative',
    'Wrong levelComment'
  );
});

test('serializeStudentRubricGrades', function(assert) {
  assert.expect(27);
  const serializer = this.subject();

  const rubric = RubricGrade.create({
    eventName: 'resource.rubric.grade',
    id: 'rubric-id',
    title: 'Rubric - 1',
    description: 'Rubric description',
    studentId: 'student-id',
    classId: 'class-id',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionId: 'collection-id',
    resourceId: 'resource-id',
    sessionId: 'session-id',
    studentScore: 10,
    maxScore: 100,
    createdDate: new Date(1413222000000),
    updatedDate: new Date(1413308400000),
    comment: 'overall comment',
    categoriesScore: [GradeCategoryScore.create(), GradeCategoryScore.create()],
    tenantRoot: 'tenant-root',
    gutCodes: 'gut-codes',
    owner: 'owner-id',
    modifierId: 'modifier-id',
    originalCreatorId: 'original-creator',
    originalRubricId: 'original-rubric',
    parentRubricId: 'parent-rubric',
    publishDate: 'publish-date',
    rubricCreatedDate: 'created-date',
    rubricUpdatedDate: 'updated-date'
  });

  serializer.setProperties({
    serializeUpdateRubric: function(model) {
      assert.deepEqual(
        model,
        rubric,
        'Model in rubric serializer does not match'
      );
      assert.ok('Serialize update rubric called');
      return {};
    },
    serializeStudentRubricGradesExtra: function(model) {
      assert.deepEqual(
        model,
        rubric,
        'Model in extra serializer does not match'
      );
      assert.ok('Serialize grade extra rubric called');
      return {};
    }
  });

  const rubricObject = serializer.serializeStudentRubricGrades(rubric);
  assert.equal(rubricObject.event_name, 'resource.rubric.grade', 'Wrong title');
  assert.equal(rubricObject.rubric_id, 'rubric-id', 'Wrong id');
  assert.equal(rubricObject.title, 'Rubric - 1', 'Wrong title');
  assert.equal(
    rubricObject.description,
    'Rubric description',
    'Wrong description'
  );
  assert.equal(rubricObject.student_id, 'student-id', 'Wrong student_id');
  assert.equal(rubricObject.class_id, 'class-id', 'Wrong class_id');
  assert.equal(rubricObject.course_id, 'course-id', 'Wrong course_id');
  assert.equal(rubricObject.class_id, 'class-id', 'Wrong class_id');
  assert.equal(rubricObject.unit_id, 'unit-id', 'Wrong unit_id');
  assert.equal(rubricObject.lesson_id, 'lesson-id', 'Wrong lesson_id');
  assert.equal(
    rubricObject.collection_id,
    'collection-id',
    'Wrong collection_id'
  );
  assert.equal(rubricObject.session_id, 'session-id', 'Wrong session_id');
  assert.equal(rubricObject.student_score, 10, 'Wrong student_score');
  assert.equal(rubricObject.max_score, 100, 'Wrong max_score');
  assert.equal(rubricObject.created_at, 1413222000000, 'Wrong created_at');
  assert.equal(rubricObject.updated_at, 1413308400000, 'Wrong updated_at');
  assert.equal(
    rubricObject.category_score.length,
    2,
    'Wrong category scores length'
  );
  assert.equal(rubricObject.tenant_root, 'tenant-root', 'Wrong tenant root');
  assert.equal(rubricObject.gut_codes, 'gut-codes', 'Wrong gut codes');
  assert.equal(rubricObject.creator_id, 'owner-id', 'Wrong creator id');
  assert.equal(rubricObject.modifier_id, 'modifier-id', 'Wrong modifier id');
  assert.equal(
    rubricObject.original_creator_id,
    'original-creator',
    'Wrong original creator id'
  );
  assert.equal(
    rubricObject.original_rubric_id,
    'original-rubric',
    'Wrong original rubric id'
  );
  assert.equal(
    rubricObject.parent_rubric_id,
    'parent-rubric',
    'Wrong parent rubric id'
  );
  assert.equal(rubricObject.publish_date, 'publish-date', 'Wrong publish date');
  assert.equal(
    rubricObject.rubric_created_at,
    'created-date',
    'Wrong created at'
  );
  assert.equal(
    rubricObject.rubric_updated_at,
    'updated-date',
    'Wrong updated at'
  );
});

test('serializedStudentGradeCategoryScore', function(assert) {
  const serializer = this.subject();

  const gradeCategory = GradeCategoryScore.create({
    title: 'any-title',
    levelObtained: 'level-obtained',
    levelScore: 10,
    levelMaxScore: 80,
    levelComment: 'level-comment'
  });

  const categoryObject = serializer.serializedStudentGradeCategoryScore(
    gradeCategory
  );

  assert.equal(
    categoryObject.category_title,
    'any-title',
    'Wrong category title'
  );
  assert.equal(
    categoryObject.level_obtained,
    'level-obtained',
    'Wrong level obtained'
  );
  assert.equal(categoryObject.level_score, 10, 'Wrong level score');
  assert.equal(categoryObject.level_max_score, 80, 'Wrong level max score');
  assert.equal(
    categoryObject.level_comment,
    'level-comment',
    'Wrong level comment'
  );
});
