import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/performance',
  'Unit | Service | api-sdk/performance',
  {
    needs: [
      'service:api-sdk/analytics',
      'service:api-sdk/performance',
      'adapter:performance/unit-performance',
      'adapter:performance/lesson-performance',
      'adapter:performance/collection-performance',
      'adapter:performance/class-collection-performance',
      'adapter:performance/class-lesson-performance',
      'adapter:performance/class-unit-performance',
      'serializer:performance/unit-performance',
      'serializer:performance/lesson-performance',
      'serializer:performance/collection-performance',
      'serializer:performance/class-unit-performance',
      'serializer:performance/class-lesson-performance',
      'serializer:performance/class-collection-performance',
      'model:performance/unit-performance',
      'model:performance/lesson-performance',
      'model:performance/collection-performance',
      'model:performance/class-unit-performance',
      'model:performance/class-lesson-performance',
      'model:performance/class-collection-performance',
      'model:performance/student-performance',
      'model:user/user',
      'model:meta',
      'model:taxonomy-preference',
      'model:performance/class-performance',
      'model:performance/performance',
      'validator:presence',
      'validator:format',
      'validator:length',
      'validator:username',
      'validator:email',
      'service:api-sdk/search',
      'service:api-sdk/taxonomy'
    ]
  }
);

test('findStudentPerformanceByCourse', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        userUid: 'user-id-1',
        usageData: [
          {
            unitId: 'unit-id-1',
            completedCount: 5,
            scoreInPercentage: 80,
            timeSpent: 121507,
            attempts: 16,
            totalCount: 10
          },
          {
            unitId: 'unit-id-2',
            completedCount: 3,
            scoreInPercentage: 55,
            timeSpent: 215122,
            attempts: 7,
            totalCount: 10
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };
  const units = Ember.A([
    Ember.Object.create({ id: 'unit-id-1', title: 'Unit 1' }),
    Ember.Object.create({ id: 'unit-id-2', title: 'Unit 2' })
  ]);
  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/performance',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(response)
        ];
      },
      0
    );
  };

  this.pretender.map(routes);

  var done = assert.async();
  const promise = service.findStudentPerformanceByCourse(
    'the-user-id',
    'the-class-id',
    'the-course-id',
    units
  );
  promise.then(function(unitPerformances) {
    assert.equal(
      unitPerformances.get('length'),
      2,
      'Missing unit performances'
    );
    const unitPerformance = unitPerformances.get('firstObject');
    assert.equal(unitPerformance.get('id'), 'unit-id-1', 'Wrong id');
    assert.equal(unitPerformance.get('type'), 'unit', 'Wrong type');
    assert.equal(unitPerformance.get('title'), 'Unit 1', 'Wrong title');
    assert.equal(unitPerformance.get('score'), 80, 'Wrong score');
    assert.equal(
      unitPerformance.get('completionDone'),
      5,
      'Wrong completion done'
    );
    assert.equal(
      unitPerformance.get('completionTotal'),
      10,
      'Wrong completion total'
    );
    assert.equal(unitPerformance.get('timeSpent'), 121507, 'Wrong time spent');
    assert.equal(unitPerformance.get('ratingScore'), 0, 'Wrong rating score');
    assert.equal(unitPerformance.get('attempts'), 16, 'Wrong attempts');
    assert.equal(
      unitPerformance.get('model.id'),
      'unit-id-1',
      'Wrong model id'
    );
    done();
  });
});

test('findStudentPerformanceByUnit', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        userUid: 'user-id-1',
        usageData: [
          {
            lessonId: 'lesson-id-1',
            completedCount: 5,
            scoreInPercentage: 65,
            timeSpent: 89141,
            attempts: 12,
            totalCount: 10
          },
          {
            lessonId: 'lesson-id-2',
            completedCount: 0,
            scoreInPercentage: 0,
            timeSpent: 32366,
            attempts: 4,
            totalCount: 0
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };
  const lessons = Ember.A([
    Ember.Object.create({ id: 'lesson-id-1', title: 'Lesson 1' }),
    Ember.Object.create({ id: 'lesson-id-2', title: 'Lesson 2' })
  ]);
  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/performance',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(response)
        ];
      },
      0
    );
  };

  this.pretender.map(routes);

  var done = assert.async();
  const promise = service.findStudentPerformanceByUnit(
    'the-user-id',
    'the-class-id',
    'the-course-id',
    'the-unit-id',
    lessons
  );
  promise.then(function(lessonPerformances) {
    assert.equal(
      lessonPerformances.get('length'),
      2,
      'Missing lesson performances'
    );
    const lessonPerformance = lessonPerformances.get('firstObject');
    assert.equal(lessonPerformance.get('id'), 'lesson-id-1', 'Wrong id');
    assert.equal(lessonPerformance.get('type'), 'lesson', 'Wrong type');
    assert.equal(lessonPerformance.get('title'), 'Lesson 1', 'Wrong title');
    assert.equal(lessonPerformance.get('score'), 65, 'Wrong score');
    assert.equal(
      lessonPerformance.get('completionDone'),
      5,
      'Wrong completion done'
    );
    assert.equal(
      lessonPerformance.get('completionTotal'),
      10,
      'Wrong completion total'
    );
    assert.equal(lessonPerformance.get('timeSpent'), 89141, 'Wrong time spent');
    assert.equal(lessonPerformance.get('ratingScore'), 0, 'Wrong rating score');
    assert.equal(lessonPerformance.get('attempts'), 12, 'Wrong attempts');
    assert.equal(
      lessonPerformance.get('model.id'),
      'lesson-id-1',
      'Wrong model id'
    );
    done();
  });
});

test('findStudentPerformanceByLesson', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        userUid: 'user-id-1',
        usageData: [
          {
            completedCount: 10,
            collectionId: 'collection-id-1',
            scoreInPercentage: 90,
            timeSpent: 130339,
            views: 18,
            totalCount: 20
          },
          {
            completedCount: 0,
            collectionId: 'collection-id-2',
            scoreInPercentage: 0,
            timeSpent: 0,
            views: 12,
            totalCount: 0
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };
  const collections = Ember.A([
    Ember.Object.create({ id: 'collection-id-1', title: 'Collection 1' }),
    Ember.Object.create({ id: 'collection-id-2', title: 'Collection 2' })
  ]);
  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/lesson/the-lesson-id/performance',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(response)
        ];
      },
      0
    );
  };

  this.pretender.map(routes);

  var done = assert.async();
  const promise = service.findStudentPerformanceByLesson(
    'the-user-id',
    'the-class-id',
    'the-course-id',
    'the-unit-id',
    'the-lesson-id',
    collections
  );
  promise.then(function(collectionPerformances) {
    assert.equal(
      collectionPerformances.get('length'),
      2,
      'Missing lesson performances'
    );
    const collectionPerformance = collectionPerformances.get('firstObject');
    assert.equal(
      collectionPerformance.get('id'),
      'collection-id-1',
      'Wrong id'
    );
    assert.equal(collectionPerformance.get('type'), 'collection', 'Wrong type');
    assert.equal(
      collectionPerformance.get('title'),
      'Collection 1',
      'Wrong title'
    );
    assert.equal(collectionPerformance.get('score'), 90, 'Wrong score');
    assert.equal(
      collectionPerformance.get('completionDone'),
      10,
      'Wrong completion done'
    );
    assert.equal(
      collectionPerformance.get('completionTotal'),
      20,
      'Wrong completion total'
    );
    assert.equal(
      collectionPerformance.get('timeSpent'),
      130339,
      'Wrong time spent'
    );
    assert.equal(
      collectionPerformance.get('ratingScore'),
      0,
      'Wrong rating score'
    );
    assert.equal(
      collectionPerformance.get('attempts'),
      undefined,
      'Wrong attempts'
    );
    assert.equal(
      collectionPerformance.get('model.id'),
      'collection-id-1',
      'Wrong model id'
    );
    done();
  });
});

test('findClassPerformance', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        usageData: [
          {
            completedCount: 10,
            totalCount: 10,
            unitId: 'unit-id-1',
            scoreInPercentage: 100,
            timeSpent: 2349605,
            attempts: 1
          }
        ],
        userUid: 'user-id-1'
      }
    ],
    message: null,
    paginate: null
  };

  const unitIds = Ember.A(['unit-id-1']);

  const users = Ember.A([
    Ember.Object.create({
      id: 'user-id-1',
      username: 'username',
      firstName: 'first',
      lastName: 'last',
      units: unitIds
    })
  ]);

  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/performance',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(response)
        ];
      },
      0
    );
  };

  this.pretender.map(routes);

  var done = assert.async();
  const promise = service.findClassPerformance(
    'the-class-id',
    'the-course-id',
    users
  );
  promise.then(function(classPerformanceData) {
    const studentPerformance = classPerformanceData.get(
      'studentPerformanceData'
    );
    assert.equal(
      studentPerformance.get('length'),
      1,
      'Missing student performances'
    );

    const performanceObject = studentPerformance.get('firstObject');
    const performanceData = performanceObject.get('performanceData');

    const user = performanceObject.get('user');
    assert.equal(user.get('id'), 'user-id-1', 'Wrong id');
    assert.equal(user.get('username'), 'username', 'Wrong username');
    assert.equal(user.get('firstName'), 'first', 'Wrong first name');
    assert.equal(user.get('lastName'), 'last', 'Wrong last name');

    assert.equal(performanceData.get('length'), 1, 'Missing performances');
    const performance = performanceData.get('firstObject');
    assert.equal(performance.get('attempts'), 1, 'Wrong attempts');
    assert.equal(
      performance.get('completionDone'),
      10,
      'Wrong completion done'
    );
    assert.equal(
      performance.get('completionTotal'),
      10,
      'Wrong completion total'
    );
    assert.equal(performance.get('score'), 100, 'Wrong score');
    assert.equal(performance.get('ratingScore'), 0, 'Wrong rating score');
    assert.equal(performance.get('timeSpent'), 2349605, 'Wrong time spent');
    assert.equal(performance.get('type'), 'unit', 'Wrong type');
    done();
  });
});

test('findClassPerformanceByUnit', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        usageData: [
          {
            completedCount: 10,
            totalCount: 10,
            lessonId: 'lesson-id-1',
            scoreInPercentage: 100,
            timeSpent: 2349605,
            attempts: 1
          }
        ],
        userUid: 'user-id-1'
      }
    ],
    message: null,
    paginate: null
  };

  const collectionIds = Ember.A(['lesson-id-1']);

  const users = Ember.A([
    Ember.Object.create({
      id: 'user-id-1',
      username: 'username',
      firstName: 'first',
      lastName: 'last',
      units: collectionIds
    })
  ]);

  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/performance',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(response)
        ];
      },
      0
    );
  };

  this.pretender.map(routes);

  var done = assert.async();
  const promise = service.findClassPerformanceByUnit(
    'the-class-id',
    'the-course-id',
    'the-unit-id',
    users
  );
  promise.then(function(classPerformanceData) {
    const studentPerformance = classPerformanceData.get(
      'studentPerformanceData'
    );
    assert.equal(
      studentPerformance.get('length'),
      1,
      'Missing student performances'
    );

    const performanceObject = studentPerformance.get('firstObject');
    const performanceData = performanceObject.get('performanceData');

    const user = performanceObject.get('user');
    assert.equal(user.get('id'), 'user-id-1', 'Wrong id');
    assert.equal(user.get('username'), 'username', 'Wrong username');
    assert.equal(user.get('firstName'), 'first', 'Wrong first name');
    assert.equal(user.get('lastName'), 'last', 'Wrong last name');

    assert.equal(performanceData.get('length'), 1, 'Missing performances');
    const performance = performanceData.get('firstObject');
    assert.equal(performance.get('attempts'), 1, 'Wrong attempts');
    assert.equal(
      performance.get('completionDone'),
      10,
      'Wrong completion done'
    );
    assert.equal(
      performance.get('completionTotal'),
      10,
      'Wrong completion total'
    );
    assert.equal(performance.get('score'), 100, 'Wrong score');
    assert.equal(performance.get('ratingScore'), 0, 'Wrong rating score');
    assert.equal(performance.get('timeSpent'), 2349605, 'Wrong time spent');
    assert.equal(performance.get('type'), 'lesson', 'Wrong type');
    done();
  });
});

test('findClassPerformanceSummaryByStudentAndClassIds', function(assert) {
  const service = this.subject();
  assert.expect(4);

  service.set(
    'classPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllClassPerformanceSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return [1, 2, 3, 4, 5]; //fake response
      }
    })
  );

  service.set(
    'classPerformanceSummaryAdapter',
    Ember.Object.create({
      findClassPerformanceSummaryByStudentAndClassIds: function(
        userId,
        classIds
      ) {
        assert.deepEqual(userId, 123, 'Wrong id');
        assert.deepEqual(classIds, [1, 2, 3], 'Wrong ids');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .findClassPerformanceSummaryByStudentAndClassIds(123, [1, 2, 3])
    .then(function(response) {
      assert.deepEqual(response, [1, 2, 3, 4, 5], 'Wrong response');
      done();
    });
});

test('findClassPerformanceSummaryByStudentAndClassIds with empty class ids', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'classPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllClassPerformanceSummary: function() {
        assert.ok(false, 'this should not be called');
        return '';
      }
    })
  );

  service.set(
    'classPerformanceSummaryAdapter',
    Ember.Object.create({
      findClassPerformanceSummaryByStudentAndClassIds: function() {
        assert.ok(false, 'this should not be called');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .findClassPerformanceSummaryByStudentAndClassIds(123, [])
    .then(function(response) {
      assert.deepEqual(response, [], 'Wrong response');
      done();
    });
});

test('findClassPerformanceSummaryByClassIds', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'classPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllClassPerformanceSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return [1, 2, 3, 4, 5]; //fake response
      }
    })
  );

  service.set(
    'classPerformanceSummaryAdapter',
    Ember.Object.create({
      findClassPerformanceSummaryByClassIds: function(classIds) {
        assert.deepEqual(classIds, [1, 2, 3], 'Wrong ids');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .findClassPerformanceSummaryByClassIds([1, 2, 3])
    .then(function(response) {
      assert.deepEqual(response, [1, 2, 3, 4, 5], 'Wrong response');
      done();
    });
});

test('findClassPerformanceSummaryByClassIds with empty ids', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'classPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllClassPerformanceSummary: function() {
        assert.ok(false, 'this should not be called');
        return ''; //fake response
      }
    })
  );

  service.set(
    'classPerformanceSummaryAdapter',
    Ember.Object.create({
      findClassPerformanceSummaryByClassIds: function() {
        assert.ok(false, 'fake-data', 'Wrong data');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service.findClassPerformanceSummaryByClassIds([]).then(function(response) {
    assert.deepEqual(response, [], 'Wrong response');
    done();
  });
});

test('searchStudentCollectionPerformanceSummary', function(assert) {
  const service = this.subject();
  assert.expect(4);

  service.set(
    'collectionPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllCollectionPerformanceSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return [1, 2, 3, 4, 5]; //fake response
      }
    })
  );

  service.set(
    'collectionPerformanceSummaryAdapter',
    Ember.Object.create({
      searchStudentCollectionPerformanceSummary: function(studentId, criteria) {
        assert.equal(studentId, 123, 'Wrong student id');
        assert.deepEqual(criteria, { courseId: 321 }, 'Wrong criteria');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .searchStudentCollectionPerformanceSummary(123, { courseId: 321 })
    .then(function(response) {
      assert.deepEqual(response, [1, 2, 3, 4, 5], 'Wrong response');
      done();
    });
});

test('findCollectionPerformanceSummaryByIds', function(assert) {
  const service = this.subject();
  assert.expect(7);

  service.set(
    'collectionPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllCollectionPerformanceSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return [1, 2, 3, 4, 5]; //fake response
      }
    })
  );

  service.set(
    'collectionPerformanceSummaryAdapter',
    Ember.Object.create({
      findCollectionPerformanceSummaryByIds: function(
        userId,
        collectionIds,
        collectionType,
        classId,
        timePeriod
      ) {
        assert.equal(userId, 123, 'Wrong user id');
        assert.deepEqual(collectionIds, [1, 2, 3], 'Wrong collection ids');
        assert.equal(collectionType, 'assessment', 'Wrong collection type');
        assert.equal(classId, 321, 'Wrong class id');
        assert.equal(timePeriod, 'any time period', 'Wrong time period');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .findCollectionPerformanceSummaryByIds(
      123,
      [1, 2, 3],
      'assessment',
      321,
      'any time period'
    )
    .then(function(response) {
      assert.deepEqual(response, [1, 2, 3, 4, 5], 'Wrong response');
      done();
    });
});

test('findClassActivityPerformanceSummaryByIds', function(assert) {
  const service = this.subject();
  assert.expect(8);

  service.set(
    'activityPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllActivityPerformanceSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return []; //fake response
      }
    })
  );

  service.set(
    'activityPerformanceSummaryAdapter',
    Ember.Object.create({
      findClassActivityPerformanceSummaryByIds: function(
        userId,
        classId,
        activityIds,
        activityType,
        startDate,
        endDate
      ) {
        assert.equal(
          userId,
          undefined,
          'Wrong user id, should be undefined when getting class data'
        );
        assert.deepEqual(activityIds, [1, 2, 3], 'Wrong activity ids');
        assert.equal(activityType, 'assessment', 'Wrong collection type');
        assert.equal(classId, 321, 'Wrong class id');
        assert.equal(startDate, 'fake-start-date', 'Wrong start date');
        assert.equal(endDate, 'fake-end-date', 'Wrong start date');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .findClassActivityPerformanceSummaryByIds(
      321,
      [1, 2, 3],
      'assessment',
      'fake-start-date',
      'fake-end-date'
    )
    .then(function(response) {
      assert.ok(response, 'Missing response');
      done();
    });
});

test('findStudentActivityPerformanceSummaryByIds', function(assert) {
  const service = this.subject();
  assert.expect(8);

  service.set(
    'activityPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeAllActivityPerformanceSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return [1, 2, 3, 4, 5]; //fake response
      }
    })
  );

  service.set(
    'activityPerformanceSummaryAdapter',
    Ember.Object.create({
      findClassActivityPerformanceSummaryByIds: function(
        userId,
        classId,
        activityIds,
        activityType,
        startDate,
        endDate
      ) {
        assert.equal(userId, 123, 'Wrong user id');
        assert.deepEqual(activityIds, [1, 2, 3], 'Wrong activity ids');
        assert.equal(activityType, 'assessment', 'Wrong collection type');
        assert.equal(classId, 321, 'Wrong class id');
        assert.equal(startDate, 'fake-start-date', 'Wrong start date');
        assert.equal(endDate, 'fake-end-date', 'Wrong start date');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service
    .findStudentActivityPerformanceSummaryByIds(
      123,
      321,
      [1, 2, 3],
      'assessment',
      'fake-start-date',
      'fake-end-date'
    )
    .then(function(response) {
      assert.deepEqual(response, [1, 2, 3, 4, 5], 'Wrong response');
      done();
    });
});

test('findCourseCompetencyCompletionByCourseIds', function(assert) {
  const service = this.subject();
  assert.expect(4);

  service.set(
    'courseCompetencyCompletionSerializer',
    Ember.Object.create({
      normalizeAllCourseCompetencyCompletion: function(data) {
        assert.equal(data, 'dummy-data', 'Wrong data');
        return [1, 2, 3, 4, 5]; //dummy response
      }
    })
  );

  service.set(
    'courseCompetencyCompletionAdapter',
    Ember.Object.create({
      findCourseCompetencyCompletionByCourseIds: function(userId, courseIds) {
        assert.deepEqual(userId, 123, 'Wrong id');
        assert.deepEqual(courseIds, [1, 2, 3], 'Wrong ids');
        return Ember.RSVP.resolve('dummy-data');
      }
    })
  );

  var done = assert.async();
  service
    .findCourseCompetencyCompletionByCourseIds(123, [1, 2, 3])
    .then(function(response) {
      assert.deepEqual(response, [1, 2, 3, 4, 5], 'Wrong response');
      done();
    });
});

test('findCourseCompetencyCompletionByCourseIds with empty course ids', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'courseCompetencyCompletionSerializer',
    Ember.Object.create({
      normalizeAllCourseCompetencyCompletion: function() {
        assert.ok(false, 'this should not be called');
        return '';
      }
    })
  );

  service.set(
    'courseCompetencyCompletionAdapter',
    Ember.Object.create({
      findCourseCompetencyCompletionByCourseIds: function() {
        assert.ok(false, 'this should not be called');
        return Ember.RSVP.resolve('dummy-data');
      }
    })
  );

  var done = assert.async();
  service
    .findCourseCompetencyCompletionByCourseIds(123, [])
    .then(function(response) {
      assert.deepEqual(response, [], 'Wrong response');
      done();
    });
});
