import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'adapter:collection/collection',
  'Unit | Adapter | collection/collection',
  {}
);

test('urlForFindRecord querying for a single collection', function(assert) {
  let adapter = this.subject();

  const id = 'any1D',
    url = adapter.urlForFindRecord(id);

  assert.equal(
    url,
    '/gooruapi/rest/v3/collection/any1D?includeItems=true&includeLastModifiedUser=true',
    'Wrong url'
  );
});

test('urlForQueryRecord querying for collections that belong to a specific lesson, unit, course and class', function(assert) {
  let adapter = this.subject();

  const query = {
      classId: 'any1D',
      courseId: 'any2D',
      unitId: 'any3D',
      lessonId: 'any4D'
    },
    url = adapter.urlForQueryRecord(query);

  assert.equal(
    url,
    '/gooruapi/rest/v3/class/any1D/course/any2D/unit/any3D/lesson/any4D',
    'Wrong url'
  );
});
