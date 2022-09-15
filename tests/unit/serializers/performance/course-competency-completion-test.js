import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/course-competency-completion',
  'Unit | Serializer | performance/course competency completion'
);
test('normalizeCourseCompetencyCompletion', function(assert) {
  const serializer = this.subject();
  const data = {
    courseId: '123',
    completedCount: 10,
    totalCount: 20
  };
  const courseCompetencyCompletion = serializer.normalizeCourseCompetencyCompletion(
    data
  );
  assert.equal(
    courseCompetencyCompletion.get('courseId'),
    '123',
    'Wrong course id'
  );
  assert.equal(
    courseCompetencyCompletion.get('completedCount'),
    10,
    'Wrong  completed competency count'
  );
  assert.equal(
    courseCompetencyCompletion.get('totalCount'),
    20,
    'Wrong total competency count'
  );
});

test('normalizeAllCourseCompetencyCompletion', function(assert) {
  const serializer = this.subject();
  const data = {
    usageData: [
      {
        courseId: '8c256e4a-4b37-423c-82b6-82fd8a128af2',
        completedCount: 2,
        totalCount: 4
      },
      {
        courseId: '18943604-108f-4b68-b4b1-b1b40ba6ba22',
        completedCount: 1,
        totalCount: 3
      }
    ],
    userId: '95a744e1-631e-4642-875d-8b07a5e3b421'
  };
  const items = serializer.normalizeAllCourseCompetencyCompletion(data);
  assert.equal(items.length, 2, 'Wrong number of items');
  assert.equal(
    items[0].get('courseId'),
    '8c256e4a-4b37-423c-82b6-82fd8a128af2',
    'Wrong course id'
  );
});
