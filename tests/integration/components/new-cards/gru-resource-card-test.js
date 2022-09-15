import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import ResourceModel from 'gooru-web/models/content/resource';
import QuestionModel from 'gooru-web/models/content/question';

moduleForComponent(
  'new-cards/gru-resource-card',
  'Integration | Component | new-cards/gru resource card',
  {
    integration: true
  }
);

test('Resource Card Layout', function(assert) {
  var resource = ResourceModel.create({
    title: 'Resource Title',
    format: 'video',
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
    ]),
    isVisibleOnProfile: false
  });

  this.set('resource', resource);
  this.render(
    hbs`{{new-cards/gru-resource-card resource=resource isOnProfile=true allowProfileNavigation=true}}`
  );
  var $component = this.$(); //component dom element
  const $resourceCard = $component.find('.gru-resource-card');
  T.exists(
    assert,
    $resourceCard.find(
      '.panel-heading .header .resource-data .title-section h6.title'
    ),
    'Missing Title'
  );
  T.exists(
    assert,
    $resourceCard.find(`.panel-heading i.${resource.format}-icon`),
    'Missing Resource Icon'
  );
  assert.equal(
    T.text($resourceCard.find('.panel-heading .resource-type span')),
    'Video',
    'Incorrect  resource type'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .gru-taxonomy-tag-list'),
    'Missing standards'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher img'),
    'Missing Publisher Image'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher .owner a'),
    'Missing Owner Name'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .description p'),
    'Missing Description'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.add-to-btn'),
    'Missing Add to Button'
  );
  T.notExists(
    assert,
    $resourceCard.find('.panel-footer a.edit-btn'),
    'Edit Button should not be visible'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.play-btn'),
    'Missing Play button'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-heading div.visibility'),
    'Missing visibility icon'
  );
});

test('Question Card Layout', function(assert) {
  var question = QuestionModel.create({
    title: 'Question Title',
    format: 'question',
    type: 'MC',
    text:
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
    ]),
    isVisibleOnProfile: true
  });

  this.set('question', question);
  this.render(
    hbs`{{new-cards/gru-resource-card resource=question isOnProfile=true allowProfileNavigation=true}}`
  );
  var $component = this.$(); //component dom element
  const $resourceCard = $component.find('.gru-resource-card');
  T.exists(
    assert,
    $resourceCard.find(
      '.panel-heading .header .resource-data .title-section h6.title'
    ),
    'Missing Title'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-heading i.question-icon'),
    'Missing Question Icon'
  );
  assert.equal(
    T.text($resourceCard.find('.panel-heading .question-type span')),
    'Multiple Choice',
    'Incorrect question type'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .gru-taxonomy-tag-list'),
    'Missing standards'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher img'),
    'Missing Publisher Image'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher .owner a'),
    'Missing Owner Name'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .description p'),
    'Missing Description'
  );
  T.notExists(
    assert,
    $resourceCard.find('.panel-footer a.copy-btn'),
    'Remix button should not be visible'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.add-to-btn'),
    'Add To Button should be visible'
  );
  T.notExists(
    assert,
    $resourceCard.find('.panel-footer buttons.visibility'),
    'Missing visibility icon'
  );
  T.notExists(
    assert,
    $resourceCard.find('.panel-footer a.edit-btn'),
    'Edit Button should not be visible'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.play-btn'),
    'Missing play button'
  );
});

test('Resource card trying buttons', function(assert) {
  assert.expect(6);

  var resource = ResourceModel.create({
    id: 1,
    title: 'Resource Title',
    format: 'video',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    owner: Ember.Object.create({
      name: 'Publisher'
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
  });

  this.set('resource', resource);
  this.on('editResource', function(resource) {
    assert.equal(resource.get('id'), 1, 'Wrong resource id');
  });
  this.on('playResource', function(resource) {
    assert.equal(resource.get('id'), 1, 'Wrong resource id');
  });

  this.set('profileService', {
    readCollections: function(userId) {
      assert.equal(userId, 'user-id', 'Wrong user id');
      return Ember.RSVP.resolve([]);
    }
  });
  this.set('session', {
    userId: 'user-id'
  });

  this.render(
    hbs`{{new-cards/gru-resource-card resource=resource editEnabled=true isOnProfile=true onPlayResource="playResource" onEditResource="editResource" session=session profileService=profileService}}`
  );
  var $component = this.$(); //component dom element
  const $resourceCard = $component.find('.gru-resource-card');
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.add-to-btn'),
    'Add to Button should be visible'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.edit-btn'),
    'Edit Button should be visible'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-footer a.play-btn'),
    'Play Button should be visible'
  );
  $resourceCard.find('.panel-footer a.edit-btn').click();
  $resourceCard.find('.panel-footer a.play-btn').click();
  $resourceCard.find('.panel-footer a.add-to-btn').click();
});
test('Resource Card with publisher', function(assert) {
  var resource = ResourceModel.create({
    title: 'Resource Title',
    format: 'video',
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
    ]),
    isPublished: true,
    publisher: 'Publisher name'
  });

  this.set('resource', resource);
  this.render(
    hbs`{{new-cards/gru-resource-card resource=resource allowProfileNavigation=true}}`
  );
  var $component = this.$(); //component dom element
  const $resourceCard = $component.find('.gru-resource-card');
  T.notExists(
    assert,
    $resourceCard.find('.panel-body .publisher img'),
    'Publisher should not have image'
  );
  T.notExists(
    assert,
    $resourceCard.find('.panel-body .publisher .owner a'),
    'The publisher name should not be a link'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher .publisher-name'),
    'Missing publisher Name'
  );
});

test('Not allow profile navigation', function(assert) {
  var resource = ResourceModel.create({
    title: 'Resource Title',
    format: 'video',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    owner: Ember.Object.create({
      fullName: 'Owner'
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
    ]),
    isPublished: false,
    publisher: 'Publisher name'
  });

  this.set('resource', resource);
  this.render(
    hbs`{{new-cards/gru-resource-card resource=resource allowProfileNavigation=false}}`
  );
  var $component = this.$(); //component dom element
  const $resourceCard = $component.find('.gru-resource-card');
  T.notExists(
    assert,
    $resourceCard.find('.panel-body .publisher .publisher-name'),
    'Publisher Name should not be visible'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher img'),
    'Publisher should not have image'
  );
  T.notExists(
    assert,
    $resourceCard.find('.panel-body .publisher .owner a.enable'),
    'The publisher name should not be a link'
  );
  T.exists(
    assert,
    $resourceCard.find('.panel-body .publisher .owner a.disabled'),
    'Missing owner Name'
  );
});

test('Resource Card Published', function(assert) {
  var resource = ResourceModel.create({
    title: 'Resource Title',
    format: 'video',
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
    ]),
    isVisibleOnProfile: true,
    isPublished: true
  });

  this.set('resource', resource);
  this.render(
    hbs`{{new-cards/gru-resource-card resource=resource allowProfileNavigation=true publishVisible=true}}`
  );
  var $component = this.$(); //component dom element
  const $resourceCard = $component.find('.gru-resource-card');
  T.exists(
    assert,
    $resourceCard.find('.panel-heading .publish-icon'),
    'Missing publish icon'
  );
});
