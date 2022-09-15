import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import {
  ASSESSMENT_SHOW_VALUES,
  ASSESSMENT_SUB_TYPES
} from 'gooru-web/config/config';
import AssessmentModel from 'gooru-web/models/content/assessment';

moduleForComponent(
  'serializer:content/assessment',
  'Unit | Serializer | content/assessment'
);

test('serializeCreateAssessment', function(assert) {
  const serializer = this.subject();
  const assessmentObject = AssessmentModel.create({
    title: 'assessment-title',
    learningObjectives: 'any',
    isVisibleOnProfile: true,
    thumbnailUrl: 'http://test-bucket01.s3.amazonaws.com/image-id.png',
    standards: [],
    attempts: 1,
    bidirectional: true,
    showFeedback: 'summary',
    showKey: true
  });
  const response = serializer.serializeCreateAssessment(assessmentObject);
  assert.equal(response.title, 'assessment-title', 'Wrong title');
  assert.equal(response.learning_objective, 'any', 'Wrong learning objective');
  assert.equal(response.visible_on_profile, true, 'Wrong visible on profile');
  assert.equal(response.thumbnail, 'image-id.png', 'Wrong thumbnail');
  assert.equal(response.setting.attempts_allowed, 1, 'Wrong attempts allowed');
  assert.equal(
    response.setting.bidirectional_play,
    true,
    'Wrong bidirectional play'
  );
  assert.equal(
    response.setting.show_feedback,
    'summary',
    'Wrong show feedback'
  );
  assert.equal(response.setting.show_key, 'summary', 'Wrong show key');
});

test('serializeUpdateAssessment', function(assert) {
  const serializer = this.subject();
  const assessmentObject = AssessmentModel.create({
    title: 'assessment-title',
    learningObjectives: 'any',
    isVisibleOnProfile: false,
    thumbnailUrl: 'http://test-bucket01.s3.amazonaws.com/image-id.png',
    standards: [],
    audience: [1],
    depthOfknowledge: [4],
    centurySkills: [2]
  });
  const response = serializer.serializeUpdateAssessment(assessmentObject);
  assert.equal(response.title, 'assessment-title', 'Wrong title');
  assert.equal(response.learning_objective, 'any', 'Wrong learning objective');
  assert.equal(response.visible_on_profile, false, 'Wrong visible on profile');
  assert.equal(response.thumbnail, 'image-id.png', 'Wrong thumbnail');
  assert.equal(response.taxonomy, null, 'Wrong taxonomy object');
  assert.equal(response.taxonomy, null, 'Wrong taxonomy object');
  assert.equal(response.metadata.audience[0], 1, 'Wrong audience');
  assert.equal(
    response.metadata.depth_of_knowledge[0],
    4,
    'Wrong depth_of_knowledge'
  );
  assert.equal(
    response.metadata['21_century_skills'][0],
    2,
    'Wrong centurySkill'
  );
  assert.equal(response.setting.attempts_allowed, -1, 'Wrong attempts allowed');
  assert.equal(
    response.setting.bidirectional_play,
    false,
    'Wrong bidirectional play'
  );
  assert.equal(
    response.setting.show_feedback,
    ASSESSMENT_SHOW_VALUES.SUMMARY,
    'Wrong show feedback'
  );
  assert.equal(
    response.setting.show_key,
    ASSESSMENT_SHOW_VALUES.NEVER,
    'Wrong show key'
  );
});

test('serializeUpdateAssessmentTitle', function(assert) {
  const serializer = this.subject();
  const response = serializer.serializeUpdateAssessmentTitle(
    'assessment-title'
  );
  assert.equal(response.title, 'assessment-title', 'Wrong title');
});

test('normalizeReadAssessment', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const assessmentData = {
    id: 'assessment-id',
    title: 'assessment-title',
    learning_objective: 'learning-objectives',
    visible_on_profile: true,
    thumbnail: 'image-id.png',
    taxonomy: {},
    format: 'assessment-external',
    url: 'any',
    metadata: {
      audience: [1],
      depth_of_knowledge: [4],
      '21_century_skills': [2]
    },
    setting: {
      attempts_allowed: 1,
      bidirectional_play: true,
      show_feedback: ASSESSMENT_SHOW_VALUES.SUMMARY,
      show_key: ASSESSMENT_SHOW_VALUES.SUMMARY
    },
    course_id: 1,
    unit_id: 2,
    lesson_id: 3
  };
  const assessment = serializer.normalizeReadAssessment(assessmentData);
  assert.equal(assessment.get('id'), 'assessment-id', 'Wrong id');
  assert.equal(assessment.get('title'), 'assessment-title', 'Wrong title');
  assert.equal(
    assessment.get('thumbnailUrl'),
    'http://test-bucket01.s3.amazonaws.com/image-id.png',
    'Wrong image'
  );
  assert.equal(
    assessment.get('learningObjectives'),
    'learning-objectives',
    'Wrong learningObjectives'
  );
  assert.equal(
    assessment.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
  assert.equal(
    assessment.get('standards.length'),
    0,
    'Wrong standards number of elements'
  );
  assert.equal(assessment.get('format'), 'assessment-external', 'Wrong format');
  assert.equal(assessment.get('url'), 'any', 'Wrong url');
  assert.equal(assessment.get('audience'), 1, 'Wrong audience');
  assert.equal(assessment.get('depthOfknowledge'), 4, 'Wrong depthOfknowledge');
  assert.equal(assessment.get('centurySkills'), 2, 'Wrong century Skills');
  assert.equal(assessment.get('attempts'), 1, 'Wrong attemps');
  assert.equal(assessment.get('bidirectional'), true, 'Wrong bidirectional');
  assert.equal(
    assessment.get('showFeedback'),
    ASSESSMENT_SHOW_VALUES.SUMMARY,
    'Wrong show feedback'
  );
  assert.equal(assessment.get('showKey'), true, 'Wrong show key');
  assert.equal(assessment.get('courseId'), 1, 'Wrong course id');
  assert.equal(assessment.get('unitId'), 2, 'Wrong unit id');
  assert.equal(assessment.get('lessonId'), 3, 'Wrong lesson id');
});

test('normalizeReadAssessment for alternate paths', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const assessmentData = {
    id: 1,
    target_course_id: 'course-id',
    target_unit_id: 'unit-id',
    target_lesson_id: 'lesson-id',
    target_collection_id: 'assessment-id',
    target_content_subtype: ASSESSMENT_SUB_TYPES.PRE_TEST,
    target_content_type: 'assessment',
    title: 'assessment-title',
    learning_objective: 'learning-objectives',
    visible_on_profile: true,
    thumbnail: 'image-id.png',
    taxonomy: {},
    format: 'assessment-external',
    url: 'any',
    metadata: {
      audience: [1],
      depth_of_knowledge: [4],
      '21_century_skills': [2]
    },
    setting: {
      attempts_allowed: 1,
      bidirectional_play: true,
      show_feedback: ASSESSMENT_SHOW_VALUES.SUMMARY,
      show_key: ASSESSMENT_SHOW_VALUES.SUMMARY
    }
  };
  const assessment = serializer.normalizeReadAssessment(assessmentData);
  assert.equal(assessment.get('id'), 'assessment-id', 'Wrong id');
  assert.equal(assessment.get('pathId'), 1, 'Wrong path id');
  assert.equal(assessment.get('title'), 'assessment-title', 'Wrong title');
  assert.equal(
    assessment.get('thumbnailUrl'),
    'http://test-bucket01.s3.amazonaws.com/image-id.png',
    'Wrong image'
  );
  assert.equal(
    assessment.get('learningObjectives'),
    'learning-objectives',
    'Wrong learningObjectives'
  );
  assert.equal(
    assessment.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
  assert.equal(
    assessment.get('standards.length'),
    0,
    'Wrong standards number of elements'
  );
  assert.equal(assessment.get('format'), 'assessment-external', 'Wrong format');
  assert.equal(assessment.get('url'), 'any', 'Wrong url');
  assert.equal(assessment.get('audience'), 1, 'Wrong audience');
  assert.equal(assessment.get('depthOfknowledge'), 4, 'Wrong depthOfknowledge');
  assert.equal(assessment.get('centurySkills'), 2, 'Wrong century Skills');
  assert.equal(assessment.get('attempts'), 1, 'Wrong attemps');
  assert.equal(assessment.get('bidirectional'), true, 'Wrong bidirectional');
  assert.equal(
    assessment.get('showFeedback'),
    ASSESSMENT_SHOW_VALUES.SUMMARY,
    'Wrong show feedback'
  );
  assert.equal(assessment.get('showKey'), true, 'Wrong show key');
  assert.equal(assessment.get('courseId'), 'course-id', 'Wrong course id');
  assert.equal(assessment.get('unitId'), 'unit-id', 'Wrong unit id');
  assert.equal(assessment.get('lessonId'), 'lesson-id', 'Wrong lesson id');
});

test('normalizeReadAssessment with nulls', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const assessmentData = {
    id: 'assessment-id',
    title: 'assessment-title',
    learning_objective: 'learning-objectives',
    visible_on_profile: true,
    thumbnail: 'image-id.png',
    taxonomy: {},
    format: 'assessment-external',
    url: 'any',
    metadata: {
      audience: [1],
      depth_of_knowledge: [4]
    }
  };
  const assessment = serializer.normalizeReadAssessment(assessmentData);
  assert.equal(assessment.get('id'), 'assessment-id', 'Wrong id');
  assert.equal(assessment.get('title'), 'assessment-title', 'Wrong title');
  assert.equal(
    assessment.get('thumbnailUrl'),
    'http://test-bucket01.s3.amazonaws.com/image-id.png',
    'Wrong image'
  );
  assert.equal(
    assessment.get('learningObjectives'),
    'learning-objectives',
    'Wrong learningObjectives'
  );
  assert.equal(
    assessment.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
  assert.equal(
    assessment.get('standards.length'),
    0,
    'Wrong standards number of elements'
  );
  assert.equal(assessment.get('format'), 'assessment-external', 'Wrong format');
  assert.equal(assessment.get('url'), 'any', 'Wrong url');
  assert.equal(assessment.get('audience'), 1, 'Wrong audience');
  assert.equal(assessment.get('depthOfknowledge'), 4, 'Wrong depthOfknowledge');
  assert.equal(assessment.get('attempts'), -1, 'Wrong attempts');
  assert.equal(assessment.get('bidirectional'), false, 'Wrong bidirectional');
  assert.equal(
    assessment.get('showFeedback'),
    ASSESSMENT_SHOW_VALUES.SUMMARY,
    'Wrong show feedback'
  );
  assert.equal(assessment.get('showKey'), false, 'Wrong show key');
});

test('serializeReorderAssessment', function(assert) {
  const serializer = this.subject();
  const ids = ['a', 'b', 'c'];
  const data = serializer.serializeReorderAssessment(ids);
  assert.ok(data.order, 'Missing order');
  assert.equal(data.order.length, 3, 'Wrong order total');
  assert.equal(data.order[0].id, 'a', 'Wrong id');
  assert.equal(data.order[0].sequence_id, 1, 'Wrong sequence id');
});

test('normalizeReadAssessment - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const assessmentData = {
    id: 'assessment-id'
  };
  const assessment = serializer.normalizeReadAssessment(assessmentData);
  assert.equal(assessment.get('id'), 'assessment-id', 'Wrong id');
  assert.equal(
    assessment.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
});

test('normalizeReadAssessment - if it is not visible on profile', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const assessmentData = {
    id: 'assessment-id',
    visible_on_profile: false
  };
  const assessment = serializer.normalizeReadAssessment(assessmentData);
  assert.equal(assessment.get('id'), 'assessment-id', 'Wrong id');
  assert.equal(
    assessment.get('isVisibleOnProfile'),
    false,
    'Wrong isVisibleOnProfile'
  );
});
