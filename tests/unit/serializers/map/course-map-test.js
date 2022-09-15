import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import CollectionModel from 'gooru-web/models/content/collection';
import AssessmentModel from 'gooru-web/models/content/assessment';
import AlternatePathModel from 'gooru-web/models/content/alternate-path';
import ResourceModel from 'gooru-web/models/content/resource';

moduleForComponent(
  'serializer:map/course-map',
  'Unit | Serializer | map/course-map'
);

test('normalizeLessonInfo', function(assert) {
  var course_path = {
    lesson_id: 'lesson-1',
    title: 'Lesson 1',
    collection_summary: [
      {
        id: 'assessment-1',
        title: 'A1',
        format: 'assessment'
      },
      {
        id: 'assessment-2',
        title: 'A2',
        format: 'assessment'
      }
    ]
  };

  var resource_path = {
    id: 173,
    ctx_course_id: 'course-1',
    ctx_unit_id: 'unit-1',
    ctx_lesson_id: 'lesson-1',
    ctx_collection_id: 'assessment-1',
    title: 'R1-resource',
    suggested_content_type: 'resource',
    suggested_content_subformat: 'webpage_resource',
    suggested_content_id: 'resource-1'
  };

  var resource_path2 = {
    id: 174,
    ctx_course_id: 'course-1',
    ctx_unit_id: 'unit-1',
    ctx_lesson_id: 'lesson-1',
    ctx_collection_id: 'assessment-2',
    title: 'R2-resource',
    suggested_content_type: 'resource',
    suggested_content_subformat: 'image_resource',
    suggested_content_id: 'resource-2'
  };

  const data = {
    alternate_paths: {
      system_suggestions: [resource_path],
      teacher_suggestions: [resource_path2]
    },
    course_path: course_path
  };

  const serializer = this.subject();
  serializer.set('lessonSerializer', {
    normalizeLesson: lesson => {
      assert.equal(lesson, course_path, 'Normalize param should match');
      return Ember.Object.create({
        title: 'normalized-lesson',
        children: [
          {
            id: 'assessment-1',
            title: 'A1',
            format: 'assessment'
          },
          {
            id: 'assessment-2',
            title: 'A2',
            format: 'assessment'
          }
        ]
      });
    }
  });
  serializer.set('collectionSerializer', {
    normalizeReadCollection: collection => {
      return CollectionModel.create({
        title: `normalized-collection-${collection}`,
        collectionSubType: collection
      });
    }
  });
  serializer.set('assessmentSerializer', {
    normalizeReadAssessment: assessment => {
      return AssessmentModel.create({
        title: `normalized-collection-${assessment}`,
        collectionSubType: assessment
      });
    }
  });
  serializer.set('assessmentSerializer', {
    normalizeReadAssessment: assessment => {
      return AssessmentModel.create({
        title: `normalized-collection-${assessment}`,
        collectionSubType: assessment
      });
    }
  });
  serializer.set('alternatePathSerializer', {
    normalizeSuggestedResource: alternatePath => {
      return AlternatePathModel.create({
        pathId: alternatePath.id,
        targetContentSubtype: alternatePath.target_content_subtype,
        targetContentType: alternatePath.target_content_type,
        contextCollectionId: alternatePath.ctx_collection_id,
        title: alternatePath.title,
        targetResourceId: alternatePath.target_resource_id
      });
    },

    normalizeReadResource: resourceData => {
      return ResourceModel.create({
        id: resourceData.targetResourceId,
        title: resourceData.title,
        assessmentId: resourceData.contextCollectionId
      });
    }
  });

  const serializedData = serializer.normalizeLessonInfo(data);
  assert.deepEqual(
    serializedData.get('title'),
    'normalized-lesson',
    'Returned data should match'
  );
  assert.deepEqual(
    serializedData.get('children').length,
    2,
    'Returned data length should match'
  );

  assert.deepEqual(
    serializedData.get('children')[0].title,
    'A1',
    'Should return first assessment title'
  );

  assert.deepEqual(
    serializedData.get('children')[1].title,
    'A2',
    'Should return second assessment title'
  );
});
