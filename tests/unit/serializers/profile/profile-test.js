import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import ProfileModel from 'gooru-web/models/profile/profile';
import Env from 'gooru-web/config/environment';
import { NETWORK_TYPE, DEFAULT_IMAGES } from 'gooru-web/config/config';

moduleForComponent(
  'serializer:profile/profile',
  'Unit | Serializer | profile/profile'
);

test('serializeCreateProfile', function(assert) {
  const serializer = this.subject();
  const profileObject = Ember.Object.create({
    firstName: 'first-name',
    lastName: 'last-name',
    username: 'username',
    email: 'email',
    password: 'password',
    dateOfBirth: '01/01/2000',
    tenantId: '123',
    use_learning_data: undefined
  });
  const expected = {
    first_name: 'first-name',
    last_name: 'last-name',
    username: 'username',
    email: 'email',
    password: 'password',
    birth_date: '01/01/2000',
    tenant_id: '123',
    use_learning_data: undefined
  };
  const response = serializer.serializeCreateProfile(profileObject);
  assert.deepEqual(expected, response, 'Wrong serialized response');
});

test('serializeUpdateProfile', function(assert) {
  const serializer = this.subject();
  const profile = ProfileModel.create({
    firstName: 'first-name',
    lastName: 'last-name',
    username: 'username',
    role: 'role',
    country: 'country',
    state: 'state',
    schoolDistrict: 'school-district',
    aboutMe: 'about-me',
    countryId: 'country-id',
    stateId: 'state-id',
    schoolDistrictId: 'school-district-id',
    avatarUrl: '//baseUrl/image-id',
    use_learning_data: undefined
  });

  const expected = {
    first_name: 'first-name',
    last_name: 'last-name',
    roster_global_userid: null,
    user_category: 'role',
    username: 'username',
    country: 'country',
    about: 'about-me',
    country_id: 'country-id',
    state_id: 'state-id',
    school_district_id: 'school-district-id',
    state: 'state',
    school_district: 'school-district',
    thumbnail: 'image-id',
    use_learning_data: undefined
  };

  const response = serializer.serializeUpdateProfile(profile);
  assert.deepEqual(expected, response, 'Wrong serialized response');
});

test('serializeUpdateProfile missing some values', function(assert) {
  const serializer = this.subject();
  const profile = ProfileModel.create({
    role: 'role',
    country: 'country',
    state: 'state',
    schoolDistrict: 'school-district',
    aboutMe: 'about-me',
    countryId: 'country-id',
    stateId: 'state-id',
    schoolDistrictId: 'school-district-id',
    avatarUrl: '//baseUrl/image-id'
  });

  const response = serializer.serializeUpdateProfile(profile);
  assert.ok(
    response.first_name === undefined,
    'First name should not be present'
  );
  assert.ok(
    response.last_name === undefined,
    'Last name should not be present'
  );
  assert.ok(response.username === undefined, 'Username should not be present');
});

test('serializeUpdateProfile passing empty strings', function(assert) {
  const serializer = this.subject();
  const profile = ProfileModel.create({
    firstName: 'first-name',
    lastName: 'last-name',
    username: 'username',
    role: 'role',
    country: 'country',
    state: 'state',
    schoolDistrict: 'school-district',
    aboutMe: '',
    countryId: 'country-id',
    stateId: '',
    schoolDistrictId: '',
    avatarUrl: '//baseUrl/image-id',
    studentId: ''
  });

  const response = serializer.serializeUpdateProfile(profile);
  assert.equal(
    response.roster_global_userid,
    null,
    'Wrong roster global user id'
  );
  assert.equal(response.state_id, null, 'Wrong state id');
  assert.equal(response.school_district_id, null, 'Wrong school district id');
  assert.equal(response.school_district_id, null, 'Wrong school district id');
  assert.equal(response.about, null, 'Wrong about');
});

test('normalizeReadProfile', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        user: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const profilePayload = {
    id: 'id',
    first_name: 'first-name',
    last_name: 'last-name',
    username: 'username',
    email: 'email',
    gender: 'male',
    grade: [],
    birth_date: '01/01/2000',
    user_category: 'role',
    created_at: '01/01/2000',
    updated_at: '01/01/2000',
    country_id: '1111',
    country: 'country',
    state_id: '2222',
    state: 'state',
    school_district_id: '4444',
    school_district: 'school-district',
    about: 'about-me',
    thumbnail: 'thumbnail.png',
    roster_id: '5555',
    followers: 2,
    followings: 3,
    isFollowing: false
  };

  const normalizedProfile = serializer.normalizeReadProfile(profilePayload);
  assert.equal(normalizedProfile.get('id'), 'id', 'Wrong id');
  assert.equal(
    normalizedProfile.get('firstName'),
    'first-name',
    'Wrong firstName'
  );
  assert.equal(
    normalizedProfile.get('lastName'),
    'last-name',
    'Wrong lastName'
  );
  assert.equal(normalizedProfile.get('username'), 'username', 'Wrong username');
  assert.equal(normalizedProfile.get('email'), 'email', 'Wrong email');
  assert.equal(normalizedProfile.get('gender'), 'male', 'Wrong gender');
  assert.equal(normalizedProfile.get('grades').length, 0, 'Wrong grades');
  assert.equal(
    normalizedProfile.get('dateOfBirth'),
    '01/01/2000',
    'Wrong dateOfBirth'
  );
  assert.equal(normalizedProfile.get('role'), 'role', 'Wrong role');
  assert.equal(
    normalizedProfile.get('createdAt'),
    '01/01/2000',
    'Wrong createdAt'
  );
  assert.equal(
    normalizedProfile.get('lastUpdate'),
    '01/01/2000',
    'Wrong lastUpdate'
  );
  assert.equal(normalizedProfile.get('countryId'), '1111', 'Wrong countryId');
  assert.equal(normalizedProfile.get('country'), 'country', 'Wrong country');
  assert.equal(normalizedProfile.get('stateId'), '2222', 'Wrong stateId');
  assert.equal(normalizedProfile.get('state'), 'state', 'Wrong state');
  assert.equal(
    normalizedProfile.get('schoolDistrictId'),
    '4444',
    'Wrong schoolDistrictId'
  );
  assert.equal(
    normalizedProfile.get('schoolDistrict'),
    'school-district',
    'Wrong schoolDistrict'
  );
  assert.equal(normalizedProfile.get('aboutMe'), 'about-me', 'Wrong aboutMe');
  assert.equal(
    normalizedProfile.get('avatarUrl'),
    'http://test-bucket01.s3.amazonaws.com/thumbnail.png',
    'Wrong avatarUrl'
  );
  assert.equal(normalizedProfile.get('rosterId'), '5555', 'Wrong rosterId');
  assert.equal(normalizedProfile.get('followers'), 2, 'Wrong followers');
  assert.equal(normalizedProfile.get('followings'), 3, 'Wrong followings');
  assert.equal(
    normalizedProfile.get('isFollowing'),
    false,
    'Wrong isFollowing'
  );
});

test('normalizeCreateProfile', function(assert) {
  const serializer = this.subject();
  const profilePayload = {
    user_id: 'user_id',
    username: 'username',
    access_token: 'access_token'
  };
  const expected = {
    token: Env['API-3.0']['user-token-api-2.0'],
    'token-api3': 'access_token',
    user: {
      username: 'username',
      gooruUId: 'user_id',
      isNew: true,
      avatarUrl: DEFAULT_IMAGES.USER_PROFILE
    },
    isAnonymous: false
  };
  const normalizedProfile = serializer.normalizeCreateProfile(profilePayload);
  assert.deepEqual(expected, normalizedProfile, 'Wrong normalized response');
});

test('normalizeOwners', function(assert) {
  const serializer = this.subject();
  const ownersData = [
    {
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    },
    {
      id: '2',
      first_name: 'Javier',
      last_name: 'Perez',
      thumbnail: 'none'
    }
  ];

  const owners = serializer.normalizeOwners(ownersData);
  assert.equal(owners.length, 2, 'Wrong owners length');
});

test('normalizeQuestion', function(assert) {
  const serializer = this.subject();
  const owners = [
    Ember.Object.create({
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const questionData = {
    id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    title: 'Introduction to Java',
    description: 'Some description',
    publish_status: 'unpublished',
    content_format: 'question',
    creator_id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d'
  };

  const question = serializer.normalizeQuestion(questionData, owners);
  assert.equal(
    question.get('id'),
    'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    'Wrong id'
  );
  assert.equal(question.get('title'), 'Introduction to Java', 'Wrong title');
  assert.equal(question.get('text'), 'Some description', 'Wrong description');
  assert.equal(
    question.get('description'),
    'Some description',
    'Wrong description'
  );
  assert.equal(
    question.get('publishStatus'),
    'unpublished',
    'Wrong publish status'
  );
  assert.equal(question.get('format'), 'question', 'Wrong format');
  assert.equal(
    question.get('owner.id'),
    'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
    'Wrong owner id'
  );
});

test('normalizeResource', function(assert) {
  const serializer = this.subject();
  const owners = [
    Ember.Object.create({
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const resourceData = {
    id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    title: 'Introduction to Java',
    description: 'Some description',
    publish_status: 'unpublished',
    content_subformat: 'webpage_resource',
    creator_id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d'
  };

  const resource = serializer.normalizeResource(resourceData, owners);
  assert.equal(
    resource.get('id'),
    'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    'Wrong id'
  );
  assert.equal(resource.get('title'), 'Introduction to Java', 'Wrong title');
  assert.equal(
    resource.get('description'),
    'Some description',
    'Wrong description'
  );
  assert.equal(
    resource.get('publishStatus'),
    'unpublished',
    'Wrong publish status'
  );
  assert.equal(resource.get('format'), 'webpage', 'Wrong format');
  assert.equal(
    resource.get('owner.id'),
    'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
    'Wrong owner id'
  );
});

test('normalizeCollection', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'content-url/'
      }
    })
  );
  const owners = [
    Ember.Object.create({
      id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const collectionData = {
    id: '50484e74-ad95-44d5-981a-c18411260233',
    title: 'oops poly basics',
    publish_status: 'published',
    thumbnail: 'collection.png',
    taxonomy: { 'K12.MA': { code: 'K12.MA' } },
    visible_on_profile: false,
    learning_objective: 'This is important collection',
    owner_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
    course: { id: 1, title: 'mathematics course 101' },
    resource_count: 5,
    question_count: 3,
    remix_count: 2
  };

  const collection = serializer.normalizeCollection(collectionData, owners);
  assert.equal(
    collection.get('id'),
    '50484e74-ad95-44d5-981a-c18411260233',
    'Wrong id'
  );
  assert.equal(collection.get('title'), 'oops poly basics', 'Wrong title');
  assert.equal(
    collection.get('publishStatus'),
    'published',
    'Wrong publish status'
  );
  assert.equal(
    collection.get('thumbnailUrl'),
    'content-url/collection.png',
    'Wrong image'
  );
  assert.equal(
    collection.get('course'),
    'mathematics course 101',
    'Wrong course name'
  );
  assert.equal(collection.get('courseId'), 1, 'Wrong course id');
  assert.equal(
    collection.get('isVisibleOnProfile'),
    false,
    'Wrong visible on profile'
  );
  assert.equal(
    collection.get('learningObjectives'),
    'This is important collection',
    'Wrong learning objective'
  );
  assert.equal(collection.get('resourceCount'), 5, 'Wrong resource count');
  assert.equal(collection.get('questionCount'), 3, 'Wrong question count');
  assert.equal(collection.get('remixCount'), 2, 'Wrong remix count');
  assert.deepEqual(
    collection.get('standards')[0].get('code'),
    'K12.MA',
    'Wrong standards'
  );
  assert.equal(
    collection.get('owner.id'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Wrong owner id'
  );
});

test('normalizeAssessment', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'content-url/'
      }
    })
  );
  const owners = [
    Ember.Object.create({
      id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const assessmentData = {
    id: '50484e74-ad95-44d5-981a-c18411260233',
    title: 'oops poly basics',
    publish_status: 'published',
    thumbnail: 'collection.png',
    taxonomy: { 'K12.MA': { code: 'K12.MA' } },
    visible_on_profile: false,
    learning_objective: 'This is important collection',
    owner_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
    course: { id: 1, title: 'mathematics course 101' },
    question_count: 3,
    remix_count: 2,
    format: 'assessment-external',
    url: 'any'
  };

  const collection = serializer.normalizeAssessment(assessmentData, owners);
  assert.equal(
    collection.get('id'),
    '50484e74-ad95-44d5-981a-c18411260233',
    'Wrong id'
  );
  assert.equal(collection.get('title'), 'oops poly basics', 'Wrong title');
  assert.equal(
    collection.get('publishStatus'),
    'published',
    'Wrong publish status'
  );
  assert.equal(
    collection.get('thumbnailUrl'),
    'content-url/collection.png',
    'Wrong image'
  );
  assert.equal(
    collection.get('course'),
    'mathematics course 101',
    'Wrong course name'
  );
  assert.equal(collection.get('courseId'), 1, 'Wrong course id');
  assert.equal(
    collection.get('isVisibleOnProfile'),
    false,
    'Wrong visible on profile'
  );
  assert.equal(
    collection.get('learningObjectives'),
    'This is important collection',
    'Wrong learning objective'
  );
  assert.equal(collection.get('questionCount'), 3, 'Wrong question count');
  assert.equal(collection.get('remixCount'), 2, 'Wrong remix count');
  assert.deepEqual(
    collection.get('standards')[0].get('code'),
    'K12.MA',
    'Wrong standards'
  );
  assert.equal(
    collection.get('owner.id'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Wrong owner id'
  );
  assert.equal(collection.get('format'), 'assessment-external', 'Wrong format');
  assert.equal(collection.get('url'), 'any', 'Wrong url');
});

test('normalizeReadResources', function(assert) {
  const serializer = this.subject();
  const payload = {
    resources: [
      {
        id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
        title: 'Introduction to Java',
        description: 'Some description',
        publish_status: 'unpublished',
        content_subformat: 'webpage_resource',
        creator_id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d'
      },
      {
        id: '2',
        title: 'Introduction to C#',
        description: 'Some description',
        publish_status: 'published',
        content_subformat: 'webpage_resource',
        creator_id: '2'
      }
    ],
    owner_details: [
      {
        id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
        first_name: 'Sachin',
        last_name: 'Zope',
        thumbnail: 'any'
      }
    ]
  };

  const resources = serializer.normalizeReadResources(payload);
  assert.equal(resources.length, 2, 'Wrong total resources');
  assert.equal(
    resources[0].get('owner.id'),
    'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
    'Invalid owner id for resource 1'
  );
  assert.ok(
    !resources[1].get('owner'),
    'Second resource should not have an owner'
  );
});

test('normalizeReadQuestions', function(assert) {
  const serializer = this.subject();
  const payload = {
    questions: [
      {
        id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
        title: 'Introduction to Java',
        description: 'Some description',
        publish_status: 'unpublished',
        content_format: 'question',
        creator_id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d'
      },
      {
        id: '2',
        title: 'Introduction to C#',
        description: 'Some description',
        publish_status: 'published',
        content_format: 'question',
        creator_id: '2'
      }
    ],
    owner_details: [
      {
        id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
        first_name: 'Sachin',
        last_name: 'Zope',
        thumbnail: 'any'
      }
    ]
  };

  const questions = serializer.normalizeReadQuestions(payload);
  assert.equal(questions.length, 2, 'Wrong total questions');
  assert.equal(
    questions[0].get('owner.id'),
    'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
    'Invalid owner id for question 1'
  );
  assert.ok(
    !questions[1].get('owner'),
    'Second question should not have an owner'
  );
});

test('normalizeReadCollections', function(assert) {
  const serializer = this.subject();
  const payload = {
    collections: [
      {
        id: '50484e74-ad95-44d5-981a-c18411260233',
        title: 'oops poly basics',
        publish_status: 'published',
        thumbnail: 'collection.png',
        taxonomy: { 'K12.MA': { code: 'K12.MA' } },
        visible_on_profile: false,
        learning_objective: 'This is important collection',
        owner_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        course_title: 'mathematics course 101',
        resource_count: 5,
        question_count: 3,
        remix_count: 2,
        description: 'Some description'
      },
      {
        id: '2',
        title: 'oops poly basics',
        publish_status: 'published',
        thumbnail: 'collection.png',
        taxonomy: { 'K12.MA': { code: 'K12.MA' } },
        visible_on_profile: false,
        learning_objective: 'This is important collection',
        owner_id: '2',
        course_title: 'mathematics course 101',
        resource_count: 5,
        question_count: 3,
        remix_count: 2,
        description: 'Some description'
      }
    ],
    owner_details: [
      {
        id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        first_name: 'Sachin',
        last_name: 'Zope',
        thumbnail: 'any'
      }
    ]
  };

  const collections = serializer.normalizeReadCollections(payload);
  assert.equal(collections.length, 2, 'Wrong total collections');
  assert.equal(
    collections[0].get('owner.id'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Invalid owner id for collection 1'
  );
  assert.ok(
    !collections[1].get('owner'),
    'Second collection should not have an owner'
  );
});

test('normalizeReadAssessments', function(assert) {
  const serializer = this.subject();
  const payload = {
    assessments: [
      {
        id: '50484e74-ad95-44d5-981a-c18411260233',
        title: 'oops poly basics',
        publish_status: 'published',
        thumbnail: 'collection.png',
        taxonomy: { 'K12.MA': { code: 'K12.MA' } },
        visible_on_profile: false,
        learning_objective: 'This is important collection',
        owner_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        course_title: 'mathematics course 101',
        question_count: 3,
        remix_count: 2,
        description: 'Some description'
      },
      {
        id: '2',
        title: 'oops poly basics',
        publish_status: 'published',
        thumbnail: 'collection.png',
        taxonomy: { 'K12.MA': { code: 'K12.MA' } },
        visible_on_profile: false,
        learning_objective: 'This is important collection',
        owner_id: '2',
        course_title: 'mathematics course 101',
        question_count: 3,
        remix_count: 2,
        description: 'Some description'
      }
    ],
    owner_details: [
      {
        id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        first_name: 'Sachin',
        last_name: 'Zope',
        thumbnail: 'any'
      }
    ]
  };

  const assessments = serializer.normalizeReadAssessments(payload);
  assert.equal(assessments.length, 2, 'Wrong total assessments');
  assert.equal(
    assessments[0].get('owner.id'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Invalid owner id for assessment 1'
  );
  assert.ok(
    !assessments[1].get('owner'),
    'Second assessment should not have an owner'
  );
});

test('normalizeReadRubrics', function(assert) {
  const serializer = this.subject();
  const payload = {
    rubrics: [
      {
        id: '2c185398-d0e6-42d8-9926-572939fc0784',
        title: 'Rubric - 1',
        description: 'This is the example question for the rubrics association',
        type: '1xN',
        thumbnail: '2c185398-d0e6-42d8-9926-572939fc0784.png',
        publishStatus: 'published',
        metadata: {
          audience: [12, 45]
        },
        taxonomy: {},
        url: 'https://en.wikipedia.org/wiki/Rubric_(academic)',
        is_remote: true,
        is_rubric: true,
        feedback_guidance: 'Summarize your feedback on the essay as a whole',
        total_points: 4,
        creator_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        overall_feedback_required: true,
        categories: [
          {
            category_title: 'Thesis and Sub-claims'
          },
          {
            category_title: 'Thesis and Sub-claims'
          }
        ]
      },
      {
        id: '2',
        title: 'Rubric - 2',
        description: 'This is the example question for the rubrics association',
        type: '1xN',
        thumbnail: '2c185398-d0e6-42d8-9926-572939fc0784.png',
        publishStatus: 'published',
        metadata: {
          audience: [12, 45]
        },
        taxonomy: {},
        url: 'https://en.wikipedia.org/wiki/Rubric_(academic)',
        is_remote: true,
        feedback_guidance: 'Summarize your feedback on the essay as a whole',
        total_points: 4,
        creator_id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        overall_feedback_required: true,
        categories: [
          {
            category_title: 'Thesis and Sub-claims'
          },
          {
            category_title: 'Thesis and Sub-claims'
          }
        ]
      }
    ],
    owner_details: [
      {
        id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
        first_name: 'Sachin',
        last_name: 'Zope',
        thumbnail: 'any'
      }
    ]
  };

  const rubrics = serializer.normalizeReadRubrics(payload);
  assert.equal(rubrics.length, 2, 'Wrong total rubrics');
  assert.equal(
    rubrics[0].get('owner.id'),
    '852f9814-0eb4-461d-bd3b-aca9c2500595',
    'Invalid owner id for rubric 1'
  );
});

test('normalizeReadNetwork for following', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        user: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const detailsObject = Ember.Object.create({
    followings: ['id-1', 'id-2'],
    details: [
      {
        id: 'id-1',
        first_name: 'first-name-1',
        last_name: 'last-name-1',
        thumbnail: 'thumbnail-path-1',
        followers_count: 10,
        followings_count: 20
      },
      {
        id: 'id-2',
        first_name: 'first-name-2',
        last_name: 'last-name-2',
        thumbnail: 'thumbnail-path-2',
        followers_count: 20,
        followings_count: 10
      }
    ]
  });
  const response = serializer.normalizeReadNetwork(
    detailsObject,
    NETWORK_TYPE.FOLLOWING
  );
  assert.equal(response.length, 2, 'Wrong total following');
  assert.equal(response[0].get('id'), 'id-1', 'Invalid id for user 1');
  assert.ok(
    response[0].get('isFollowing'),
    'First user has a wrong value for isFollowing'
  );
  assert.equal(
    response[0].get('avatarUrl'),
    'http://test-bucket01.s3.amazonaws.com/thumbnail-path-1',
    'Wrong avatarUrl'
  );
  assert.ok(
    response[1].get('isFollowing'),
    'Second user has a wrong value for isFollowing'
  );
});

test('normalizeReadNetwork for followers', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        user: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const detailsObject = Ember.Object.create({
    followings: ['id-1'],
    details: [
      {
        id: 'id-1',
        first_name: 'first-name-1',
        last_name: 'last-name-1',
        thumbnail: 'thumbnail-path-1',
        followers_count: 10,
        followings_count: 20,
        country: 'country-1',
        school_district: 'district-1'
      },
      {
        id: 'id-2',
        first_name: 'first-name-2',
        last_name: 'last-name-2',
        thumbnail: 'thumbnail-path-2',
        followers_count: 20,
        followings_count: 10,
        country: 'country-2',
        school_district: 'district-2'
      }
    ]
  });
  const response = serializer.normalizeReadNetwork(
    detailsObject,
    NETWORK_TYPE.FOLLOWERS
  );
  assert.equal(response.length, 2, 'Wrong total followers');
  assert.equal(response[0].get('id'), 'id-1', 'Invalid id for user 1');
  assert.ok(
    response[0].get('isFollowing'),
    'First user has a wrong value for isFollowing'
  );
  assert.equal(
    response[0].get('avatarUrl'),
    'http://test-bucket01.s3.amazonaws.com/thumbnail-path-1',
    'Wrong avatarUrl'
  );
  assert.ok(
    !response[1].get('isFollowing'),
    'Second user has a wrong value for isFollowing'
  );
  assert.equal(
    response[0].get('schoolDistrict'),
    'district-1',
    'Invalid district for user 1'
  );
  assert.equal(
    response[1].get('schoolDistrict'),
    'district-2',
    'Invalid district for user 2'
  );
});

test('normalizeQuestion - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  const owners = [
    Ember.Object.create({
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const questionData = {
    id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    title: 'Introduction to Java'
  };

  const question = serializer.normalizeQuestion(questionData, owners);
  assert.equal(
    question.get('id'),
    'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    'Wrong id'
  );
  assert.equal(
    question.get('isVisibleOnProfile'),
    true,
    'Wrong visible status'
  );
});

test('normalizeQuestion - if it is not visible on profile', function(assert) {
  const serializer = this.subject();
  const owners = [
    Ember.Object.create({
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const questionData = {
    id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    title: 'Introduction to Java',
    visible_on_profile: false
  };

  const question = serializer.normalizeQuestion(questionData, owners);
  assert.equal(
    question.get('id'),
    'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    'Wrong id'
  );
  assert.equal(
    question.get('isVisibleOnProfile'),
    false,
    'Wrong visible status'
  );
});

test('normalizeResource - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  const owners = [
    Ember.Object.create({
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const resourceData = {
    id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    title: 'Introduction to Java'
  };

  const resource = serializer.normalizeResource(resourceData, owners);
  assert.equal(
    resource.get('id'),
    'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    'Wrong id'
  );
  assert.equal(
    resource.get('isVisibleOnProfile'),
    true,
    'Wrong visible status'
  );
});

test('normalizeResource - if it is not visible on profile', function(assert) {
  const serializer = this.subject();
  const owners = [
    Ember.Object.create({
      id: 'f8179782-c5e1-4c0f-85e5-7db5ff6b0c8d',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const resourceData = {
    id: 'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    title: 'Introduction to Java',
    visible_on_profile: false
  };

  const resource = serializer.normalizeResource(resourceData, owners);
  assert.equal(
    resource.get('id'),
    'f59eff43-767d-4910-af5a-b7dc9a5ce065',
    'Wrong id'
  );
  assert.equal(
    resource.get('isVisibleOnProfile'),
    false,
    'Wrong visible status'
  );
});

test('normalizeCollection - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'content-url/'
      }
    })
  );
  const owners = [
    Ember.Object.create({
      id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const collectionData = {
    id: '50484e74-ad95-44d5-981a-c18411260233'
  };

  const collection = serializer.normalizeCollection(collectionData, owners);
  assert.equal(
    collection.get('id'),
    '50484e74-ad95-44d5-981a-c18411260233',
    'Wrong id'
  );
  assert.equal(
    collection.get('isVisibleOnProfile'),
    true,
    'Wrong visible status'
  );
});

test('normalizeCollection - if is not visible on profile', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'content-url/'
      }
    })
  );
  const owners = [
    Ember.Object.create({
      id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const collectionData = {
    id: '50484e74-ad95-44d5-981a-c18411260233',
    visible_on_profile: false
  };

  const collection = serializer.normalizeCollection(collectionData, owners);
  assert.equal(
    collection.get('id'),
    '50484e74-ad95-44d5-981a-c18411260233',
    'Wrong id'
  );
  assert.equal(
    collection.get('isVisibleOnProfile'),
    false,
    'Wrong visible status'
  );
});

test('normalizeAssessment - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'content-url/'
      }
    })
  );
  const owners = [
    Ember.Object.create({
      id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const assessmentData = {
    id: '50484e74-ad95-44d5-981a-c18411260233'
  };

  const collection = serializer.normalizeAssessment(assessmentData, owners);
  assert.equal(
    collection.get('id'),
    '50484e74-ad95-44d5-981a-c18411260233',
    'Wrong id'
  );
  assert.equal(
    collection.get('isVisibleOnProfile'),
    true,
    'Wrong visible status'
  );
});

test('normalizeAssessment - if it not is visible on profile', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'content-url/'
      }
    })
  );
  const owners = [
    Ember.Object.create({
      id: '852f9814-0eb4-461d-bd3b-aca9c2500595',
      first_name: 'Sachin',
      last_name: 'Zope',
      thumbnail: 'any'
    })
  ];

  const assessmentData = {
    id: '50484e74-ad95-44d5-981a-c18411260233',
    visible_on_profile: false
  };

  const collection = serializer.normalizeAssessment(assessmentData, owners);
  assert.equal(
    collection.get('id'),
    '50484e74-ad95-44d5-981a-c18411260233',
    'Wrong id'
  );
  assert.equal(
    collection.get('isVisibleOnProfile'),
    false,
    'Wrong visible status'
  );
});
