import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('serializer:class/class', 'Unit | Serializer | class/class');

test('normalizeQueryResponse', function(assert) {
  const serializer = this.subject();

  const payload = {
      searchResult: [
        {
          classUid: '67a96ec1-7383-4164-8068-5415621b7a34',
          visibility: true,
          course: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
          name: 'Class A2',
          subject: 'Math',
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
          courseGooruOid: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
          name: 'Class A1',
          subject: 'Math',
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
    response = serializer.normalizeQueryResponse(
      'any store',
      'class/class',
      payload
    );

  const expected = {
    data: [
      {
        id: '67a96ec1-7383-4164-8068-5415621b7a34',
        type: 'class/class',
        attributes: {
          name: 'Class A2',
          subject: 'Math',
          code: 'JR48FMF',
          greetings:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          startDate: '9.2.2015',
          endDate: '12.15.2015',
          grades: 'K,6,7,8',
          visibility: true,
          course: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
          totalMembers: 0,
          teachers: [
            {
              id: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
              username: 'JeffreyTeacher01',
              avatarUrl:
                'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
            }
          ]
        }
      },
      {
        id: '90d82226-5d0d-4673-a85d-f93aa0cbddf2',
        type: 'class/class',
        attributes: {
          name: 'Class A1',
          subject: 'Math',
          code: '2WZ8IJA',
          greetings:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          startDate: '9.2.2015',
          endDate: '12.15.2015',
          grades: 'K',
          visibility: true,
          course: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
          totalMembers: 1,
          teachers: [
            {
              id: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
              username: 'JeffreyTeacher01',
              avatarUrl:
                'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
            }
          ]
        }
      }
    ]
  };

  assert.deepEqual(response, expected, 'Wrong response');
});

test('normalizeFindRecordResponse', function(assert) {
  const serializer = this.subject();

  const payload = {
      status: 'not-invited',
      visibility: true,
      course: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
      courseGooruOid: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
      memberCount: 0,
      classUid: '67a96ec1-7383-4164-8068-5415621b7a34',
      name: 'Class A2',
      classCode: 'JR48FMF',
      grades: 'K,6,7,8',
      subject: 'Math',
      user: {
        username: 'JeffreyTeacher01',
        gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
        profileImageUrl:
          'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
      }
    },
    response = serializer.normalizeFindRecordResponse(
      'any store',
      'class/class',
      payload
    );

  const expected = {
    data: {
      id: '67a96ec1-7383-4164-8068-5415621b7a34',
      type: 'class/class',
      attributes: {
        name: 'Class A2',
        code: 'JR48FMF',
        greetings:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        startDate: '9.2.2015',
        endDate: '12.15.2015',
        grades: 'K,6,7,8',
        subject: 'Math',
        visibility: true,
        course: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
        totalMembers: 0,
        teachers: [
          {
            id: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
            username: 'JeffreyTeacher01',
            avatarUrl:
              'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
          }
        ]
      }
    }
  };

  assert.deepEqual(response, expected, 'Wrong response');
});

test('normalizeClass', function(assert) {
  const serializer = this.subject();

  const payload = {
      status: 'not-invited',
      visibility: true,
      courseGooruOid: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
      memberCount: 0,
      classUid: '67a96ec1-7383-4164-8068-5415621b7a34',
      name: 'Class A2',
      classCode: 'JR48FMF',
      grades: 'K,6,7,8',
      subject: 'Math',
      user: {
        username: 'JeffreyTeacher01',
        gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
        profileImageUrl:
          'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
      }
    },
    response = serializer.normalizeClass(payload);

  const expected = {
    id: '67a96ec1-7383-4164-8068-5415621b7a34',
    type: 'class/class',
    attributes: {
      name: 'Class A2',
      code: 'JR48FMF',
      greetings:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      startDate: '9.2.2015',
      endDate: '12.15.2015',
      grades: 'K,6,7,8',
      subject: 'Math',
      course: '75366215-f9d5-424c-8a90-2cabdfeb3ffa',
      visibility: true,
      totalMembers: 0,
      teachers: [
        {
          id: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
          username: 'JeffreyTeacher01',
          avatarUrl:
            'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
        }
      ]
    }
  };

  assert.deepEqual(response, expected, 'Wrong response');
});

test('normalizeTeachers', function(assert) {
  const serializer = this.subject();

  const payload = {
      username: 'JeffreyTeacher01',
      gooruUId: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
      profileImageUrl:
        'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
    },
    response = serializer.normalizeTeachers(Ember.A([payload]));

  const expected = [
    {
      id: '88638002-deb6-4f8d-b319-4a7ae18d0efe',
      username: 'JeffreyTeacher01',
      avatarUrl:
        'http://profile-qa.s3.amazonaws.com/88638002-deb6-4f8d-b319-4a7ae18d0efe.png'
    }
  ];

  assert.deepEqual(response, expected, 'Wrong response');
});
