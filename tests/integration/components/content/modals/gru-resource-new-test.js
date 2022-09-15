import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Resource from 'gooru-web/models/content/resource';
import Collection from 'gooru-web/models/content/collection';

const collectionServiceMock = Ember.Service.extend({
  addResource: function(collectionId, resourceId) {
    if (collectionId && resourceId) {
      return Ember.RSVP.resolve('');
    } else {
      return Ember.RSVP.reject('Adding resource to collection failed');
    }
  }
});

const resourceServiceMock = Ember.Service.extend({
  createResource: function(resourceData) {
    if (resourceData) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'resource-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Resource copy failed');
    }
  },
  copyResource: function(resourceId) {
    if (resourceId) {
      return Ember.RSVP.resolve('resource-id');
    } else {
      return Ember.RSVP.reject('Resource copy failed');
    }
  }
});

moduleForComponent(
  'content/modals/gru-resource-new',
  'Integration | Component | content/modals/gru resource new',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/collection', collectionServiceMock);
      this.register('service:api-sdk/resource', resourceServiceMock);

      this.inject.service('api-sdk/collection');
      this.inject.service('api-sdk/resource');
    }
  }
);

test('New Resource Layout', function(assert) {
  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  assert.ok($component.length, 'Missing Component');
  assert.ok($component.find('h4.modal-title'), 'Missing Title');
  assert.ok($component.find('.icon .link'), 'Missing link icon');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('common.add-new-resource').string,
    'Incorrect Title'
  );
  assert.ok(
    $component.find('label.url-label span').length,
    'Missing URL label'
  );
  assert.equal(
    $component.find('.header span.title').text(),
    this.get('i18n').t('common.add-from-url').string,
    'Incorrect Add URL Label'
  );
  assert.equal(
    $component.find('.header button').text(),
    this.get('i18n').t('common.upload-file').string,
    'Upload link'
  );
  assert.equal(
    $component.find('label.url-label span').text(),
    this.get('i18n').t('common.enter-url').string,
    'Incorrect Enter URL Label'
  );
  assert.ok(
    $component.find('label.url-label input').length,
    'Missing Title Input'
  );
  assert.ok(
    $component.find('label.title-label span').length,
    'Missing Title label'
  );
  assert.equal(
    $component.find('label.title-label span').text(),
    this.get('i18n').t('common.resource-title').string,
    'Incorrect Resource Title Label'
  );
  assert.ok(
    $component.find('label.title-label input').length,
    'Missing Title Input'
  );
  assert.ok(
    $component.find('.actions button.cancel-btn').length,
    'Missing Cancel Button'
  );
  assert.ok(
    $component.find('.actions button.more-btn').length,
    'Missing More Details Button'
  );
  assert.ok(
    $component.find('.actions button.add-btn').length,
    'Missing Add Button'
  );
});

test('New Resource Layout - Existing resource', function(assert) {
  const resource = Resource.create({
    title: 'My Resource',
    format: 'video'
  });

  this.set('resource', resource);

  this.render(
    hbs`{{content/modals/gru-resource-new existingResource=resource}}`
  );

  const $component = this.$('.gru-resource-new');
  assert.ok(
    !$component.find('.actions button.add-btn').length,
    'Add Button should not be visible'
  );
  assert.ok(
    !$component.find('.actions button.cancel-btn').length,
    'Cancel Button should not be visible'
  );
  assert.ok(
    $component.find('.actions button.close-btn').length,
    'Missing Close Button'
  );
  assert.ok(
    $component.find('.gru-resource-card').length,
    'Missing Resource Card'
  );
});

test('Validate if the resource URL is left blank', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  const $titleField = $component.find('.gru-input.url');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'URL error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions button.add-btn').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'URL error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val('http://goorutesting.com');
    $titleField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        !$titleField.find('.error-messages .error').length,
        'URL error message was hidden'
      );
    });
  });
});

test('Validate if the resource URL field has only whitespaces', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  const $titleField = $component.find('.gru-input.url');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'URL error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions button.add-btn').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'URL error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val(' ');
    $component.find('.actions button.add-btn').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'URL error message should be visible'
      );
    });
  });
});

test('Validate invalid URL', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  const $titleField = $component.find('.gru-input.url');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'URL error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions button.add-btn').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'URL error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val('kkkk');
    $component.find('.actions button.add-btn').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'URL error message should be visible'
      );
    });
  });
});

test('Validate if the resource Title is left blank', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions button.add-btn').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Title error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val('Title');
    $titleField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        !$titleField.find('.error-messages .error').length,
        'Title error message was hidden'
      );
    });
  });
});

test('Validate if the resource Title field has only whitespaces', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions button.add-btn').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Title error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val(' ');
    $component.find('.actions button.add-btn').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Title error message should be visible'
      );
    });
  });
});

test('Validate the character limit in the Resource title field', function(assert) {
  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const maxLenValue = this.$('.gru-resource-new .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});

test('it creates a resource and assigns it to an existing collection using more details', function(assert) {
  assert.expect(3);

  var transition;
  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, resourceId) {
      transition = {
        route: route,
        resource: resourceId
      };
    }
  });

  this.set(
    'collection',
    Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id'
    })
  );

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.render(
    hbs`{{content/modals/gru-resource-new model=collection router=router}}`
  );

  const $component = this.$('.gru-resource-new');
  const $urlField = $component.find('.gru-input.url');
  const $titleField = $component.find('.gru-input.title');

  // Fill in the input fields
  $urlField.find('input').val('resource-url.com');
  $urlField.find('input').blur();
  $titleField.find('input').val('resource-title');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.more-btn').click();

    return wait().then(function() {
      assert.equal(
        transition.route,
        'content.resources.edit',
        'Transition to correct route'
      );
      assert.equal(transition.resource, 'resource-id', 'Correct resource ID');
    });
  });
});

test('it toggles views between a URL and an upload resource', function(assert) {
  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');

  assert.equal(
    $component.find('.header button').text(),
    this.get('i18n').t('common.upload-file').string,
    'Upload link'
  );
  $component.find('.header button').click();

  assert.equal(
    $component.find('.header span.title').text(),
    this.get('i18n').t('common.upload-file').string,
    'Incorrect Add URL Label'
  );
  assert.equal(
    $component.find('.header button').text(),
    this.get('i18n').t('common.add-url').string,
    'URL link'
  );
  assert.ok(
    $component.find('label.filename-label .gru-file-picker').length,
    'Resource file picker'
  );
  assert.ok(
    $component.find('label.title-label span').length,
    'Resource title label'
  );
  assert.equal(
    $component.find('label.title-label span').text(),
    this.get('i18n').t('common.resource-title').string,
    'Resource title label text'
  );
  assert.ok(
    $component.find('label.title-label input').length,
    'Missing Title Input'
  );
});

test('show spinner button component while the server response, after clicking on the create button', function(assert) {
  // Mock the refresh method in the router
  this.set('router', {
    router: {
      refresh() {
        assert.ok(true, 'refresh function triggered');
      }
    }
  });

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.set(
    'collection',
    Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id'
    })
  );
  this.set('isLoadingCreate', false);

  this.render(
    hbs`{{content/modals/gru-resource-new model=collection router=router resource=resource isLoadingCreate=isLoadingCreate}}`
  );

  const $component = this.$('.gru-resource-new');

  const $urlField = $component.find('.gru-input.url');
  const $titleField = $component.find('.gru-input.title');

  $urlField.find('input').val('resource-url.com');
  $urlField.find('input').blur();
  $titleField.find('input').val('resource-title');
  $titleField.find('input').blur();
  $component.find('.add-btn').click();

  this.set('isLoadingCreate', true);
  this.set('isLoading', true);

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions .gru-spinner-button .create').length,
      'Create should not be visible'
    );
  });
});

test('show spinner button component while the server response, after clicking on the more details button', function(assert) {
  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, resourceId) {
      return {
        route: route,
        resource: resourceId
      };
    },
    router: {
      refresh() {
        assert.ok(true, 'refresh function triggered');
      }
    }
  });

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.set(
    'collection',
    Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id'
    })
  );

  this.set('isLoadingMoreDetails', false);

  this.render(
    hbs`{{content/modals/gru-resource-new model=collection router=router resource=resource isLoadingMoreDetails=isLoadingMoreDetails}}`
  );
  const $component = this.$('.gru-resource-new');

  const $urlField = $component.find('.gru-input.url');
  const $titleField = $component.find('.gru-input.title');

  $urlField.find('input').val('resource-url.com');
  $urlField.find('input').blur();
  $titleField.find('input').val('resource-title');
  $titleField.find('input').blur();

  $component.find('.more-btn').click();
  this.set('isLoadingMoreDetails', true);

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions .gru-spinner-button .more-btn').length,
      'More details button should not be visible'
    );
  });
});

test('show spinner button component while the server response, after clicking on the add to button', function(assert) {
  // Mock the refresh method in the router
  this.set('router', {
    router: {
      refresh() {
        assert.ok(true, 'refresh function triggered');
      }
    }
  });

  this.set(
    'existingResource',
    Resource.create(Ember.getOwner(this).ownerInjection(), {
      id: '12345',
      title: 'Resource Title',
      format: 'video',
      publisher: 'publisher',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      owner: Ember.Object.create({
        firstName: 'Publisher'
      }),
      standards: Ember.A([
        Ember.Object.create({
          description:
            'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
          code: 'CCSS.Math.Content.7.RP.A.3'
        }),
        Ember.Object.create({
          description:
            'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
          code: 'CCSS.Math.Content.5.NBT.A.2'
        })
      ])
    })
  );

  this.set(
    'collection',
    Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id'
    })
  );

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.set('isLoadingAddTo', false);

  this.render(
    hbs`{{content/modals/gru-resource-new model=collection router=router existingResource=existingResource isLoadingAddTo=isLoadingAddTo}}`
  );

  const $component = this.$('.gru-resource-new');

  $component.find('.add-btn').click();
  this.set('isLoadingAddTo', true);

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions .gru-spinner-button .add-btn').length,
      'Add to button should not be visible'
    );
  });
});

test('Detects input url, if is a video disables al other options and selects the video option', function(assert) {
  assert.expect(17);

  this.render(hbs`{{content/modals/gru-resource-new}}`);

  const $component = this.$('.gru-resource-new');
  const $urlField = $component.find('.gru-input.url');

  $urlField.find('input').val('www.google.com');
  $urlField.find('input').blur();
  return wait().then(function() {
    assert.ok(
      !$component.find('.resource-types .panel.resource-type-video.active')
        .length,
      'The video option should not be auto-selectec when url is not a video'
    );
    assert.ok(
      !$component.find('.resource-types .panel.resource-type-webpage.disabled')
        .length,
      'The webpage option should not be disabled when url is not a video'
    );
    assert.ok(
      !$component.find(
        '.resource-types .panel.resource-type-interactive.disabled'
      ).length,
      'The video option should not be disabled when url is not a video'
    );
    assert.ok(
      !$component.find('.resource-types .panel.resource-type-audio.disabled')
        .length,
      'The video option should not be disabled when url is not a video'
    );
    assert.ok(
      !$component.find('.resource-types .panel.resource-type-image.disabled')
        .length,
      'The video option should not be disabled when url is not a video'
    );
    assert.ok(
      !$component.find('.resource-types .panel.resource-type-text.disabled')
        .length,
      'The video option should not be disabled when url is not a video'
    );

    $urlField.find('input').val('https://vimeo.com/45196609');
    $urlField.find('input').blur();
    return wait().then(function() {
      assert.ok(
        !!$component.find('.resource-types .panel.resource-type-video.active')
          .length,
        'The video option should be auto-selectec when url is a video'
      );
      assert.ok(
        !!$component.find(
          '.resource-types .panel.resource-type-webpage.disabled'
        ).length,
        'The webpage option should be disabled when url is a video'
      );
      assert.ok(
        !!$component.find(
          '.resource-types .panel.resource-type-interactive.disabled'
        ).length,
        'The video option should be disabled when url is a video'
      );
      assert.ok(
        !!$component.find('.resource-types .panel.resource-type-audio.disabled')
          .length,
        'The video option should be disabled when url is a video'
      );
      assert.ok(
        !!$component.find('.resource-types .panel.resource-type-image.disabled')
          .length,
        'The video option should be disabled when url is a video'
      );
      assert.ok(
        !!$component.find('.resource-types .panel.resource-type-text.disabled')
          .length,
        'The video option should be disabled when url is a video'
      );

      $component.find('.resource-types .panel.resource-type-webpage').click();
      return wait().then(function() {
        assert.ok(
          !$component.find(
            '.resource-types .panel.resource-type-webpage.active'
          ).length,
          'The webpage option should not be activated when it\'s disabled'
        );
        $component
          .find('.resource-types .panel.resource-type-interactive')
          .click();
        return wait().then(function() {
          assert.ok(
            !$component.find(
              '.resource-types .panel.resource-type-interactive.active'
            ).length,
            'The interactive option should not be activated when it\'s disabled'
          );
          $component.find('.resource-types .panel.resource-type-audio').click();
          return wait().then(function() {
            assert.ok(
              !$component.find(
                '.resource-types .panel.resource-type-audio.active'
              ).length,
              'The audio option should not be activated when it\'s disabled'
            );
            $component
              .find('.resource-types .panel.resource-type-image')
              .click();
            return wait().then(function() {
              assert.ok(
                !$component.find(
                  '.resource-types .panel.resource-type-image.active'
                ).length,
                'The image option should not be activated when it\'s disabled'
              );
              $component
                .find('.resource-types .panel.resource-type-text')
                .click();
              return wait().then(function() {
                assert.ok(
                  !$component.find(
                    '.resource-types .panel.resource-type-text.active'
                  ).length,
                  'The text option should not be activated when it\'s disabled'
                );
              });
            });
          });
        });
      });
    });
  });
});
