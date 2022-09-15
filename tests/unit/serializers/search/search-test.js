import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:search/search',
  'Unit | Serializer | search/search'
);

test('normalizeCollection', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: '//basepath/',
        user: '//userbasepath/'
      }
    })
  );

  const collectionData = {
    id: 'd9616037-9fc8-4641-8d32-99fb956406d3',
    profileUserVisibility: true,
    questionCount: '3',
    resourceCount: '5',
    languageObjective: 'In this collection',
    scollectionRemixCount: 2,
    title: 'Cell Growth and Division',
    type: 'collection',
    userFirstName: 'Chad',
    userLastName: 'Barris',
    userProfileImage: 'profile.png',
    usernameDisplay: 'username',
    gooruUId: 12,
    creatorFirstname: 'Creator',
    creatorLastname: 'Tail',
    creatorProfileImage: 'profile-creator.png',
    creatornameDisplay: 'username-creator',
    creatorId: 13,
    thumbnail: 'collection.png',
    publishStatus: 'published',
    course: {
      title: 'Course A',
      id: 10
    }
  };

  const collection = serializer.normalizeCollection(collectionData);
  assert.equal(
    collection.get('id'),
    'd9616037-9fc8-4641-8d32-99fb956406d3',
    'Wrong id'
  );
  assert.equal(
    collection.get('title'),
    'Cell Growth and Division',
    'Wrong title'
  );
  assert.equal(
    collection.get('publishStatus'),
    'published',
    'Wrong publish status'
  );
  assert.equal(
    collection.get('thumbnailUrl'),
    '//basepath/collection.png',
    'Wrong image'
  );
  assert.equal(collection.get('course'), 'Course A', 'Wrong course name');
  assert.equal(collection.get('courseId'), 10, 'Wrong course id');
  assert.equal(
    collection.get('isVisibleOnProfile'),
    true,
    'Wrong visible on profile'
  );
  assert.equal(
    collection.get('learningObjectives'),
    'In this collection',
    'Wrong learning objective'
  );
  assert.equal(collection.get('resourceCount'), 5, 'Wrong resource count');
  assert.equal(collection.get('questionCount'), 3, 'Wrong question count');
  assert.equal(collection.get('remixCount'), 2, 'Wrong remix count');
  assert.equal(collection.get('owner.id'), 12, 'Wrong owner id');
  assert.equal(
    collection.get('owner.firstName'),
    'Chad',
    'Wrong owner first name'
  );
  assert.equal(
    collection.get('owner.lastName'),
    'Barris',
    'Wrong owner last name'
  );
  assert.equal(
    collection.get('owner.avatarUrl'),
    '//userbasepath/profile.png',
    'Wrong owner avatar'
  );
  assert.equal(
    collection.get('owner.username'),
    'username',
    'Wrong owner username'
  );
  assert.equal(collection.get('creator.id'), 13, 'Wrong creator id');
  assert.equal(
    collection.get('creator.firstName'),
    'Creator',
    'Wrong creator first name'
  );
  assert.equal(
    collection.get('creator.lastName'),
    'Tail',
    'Wrong creator last name'
  );
  assert.equal(
    collection.get('creator.avatarUrl'),
    '//userbasepath/profile-creator.png',
    'Wrong creator avatar'
  );
  assert.equal(
    collection.get('creator.username'),
    'username-creator',
    'Wrong creator username'
  );
});

test('normalizeAssessment', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: '//basepath/',
        user: '//userbasepath/'
      }
    })
  );

  const assessmentData = {
    id: 'd9616037-9fc8-4641-8d32-99fb956406d3',
    profileUserVisibility: true,
    questionCount: '3',
    resourceCount: '5',
    languageObjective: 'In this assessment',
    scollectionRemixCount: 2,
    title: 'Cell Growth and Division',
    type: 'assessment',
    userFirstName: 'Chad',
    userLastName: 'Barris',
    userProfileImage: 'profile.png',
    usernameDisplay: 'username',
    gooruUId: 12,
    thumbnail: 'assessment.png',
    creatorFirstname: 'Creator',
    creatorLastname: 'Tail',
    creatorProfileImage: 'profile-creator.png',
    creatornameDisplay: 'username-creator',
    creatorId: 13,
    publishStatus: 'published',
    course: {
      title: 'Course A',
      id: 10
    }
  };

  const assessment = serializer.normalizeAssessment(assessmentData);
  assert.equal(
    assessment.get('id'),
    'd9616037-9fc8-4641-8d32-99fb956406d3',
    'Wrong id'
  );
  assert.equal(
    assessment.get('title'),
    'Cell Growth and Division',
    'Wrong title'
  );
  assert.equal(
    assessment.get('publishStatus'),
    'published',
    'Wrong publish status'
  );
  assert.equal(
    assessment.get('thumbnailUrl'),
    '//basepath/assessment.png',
    'Wrong image'
  );
  assert.equal(assessment.get('course'), 'Course A', 'Wrong course name');
  assert.equal(assessment.get('courseId'), 10, 'Wrong course id');
  assert.equal(
    assessment.get('isVisibleOnProfile'),
    true,
    'Wrong visible on profile'
  );
  assert.equal(
    assessment.get('learningObjectives'),
    'In this assessment',
    'Wrong learning objective'
  );
  assert.equal(assessment.get('resourceCount'), 5, 'Wrong resource count');
  assert.equal(assessment.get('questionCount'), 3, 'Wrong question count');
  assert.equal(assessment.get('remixCount'), 2, 'Wrong remix count');
  assert.equal(assessment.get('owner.id'), 12, 'Wrong owner id');
  assert.equal(
    assessment.get('owner.firstName'),
    'Chad',
    'Wrong owner first name'
  );
  assert.equal(
    assessment.get('owner.lastName'),
    'Barris',
    'Wrong owner last name'
  );
  assert.equal(
    assessment.get('owner.avatarUrl'),
    '//userbasepath/profile.png',
    'Wrong owner avatar'
  );
  assert.equal(
    assessment.get('owner.username'),
    'username',
    'Wrong owner username'
  );
  assert.equal(assessment.get('creator.id'), 13, 'Wrong creator id');
  assert.equal(
    assessment.get('creator.firstName'),
    'Creator',
    'Wrong creator first name'
  );
  assert.equal(
    assessment.get('creator.lastName'),
    'Tail',
    'Wrong creator last name'
  );
  assert.equal(
    assessment.get('creator.avatarUrl'),
    '//userbasepath/profile-creator.png',
    'Wrong creator avatar'
  );
  assert.equal(
    assessment.get('creator.username'),
    'username-creator',
    'Wrong creator username'
  );
});

test('normalizeSearchResources', function(assert) {
  const serializer = this.subject();
  const resourcesPayload = {
    searchResults: [
      {
        description: '7th Grade Cells unit',
        gooruOid: '415c37da-4727-11e5-8333-22000ac41a3c',
        contentSubFormat: 'text_resource',
        resourceType: {
          name: 'text_resource'
        },
        title: 'Cells Unit',
        url: 'https://docs.google.com/file/d/0B9aKdxaTnscydmJGa2pXbEx6Wmc',
        user: {
          emailId: '',
          firstName: 'goorutfa',
          gooruUId: '9eb1a416-c225-4a01-9ec3-5371b2274ccb',
          lastName: 'tfagooru',
          partyUid: '9eb1a416-c225-4a01-9ec3-5371b2274ccb'
        }
      },
      {
        description: '7th Grade Cells unit',
        gooruOid: '415c37da-4727-11e5-8333-22000ac41a3c',
        contentSubFormat: 'text_resource',
        resourceType: {
          name: 'text_resource'
        },
        title: 'Cells Unit',
        url: 'https://docs.google.com/file/d/0B9aKdxaTnscydmJGa2pXbEx6Wmc',
        user: {
          emailId: '',
          firstName: 'goorutfa',
          gooruUId: '9eb1a416-c225-4a01-9ec3-5371b2274ccb',
          lastName: 'tfagooru',
          partyUid: '9eb1a416-c225-4a01-9ec3-5371b2274ccb'
        }
      }
    ]
  };

  const resources = serializer.normalizeSearchResources(resourcesPayload);
  assert.equal(resources.length, 2, 'Wrong resources length');
  assert.equal(
    resources[0].get('format'),
    'text',
    'Wrong format for resource 1'
  );
});

test('normalizeSearchQuestions', function(assert) {
  const serializer = this.subject();
  const resourcesPayload = {
    searchResults: [
      {
        description: 'Cells are organized into _______?',
        gooruOid: 'd6bc690a-ff0b-4c38-b2be-41c35d3ba3d7',
        resourceFormat: {
          value: 'question'
        },
        resourceType: {
          name: 'question'
        },
        thumbnail: 'f000/2628/3363/6397.svg',
        title: 'Cells are organized',
        typeName: 'multiple_choice_question',
        user: {
          firstName: 'Rocky',
          gooruUId: 'ee410cef-2a44-46ef-878d-172511e54e07',
          lastName: 'Shore'
        }
      }
    ]
  };

  const resources = serializer.normalizeSearchQuestions(resourcesPayload);
  assert.equal(resources.length, 1, 'Wrong resources length');
  assert.equal(
    resources[0].get('format'),
    'question',
    'Wrong format for resource 1'
  );
});

test('normalizeQuestion', function(assert) {
  const serializer = this.subject();

  const questionData = {
    description: 'Cells are organized into _______?',
    gooruOid: 'd6bc690a-ff0b-4c38-b2be-41c35d3ba3d7',
    resourceFormat: {
      value: 'question'
    },
    resourceType: {
      name: 'question'
    },
    thumbnail: 'f000/2628/3363/6397.svg',
    title: 'Cells are organized',
    typeName: 'multiple_choice_question',
    user: {
      firstName: 'Rocky',
      gooruUId: 'ee410cef-2a44-46ef-878d-172511e54e07',
      lastName: 'Shore'
    }
  };

  const question = serializer.normalizeQuestion(questionData);
  assert.equal(
    question.get('id'),
    'd6bc690a-ff0b-4c38-b2be-41c35d3ba3d7',
    'Wrong id'
  );
  assert.equal(question.get('title'), 'Cells are organized', 'Wrong title');
  assert.equal(
    question.get('description'),
    'Cells are organized into _______?',
    'Wrong description'
  );
  //TODO assert.equal(question.get("publishStatus"), 'unpublished', 'Wrong publish status');
  assert.equal(question.get('format'), 'question', 'Wrong format');
  assert.equal(
    question.get('thumbnailUrl'),
    'f000/2628/3363/6397.svg',
    'Wrong thumbnailUrl'
  );
  assert.equal(question.get('type'), 'MC', 'Wrong type');
  assert.equal(
    question.get('owner.id'),
    'ee410cef-2a44-46ef-878d-172511e54e07',
    'Wrong owner id'
  );
});

test('normalizeResource', function(assert) {
  const serializer = this.subject();

  const resourceData = {
    description: '7th Grade Cells unit',
    gooruOid: '415c37da-4727-11e5-8333-22000ac41a3c',
    contentSubFormat: 'text_resource',
    resourceType: {
      name: 'text_resource'
    },
    title: 'Cells Unit',
    url: 'https://docs.google.com/file/d/0B9aKdxaTnscydmJGa2pXbEx6Wmc',
    creator: {
      emailId: '',
      firstName: 'goorutfa',
      gooruUId: 'aaaa-c225-4a01-9ec3-5371b2274ccb',
      lastName: 'tfagooru',
      partyUid: '9eb1a416-c225-4a01-9ec3-5371b2274ccb'
    },
    user: {
      emailId: '',
      firstName: 'goorutfa',
      gooruUId: '9eb1a416-c225-4a01-9ec3-5371b2274ccb',
      lastName: 'tfagooru',
      partyUid: '9eb1a416-c225-4a01-9ec3-5371b2274ccb'
    }
  };

  const resource = serializer.normalizeResource(resourceData);
  assert.equal(
    resource.get('id'),
    '415c37da-4727-11e5-8333-22000ac41a3c',
    'Wrong id'
  );
  assert.equal(resource.get('title'), 'Cells Unit', 'Wrong title');
  assert.equal(
    resource.get('description'),
    '7th Grade Cells unit',
    'Wrong description'
  );
  assert.equal(resource.get('format'), 'text', 'Wrong format');
  //TODO assert.equal(resource.get("publisher"), 'text', 'Wrong format');
  //TODO assert.equal(question.get("thumbnailUrl"), 'f000/2628/3363/6397.svg', 'Wrong thumbnailUrl');
  assert.equal(
    resource.get('url'),
    'https://docs.google.com/file/d/0B9aKdxaTnscydmJGa2pXbEx6Wmc',
    'Wrong url'
  );
  assert.equal(
    resource.get('owner.id'),
    '9eb1a416-c225-4a01-9ec3-5371b2274ccb',
    'Wrong owner id'
  );
  assert.equal(
    resource.get('creator.id'),
    'aaaa-c225-4a01-9ec3-5371b2274ccb',
    'Wrong creator id'
  );
});

test('normalizeOwner', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        user: '//basepath/'
      }
    })
  );

  const ownerData = {
    emailId: '',
    firstName: 'goorutfa',
    gooruUId: '9eb1a416-c225-4a01-9ec3-5371b2274ccb',
    lastName: 'tfagooru',
    usernameDisplay: 'szope',
    profileImage: 'any'
  };

  const owner = serializer.normalizeOwner(ownerData);
  assert.equal(
    owner.get('id'),
    '9eb1a416-c225-4a01-9ec3-5371b2274ccb',
    'Wrong id'
  );
  assert.equal(owner.get('firstName'), 'goorutfa', 'Wrong first name');
  assert.equal(owner.get('lastName'), 'tfagooru', 'Wrong last name');
  assert.equal(owner.get('username'), 'szope', 'Wrong username');
  assert.equal(owner.get('avatarUrl'), '//basepath/any', 'Wrong avatar url');
});

test('normalizeSearchCourses', function(assert) {
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

  const coursesPayload = {
    searchResults: [
      {
        sequence: 1,
        title: 'title-1',
        description: 'description-1',
        thumbnail: 'thumbnail-url-1',
        owner: {
          emailId: '',
          firstName: '',
          gooruUId: 'owner-id-1',
          lastName: '',
          usernameDisplay: ''
        }
      },
      {
        sequence: 2,
        title: 'title-2',
        description: 'description-2',
        thumbnail: 'thumbnail-url-2',
        owner: {
          emailId: '',
          firstName: '',
          gooruUId: 'owner-id-2',
          lastName: '',
          usernameDisplay: ''
        }
      }
    ]
  };

  const courses = serializer.normalizeSearchCourses(coursesPayload);
  assert.equal(courses.length, 2, 'Wrong courses length');
  assert.equal(courses[0].get('title'), 'title-1', 'Wrong title for course 1');
  assert.equal(courses[1].get('title'), 'title-2', 'Wrong title for course 2');
});

test('normalizeCourse', function(assert) {
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
  const courseData = {
    id: 'course-id',
    sequence: '1',
    title: 'title',
    description: 'description',
    thumbnail: 'thumbnail-url',
    owner: {
      emailId: '',
      firstName: '',
      gooruUId: 'owner-id',
      lastName: '',
      usernameDisplay: ''
    }
  };

  const course = serializer.normalizeCourse(courseData);
  assert.equal(course.get('id'), 'course-id', 'Wrong id');
  assert.equal(course.get('title'), 'title', 'Wrong title');
  assert.equal(course.get('description'), 'description', 'Wrong description');
  assert.equal(
    course.get('thumbnailUrl'),
    'content-url/thumbnail-url',
    'Wrong thumbnail'
  );
  assert.equal(course.get('owner.id'), 'owner-id', 'Wrong owner id');
});
