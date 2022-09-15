import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import ClassModel from 'gooru-web/models/content/class';

moduleForService('service:api-sdk/class', 'Unit | Service | api-sdk/class', {
  needs: [
    'serializer:class/class',
    'serializer:content/class',
    'model:class/class',
    'model:content/class',
    'model:content/classes',
    'adapter:class/class',
    'adapter:content/class'
  ]
});

test('archiveClass', function(assert) {
  const service = this.subject();
  let classId = 'class-id';

  assert.expect(1);

  service.set(
    'classAdapter',
    Ember.Object.create({
      archiveClass: function(classId) {
        assert.equal(classId, 'class-id', 'Wrong class id');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.archiveClass(classId).then(done);
});

test('createClass', function(assert) {
  const service = this.subject();
  let classModel = Ember.Object.create();

  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/classes',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'class-id' },
          ''
        ];
      },
      false
    );
  });

  service.set(
    'classSerializer',
    Ember.Object.create({
      serializeCreateClass: function(classObject) {
        assert.deepEqual(classObject, classModel, 'Wrong class object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.createClass(classModel).then(function() {
    assert.equal(classModel.get('id'), 'class-id', 'Wrong class id');
    done();
  });
});

test('updateClass', function(assert) {
  const service = this.subject();
  let classModel = ClassModel.create({
    id: 'class-id',
    title: 'class-title'
  });

  assert.expect(3);

  service.set(
    'classAdapter',
    Ember.Object.create({
      updateClass: function(classData) {
        assert.deepEqual(classData.class, {}, 'Wrong class object');
        assert.equal(classData.classId, 'class-id', 'Wrong class id');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'classSerializer',
    Ember.Object.create({
      serializeUpdateClass: function(classObject) {
        assert.deepEqual(classObject, classModel, 'Wrong class object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.updateClass(classModel).then(function() {
    done();
  });
});

test('deleteClass', function(assert) {
  const expectedClassId = 'class-id';
  const service = this.subject();

  assert.expect(1);

  service.set(
    'classAdapter',
    Ember.Object.create({
      deleteClass: function(classId) {
        assert.equal(classId, expectedClassId, 'Wrong class id');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.deleteClass('class-id').then(function() {
    done();
  });
});

test('removeStudentFromClass', function(assert) {
  const expectedClassId = 'class-id';
  const expectedUserId = 'user-id';
  const service = this.subject();

  assert.expect(2);

  service.set(
    'classAdapter',
    Ember.Object.create({
      removeStudentFromClass: function(classId, userId) {
        assert.equal(classId, expectedClassId, 'Wrong class id');
        assert.equal(userId, expectedUserId, 'Wrong user id');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.removeStudentFromClass('class-id', 'user-id').then(function() {
    done();
  });
});

test('joinClass successful', function(assert) {
  const service = this.subject();
  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/classes/any/members',
      function() {
        return [
          204,
          { 'Content-Type': 'text/plain', Location: 'class-id' },
          ''
        ];
      },
      false
    );
  });

  var done = assert.async();
  service.joinClass('any').then(function(classId) {
    assert.equal(classId, 'class-id', 'Joined should be true');
    done();
  });
});

test('joinClass restricted', function(assert) {
  const service = this.subject();
  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/classes/any/members',
      function() {
        return [400, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  var done = assert.async();
  service.joinClass('any').then(
    function() {
      assert.ok(false, 'Success callback should not be called');
      done();
    },
    function(error) {
      assert.equal(error.status, 400, 'Wrong error status');
      assert.equal(error.code, 'restricted', 'Wrong error code');
      done();
    }
  );
});

test('joinClass not found', function(assert) {
  const service = this.subject();
  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/classes/any/members',
      function() {
        return [404, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  var done = assert.async();
  service.joinClass('any').then(
    function() {
      assert.ok(false, 'Success callback should not be called');
      done();
    },
    function(error) {
      assert.equal(error.status, 404, 'Wrong error status');
      assert.equal(error.code, 'not-found', 'Wrong error code');
      done();
    }
  );
});

test('findMyClasses', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'classAdapter',
    Ember.Object.create({
      getMyClasses: function() {
        assert.ok(true, 'getMyClasses() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'classSerializer',
    Ember.Object.create({
      normalizeClasses: function(classesPayload) {
        assert.deepEqual({}, classesPayload, 'Wrong my classes payload');
        return Ember.Object.create({
          classes: []
        });
      }
    })
  );

  var done = assert.async();
  service.findMyClasses().then(function() {
    done();
  });
});

test('readClassInfo', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'classAdapter',
    Ember.Object.create({
      readClassInfo: function(classId) {
        assert.equal(classId, 'class-id', 'Wrong class id');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'classSerializer',
    Ember.Object.create({
      normalizeReadClassInfo: function(profilePayload) {
        assert.deepEqual({}, profilePayload, 'Wrong class payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readClassInfo('class-id').then(function() {
    done();
  });
});
test('readClassContentVisibility', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'classAdapter',
    Ember.Object.create({
      readClassContentVisibility: function(classId) {
        assert.equal(classId, 'class-id', 'Wrong class id');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'classSerializer',
    Ember.Object.create({
      normalizeReadClassContentVisibility: function(profilePayload) {
        assert.deepEqual({}, profilePayload, 'Wrong class payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readClassContentVisibility('class-id').then(function() {
    done();
  });
});
test('updateContentVisibility', function(assert) {
  const service = this.subject();
  let classId = 'class-id';

  let contentId = '59f7b7df-cef2-4f09-8012-1e58cb27b95a';
  let visibility = true;
  let type = 'assessments';

  assert.expect(5);

  service.set(
    'classSerializer',
    Ember.Object.create({
      serializeUpdateContentVisibility: function(contentId, visibility, type) {
        assert.deepEqual(
          '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
          contentId,
          'Wrong content id'
        );
        assert.deepEqual(true, visibility, 'Wrong visibility');
        assert.deepEqual('assessments', type, 'Wrong visibility');
        return {
          assessments: [{ id: contentId, visible: visibility ? 'on' : 'off' }]
        };
      }
    })
  );

  service.set(
    'classAdapter',
    Ember.Object.create({
      updateContentVisibility: function(classId, content) {
        assert.deepEqual(
          content.assessments,
          [
            {
              id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
              visible: 'on'
            }
          ],
          'Wrong content object'
        );
        assert.equal(classId, 'class-id', 'Wrong class id');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service
    .updateContentVisibility(classId, contentId, visibility, type)
    .then(function() {
      done();
    });
});

test('readClassMembers', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'classAdapter',
    Ember.Object.create({
      readClassMembers: function(classId) {
        assert.equal(classId, 'class-id', 'Wrong class id');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'classSerializer',
    Ember.Object.create({
      normalizeReadClassMembers: function(profilePayload) {
        assert.deepEqual({}, profilePayload, 'Wrong class payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readClassMembers('class-id').then(function() {
    done();
  });
});

test('findClassesIJoined', function(assert) {
  const service = this.subject();

  const response = {
      searchResult: [
        {
          classUid: '90d82226-5d0d-4673-a85d-f93aa0cbddf2',
          visibility: true,
          name: 'Class A1',
          classCode: '2WZ8IJA',
          courseGooruOid: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
          grades: 'K',
          user: {
            username: 'JeffreyTeacher01',
            gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
            profileImageUrl:
              'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
          },
          memberCount: 1
        }
      ],
      totalHitCount: 1
    },
    routes = function() {
      this.get(
        '/gooruapi/rest/v3/class/study',
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
  const promise = service.findClassesIJoined();
  promise.then(function(classes) {
    assert.equal(classes.get('length'), 1, 'Missing classes');
    const firstClass = classes.get('firstObject');
    assert.equal(
      firstClass.get('id'),
      '90d82226-5d0d-4673-a85d-f93aa0cbddf2',
      'Wrong id'
    );
    assert.equal(firstClass.get('name'), 'Class A1', 'Wrong name');
    assert.equal(firstClass.get('code'), '2WZ8IJA', 'Wrong code');
    assert.equal(firstClass.get('grades'), 'K', 'Wrong grades');
    assert.equal(
      firstClass.get('greetings'),
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Wrong greetings'
    );
    assert.equal(
      firstClass.get('teachers')[0].username,
      'JeffreyTeacher01',
      'Wrong teacher username'
    );
    done();
  });
});

test('findClassesITeach', function(assert) {
  const service = this.subject();

  const response = {
      searchResult: [
        {
          classUid: '67a96ec1-7383-4164-8068-5415621b7a34',
          visibility: true,
          name: 'Class A2',
          classCode: 'JR48FMF',
          courseGooruOid: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
          grades: 'K,6,7,8',
          user: {
            username: 'JeffreyTeacher01',
            gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
            profileImageUrl:
              'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
          },
          memberCount: 0
        },
        {
          classUid: '90d82226-5d0d-4673-a85d-f93aa0cbddf2',
          visibility: true,
          name: 'Class A1',
          classCode: '2WZ8IJA',
          grades: 'K',
          user: {
            username: 'JeffreyTeacher01',
            gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
            profileImageUrl:
              'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
          },
          memberCount: 1
        }
      ],
      totalHitCount: 2
    },
    routes = function() {
      this.get(
        '/gooruapi/rest/v3/class/teach',
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
  const promise = service.findClassesITeach();
  promise.then(function(classes) {
    assert.equal(classes.get('length'), 2, 'Missing classes');
    const firstClass = classes.get('firstObject');
    assert.equal(
      firstClass.get('id'),
      '67a96ec1-7383-4164-8068-5415621b7a34',
      'Wrong id'
    );
    assert.equal(firstClass.get('name'), 'Class A2', 'Wrong name');
    assert.equal(firstClass.get('code'), 'JR48FMF', 'Wrong code');
    assert.equal(firstClass.get('grades'), 'K,6,7,8', 'Wrong grades');
    assert.equal(
      firstClass.get('greetings'),
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Wrong greetings'
    );
    assert.equal(
      firstClass.get('teachers')[0].username,
      'JeffreyTeacher01',
      'Wrong teacher username'
    );
    const otherClass = classes.objectAt(1);
    assert.equal(
      otherClass.get('id'),
      '90d82226-5d0d-4673-a85d-f93aa0cbddf2',
      'Wrong id'
    );
    assert.equal(otherClass.get('name'), 'Class A1', 'Wrong name');
    assert.equal(otherClass.get('code'), '2WZ8IJA', 'Wrong code');
    assert.equal(otherClass.get('grades'), 'K', 'Wrong grades');
    assert.equal(
      otherClass.get('greetings'),
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Wrong greetings'
    );
    assert.equal(
      otherClass.get('teachers')[0].username,
      'JeffreyTeacher01',
      'Wrong teacher username'
    );
    done();
  });
});

test('findById', function(assert) {
  const service = this.subject();

  const response = {
      status: 'not-invited',
      visibility: true,
      courseGooruOid: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
      memberCount: 0,
      classUid: '67a96ec1-7383-4164-8068-5415621b7a34',
      name: 'Class A2',
      classCode: 'JR48FMF',
      grades: 'K,6,7,8',
      user: {
        username: 'JeffreyTeacher01',
        gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
        profileImageUrl:
          'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
      }
    },
    routes = function() {
      this.get(
        '/gooruapi/rest/v3/class/67a96ec1-7383-4164-8068-5415621b7a34',
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
  Ember.run(function() {
    const promise = service.findById('67a96ec1-7383-4164-8068-5415621b7a34');
    promise.then(function(classItem) {
      assert.equal(
        classItem.get('id'),
        '67a96ec1-7383-4164-8068-5415621b7a34',
        'Wrong id'
      );
      assert.equal(classItem.get('name'), 'Class A2', 'Wrong name');
      assert.equal(classItem.get('code'), 'JR48FMF', 'Wrong code');
      assert.equal(classItem.get('grades'), 'K,6,7,8', 'Wrong grades');
      assert.equal(
        classItem.get('greetings'),
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Wrong greetings'
      );
      assert.equal(
        classItem.get('teachers')[0].username,
        'JeffreyTeacher01',
        'Wrong teacher username'
      );
      done();
    });
  });
});

test('associateCourseToClass', function(assert) {
  const service = this.subject();
  const expectedCourseId = 'course-id';
  const expectedClassId = 'class-id';
  assert.expect(3);

  service.set(
    'classAdapter',
    Ember.Object.create({
      associateCourseToClass: function(courseId, classId) {
        assert.equal(courseId, expectedCourseId, 'Wrong course id');
        assert.equal(classId, expectedClassId, 'Wrong class id');
        return Ember.RSVP.resolve('');
      }
    })
  );

  var done = assert.async();
  service
    .associateCourseToClass(expectedCourseId, expectedClassId)
    .then(function() {
      assert.ok(true);
      done();
    });
});

test('readClassReportStatus', function(assert) {
  const service = this.subject();
  const expectedCourseId = 'course-id';
  const expectedClassId = 'class-id';
  assert.expect(4);

  service.set(
    'classAdapter',
    Ember.Object.create({
      readClassReportStatus: function(classId, courseId, userId) {
        assert.equal(courseId, expectedCourseId, 'Wrong course id');
        assert.equal(classId, expectedClassId, 'Wrong class id');
        assert.equal(userId, 'user-id', 'Wrong user id');
        return Ember.RSVP.resolve({ status: 'available' });
      }
    })
  );

  var done = assert.async();
  service
    .readClassReportStatus(expectedClassId, expectedCourseId, 'user-id')
    .then(function(response) {
      assert.equal(response, 'available', 'Wrong status');
      done();
    });
});

test('requestClassReport', function(assert) {
  const service = this.subject();
  const expectedCourseId = 'course-id';
  const expectedClassId = 'class-id';
  assert.expect(6);

  service.set(
    'classAdapter',
    Ember.Object.create({
      readClassReportStatus: function(classId, courseId, userId) {
        assert.equal(courseId, expectedCourseId, 'Wrong course id');
        assert.equal(classId, expectedClassId, 'Wrong class id');
        assert.equal(userId, 'user-id', 'Wrong user id');
        return Ember.RSVP.resolve({ status: 'available' });
      }
    })
  );

  service.storeClassReportStatus = function(classId, status) {
    assert.equal(status, 'available', 'Wrong status');
    assert.equal(classId, expectedClassId, 'Wrong class id');
  };

  var done = assert.async();
  service
    .requestClassReport(expectedClassId, expectedCourseId, 'user-id')
    .then(function(response) {
      assert.equal(response, 'available', 'Wrong status');
      done();
    });
});

test('storeClassReportStatus', function(assert) {
  const service = this.subject();
  const expectedClassIdA = 'class-id-a';
  const expectedClassIdB = 'class-id-b';

  service.set(
    'session',
    Ember.Object.create({
      userId: '1'
    })
  );

  service.storeClassReportStatus(expectedClassIdA, 'available');
  service.storeClassReportStatus(expectedClassIdB, 'queued');

  const storage = window.localStorage;
  const reportInfo = JSON.parse(storage.getItem('report-info'));
  const userInfo = reportInfo['1'];
  assert.ok(userInfo, 'Missing user info');
  assert.equal(
    userInfo.classes[expectedClassIdA],
    'available',
    'wrong class status'
  );
  assert.equal(
    userInfo.classes[expectedClassIdB],
    'queued',
    'wrong class status'
  );
});

test('getReportClassesStatusFromStore', function(assert) {
  window.localStorage.removeItem('report-info');

  const service = this.subject();
  service.set(
    'session',
    Ember.Object.create({
      userId: '2'
    })
  );

  let classesStatus = service.getReportClassesStatusFromStore('2');
  assert.deepEqual(classesStatus, {}, 'Status should be empty');

  service.storeClassReportStatus('2', 'available');
  classesStatus = service.getReportClassesStatusFromStore('2');
  assert.equal(classesStatus['2'], 'available', 'Wrong status');
});
