import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Resource from 'gooru-web/models/content/resource';
import Ember from 'ember';

const ConfigurationService = Ember.Service.extend({
  configuration: Ember.Object.create({
    player: {
      resources: {
        pdf: {
          googleDriveEnable: true,
          googleDriveUrl: 'https://docs.google.com/gview?url='
        }
      }
    }
  })
});

moduleForComponent(
  'content/resources/gru-resource-play',
  'Integration | Component | content/resources/gru resource play',
  {
    integration: true,
    beforeEach: function() {
      this.register('service:configuration', ConfigurationService);
      this.inject.service('configuration');
    }
  }
);

test('Layout', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Resource Title',
    format: 'video',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    owner: Ember.Object.create({
      firstName: 'Publisher'
    })
  });

  this.set('resource', resource);

  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  const $section = $container.find('> section');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h1').text(), 'Resource Title', 'Missing title');
  assert.ok($header.find('.details .format').length, 'Missing format');
  assert.ok($header.find('.details .tags').length, 'Missing tags');
  assert.ok($header.find('.publisher .owner').length, 'Missing owner');
  assert.ok($section.length, 'Missing content section');
});

test('Layout for youtube video', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Youtube Video',
    format: 'video',
    url: 'https://www.youtube.com/watch?v=hFAOXdXZ5TM'
  });
  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok($section.find('.gru-youtube-resource').length, 'YouTube component');
  assert.ok(
    $section.find('.gru-youtube-resource iframe').length,
    'YouTube iframe'
  );
});

test('Layout of preview section for vimeo video', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Vimeo Video',
    format: 'video',
    url: 'https://vimeo.com/channels/staffpicks/107094723'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok($section.find('.gru-vimeo-resource').length, 'Vimeo component');
  assert.ok($section.find('.gru-vimeo-resource iframe').length, 'Vimeo iframe');
});

test('Layout for image', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Image',
    format: 'image',
    url: 'http://example.com/image.png'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok($section.find('.gru-image-resource').length, 'Image component');
  assert.ok(
    $section.find('.gru-image-resource .panel-heading img').length,
    'Image tag'
  );
});

test('Layout of preview section for audio resource', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Audio',
    format: 'audio',
    url: 'http://example.com/test.mp3'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok(
    $section.find('.gru-url-resource').length,
    'URL resource component'
  );
  assert.ok(
    $section.find('.gru-url-resource iframe').length,
    'URL resource iframe'
  );
});

test('Layout of preview section for webpage', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Webpage',
    format: 'webpage',
    url: 'http://example.com/sample.html'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok(
    $section.find('.gru-url-resource').length,
    'URL resource component'
  );
  assert.ok(
    $section.find('.gru-url-resource iframe').length,
    'URL resource iframe'
  );
});

test('Layout of preview section for interactive', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Interactive',
    format: 'interactive',
    url: 'http://example.com/sample.swf'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok(
    $section.find('.gru-url-resource').length,
    'URL resource component'
  );
  assert.ok(
    $section.find('.gru-url-resource iframe').length,
    'URL resource iframe'
  );
});

test('Layout of preview section for text', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Text resource',
    format: 'text',
    url: 'http://example.com/sample.pdf'
  });

  this.set('resource', resource);
  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  assert.ok(
    $section.find('.gru-pdf-resource').length,
    'PDF resource component'
  );
  assert.ok(
    $section.find('.gru-pdf-resource iframe').length,
    'PDF resource iframe'
  );
});

test('Layout when a resource url cannot be showed in an iframe', function(
  assert
) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'resource',
    format: 'resource',
    url:
      'http://dev-content-gooru-org.s3-us-west-1.amazonaws.com/0004/9737/CK-12_Middle%20School%20Math_Grade%206_Chapter%206.pdf'
  });

  this.set('resource', resource);
  this.render(
    hbs`{{content/resources/gru-resource-play resource=resource isNotIframeUrl=true}}`
  );

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $section = $container.find('> section');
  assert.ok($section.length, 'Missing content section');

  const $panel = $container.find('.not-iframe');
  assert.ok($panel.length, 'Missing not-iframe panel');

  assert.ok(
    $panel.find('.panel-header').length,
    'panel-header of not-iframe panel'
  );
  assert.ok(
    $panel.find('.panel-body').length,
    'panel-body of not-iframe panel'
  );
  assert.ok(
    $panel.find('.panel-body .gru-resource-card').length,
    'Missing resource card'
  );
  assert.ok(
    $panel.find('.panel-body .gru-resource-card a.play-btn').length,
    'Missing play button'
  );
  assert.ok(
    $panel.find('.panel-footer').length,
    'panel-footer of not-iframe panel'
  );
});

test('Layout with publisher', function(assert) {
  var resource = Resource.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Resource Title',
    format: 'video',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    owner: Ember.Object.create({
      firstName: 'Publisher'
    }),
    isPublished: true,
    publisher: 'Publisher name'
  });

  this.set('resource', resource);

  this.render(hbs`{{content/resources/gru-resource-play resource=resource}}`);

  var $container = this.$('article.content.resources.gru-resource-play');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok(
    $header.find('.publisher .publisher-name').length,
    'Missing publisher'
  );
});
