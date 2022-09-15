import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Ember from 'ember';
import ResourceModel from 'gooru-web/models/content/resource';

moduleForComponent(
  'serializer:content/resource',
  'Unit | Serializer | content/resource'
);

test('serializeCreateResource', function(assert) {
  const serializer = this.subject();
  const resourceObject = ResourceModel.create({
    title: 'resource-title',
    url: 'any',
    format: 'video',
    visibleOnProfile: false
  });
  const serializedResource = serializer.serializeCreateResource(resourceObject);
  assert.equal(
    serializedResource.title,
    'resource-title',
    'Wrong resource title'
  );
  assert.equal(serializedResource.url, 'any', 'Wrong resource url');
  assert.equal(
    serializedResource.visible_on_profile,
    false,
    'Wrong resource url'
  );
  assert.equal(
    serializedResource.is_remote,
    true,
    'Wrong is remote, should be true per default'
  );
});

test('serializeCreateResource passing isRemote', function(assert) {
  const serializer = this.subject();
  const resourceObject = ResourceModel.create({
    isRemote: false
  });
  const serializedResource = serializer.serializeCreateResource(resourceObject);
  assert.equal(serializedResource.is_remote, false, 'Wrong is remote');
});

test('serializeUpdateResource', function(assert) {
  const serializer = this.subject();
  const resourceObject = ResourceModel.create({
    title: 'resource-title',
    description: 'A description',
    format: 'video',
    publisher: 'myself',
    amIThePublisher: true,
    displayGuide: true,
    centurySkills: [2]
  });
  const serializedResource = serializer.serializeUpdateResource(resourceObject);
  assert.equal(
    serializedResource.title,
    'resource-title',
    'Wrong resource title'
  );
  assert.equal(
    serializedResource.description,
    'A description',
    'Wrong resource url'
  );
  assert.equal(
    serializedResource.content_subformat,
    'video_resource',
    'Wrong resource content_subformat'
  );
  assert.equal(serializedResource.taxonomy, null, 'Wrong resource taxonomy');
  assert.deepEqual(
    serializedResource.copyright_owner,
    ['myself'],
    'Wrong copyright_owner'
  );
  assert.equal(
    serializedResource.is_copyright_owner,
    true,
    'Wrong is_copyright_owner'
  );
  assert.equal(
    JSON.stringify(serializedResource.display_guide),
    JSON.stringify({ is_broken: 0, is_frame_breaker: 1 }),
    'Wrong display_guide'
  );
  assert.equal(
    serializedResource.metadata['21_century_skills'][0],
    2,
    'Wrong centurySkill'
  );
});

test('serializeUpdateResourceTitle', function(assert) {
  const serializer = this.subject();
  const serializedResource = serializer.serializeUpdateResourceTitle(
    'resource-title'
  );
  assert.equal(
    serializedResource.title,
    'resource-title',
    'Wrong resource title'
  );
});

test('normalizeReadResource', function(assert) {
  const serializer = this.subject();
  const resourceData = {
    id: 'abcd',
    title: 'resource-title',
    url: 'http://any',
    content_subformat: 'video_resource',
    description: 'any desc',
    publish_status: 'published',
    taxonomy: {},
    visible_on_profile: true,
    sequence_id: 3,
    creator_id: 'anyID',
    narration: 'any narration',
    display_guide: {
      is_broken: 1,
      is_frame_breaker: 1
    },
    copyright_owner: ['myself'],
    is_copyright_owner: true,
    metadata: {
      '21_century_skills': [2]
    }
  };

  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(resource.get('id'), 'abcd', 'Wrong id');
  assert.equal(resource.get('title'), 'resource-title', 'Wrong title');
  assert.equal(resource.get('url'), 'http://any', 'Wrong url');
  assert.equal(resource.get('format'), 'video', 'Wrong format');
  assert.equal(resource.get('description'), 'any desc', 'Wrong description');
  assert.equal(resource.get('narration'), 'any narration', 'Wrong narration');
  assert.equal(
    resource.get('publishStatus'),
    'published',
    'Wrong publishStatus'
  );
  assert.equal(resource.get('standards.length'), 0, 'Wrong standards');
  assert.equal(resource.get('owner'), 'anyID', 'Wrong owner');
  assert.equal(resource.get('amIThePublisher'), true, 'Wrong amIThePublisher');
  assert.equal(resource.get('publisher'), 'myself', 'Wrong publisher');
  assert.equal(
    resource.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
  assert.equal(
    resource.get('displayGuide'),
    true,
    'Url is going to be broke in a frame'
  );
  assert.equal(
    resource.get('isRemote'),
    true,
    'When not provided, is remote should be true'
  );
  assert.equal(resource.get('order'), 3, 'Wrong order');
  assert.equal(resource.get('centurySkills'), 2, 'Wrong century Skills');
});

test('normalizeReadResource when providing is remote', function(assert) {
  const serializer = this.subject();
  const resourceData = {
    is_remote: false
  };

  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(resource.get('isRemote'), false, 'wrong is remote');
});

test('normalizeReadResource for image resource with relative path', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );

  const resourceData = {
    url: 'any',
    content_subformat: 'image_resource',
    description: 'any desc',
    publish_status: 'published',
    taxonomy: {},
    visible_on_profile: true,
    sequence_id: 3,
    creator_id: 'anyID'
  };

  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(
    resource.get('url'),
    'http://test-bucket01.s3.amazonaws.com/any',
    'Wrong url'
  );
});

test('normalizeReadResource for url resource with no full path', function(assert) {
  const serializer = this.subject();
  serializer.set(
    'session',
    Ember.Object.create({
      cdnUrls: {
        content: 'http://test-bucket01.s3.amazonaws.com/'
      }
    })
  );
  const resourceData = {
    url: 'any',
    content_subformat: 'webpage'
  };

  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(
    resource.get('url'),
    'http://test-bucket01.s3.amazonaws.com/any',
    'Wrong url'
  );
});

//TODO

//test('normalizeReadResource for url broken/frame_breaker', function(assert) {
//  const serializer = this.subject();
//  const resourceData = {
//    url: 'any',
//    content_format:'resource',
//    content_subformat: 'webpage_resource',
//    display_guide: {
//      'is_broken': 1,
//      'is_frame_breaker': 1
//    }
//  };
//
//  const resource = serializer.normalizeReadResource(resourceData);
//  assert.equal(resource.get('url'), 'http://dev-content-gooru-org.s3-us-west-1.amazonaws.com/any', 'Wrong link-out');
//
//});

test('normalizeReadResource - if visible_on_profile is undefined', function(assert) {
  const serializer = this.subject();
  const resourceData = {
    id: 'abcd'
  };

  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(resource.get('id'), 'abcd', 'Wrong id');
  assert.equal(
    resource.get('isVisibleOnProfile'),
    true,
    'Wrong isVisibleOnProfile'
  );
});

test('normalizeReadResource - if it is not visible on profile', function(assert) {
  const serializer = this.subject();
  const resourceData = {
    id: 'abcd',
    visible_on_profile: false
  };

  const resource = serializer.normalizeReadResource(resourceData);
  assert.equal(resource.get('id'), 'abcd', 'Wrong id');
  assert.equal(
    resource.get('isVisibleOnProfile'),
    false,
    'Wrong isVisibleOnProfile'
  );
});
