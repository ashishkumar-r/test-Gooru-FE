import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
import { registerQuizzesServices } from 'gooru-web/tests/helpers/quizzes';

const collectionServiceStub = Ember.Service.extend({
  readCollection(collectionId) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!collectionId) {
        reject({ status: 500 });
      } else {
        resolve(
          Ember.Object.create({
            id: 'collection-id',
            title: 'collection-title'
          })
        );
      }
    });
  }
});

const assessmentServiceStub = Ember.Service.extend({
  readAssessment(assessmentId) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!assessmentId) {
        reject({ status: 500 });
      } else {
        resolve(
          Ember.Object.create({
            id: 'assessment-id',
            title: 'assessment-title'
          })
        );
      }
    });
  }
});

moduleForComponent(
  'new-cards/gru-collection-card',
  'Integration | Component | new cards/gru collection card',
  {
    integration: true,
    beforeEach: function() {
      this.register('service:api-sdk/collection', collectionServiceStub);
      this.inject.service('api-sdk/collection');
      this.register('service:api-sdk/assessment', assessmentServiceStub);
      this.inject.service('api-sdk/assessment');
      registerQuizzesServices(this);
    }
  }
);

test('Collection Card Layout', function(assert) {
  var collection = Ember.Object.create({
    id: '123',
    title: 'Collection Title',
    questionCount: 4,
    isCollection: true,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  this.set('collection', collection);

  this.on('parentAction', function(content) {
    assert.ok(content.id, '123', 'Incorrect content to play');
  });

  this.render(
    hbs`{{new-cards/gru-collection-card content=collection onOpenContentPlayer='parentAction' isStudent=false}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.ok(
    $collectionCard.find('.panel-heading h3.title').length,
    'Missing Title'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should not open the preview'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .title-section .play-content').length,
    'Title should open the player'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .edit-content').length,
    'Title should not open the edit'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image img').length,
    'Missing Collection Image'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .edit-content').length,
    'Image should not open the edit'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image .play-content').length,
    'Image should open the player'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .preview-content').length,
    'Image should not open the preview'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .question-resources').length,
    'Missing Question and Resource Label section'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .question-resources .question-count')
      .length,
    'Missing Question count'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .question-resources .resource-count')
      .length,
    'Resource count should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-body .gru-taxonomy-tag-list').length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find('.panel-body .remixed-by').length,
    'Missing Remixed By section'
  );
  assert.ok(
    $collectionCard.find('.panel-body .remixed-by img').length,
    'Missing Remixed By image'
  );
  assert.ok(
    $collectionCard.find('.panel-body .description .learning-objective').length,
    'Missing Collection Learning objective'
  );
  assert.notOk(
    $collectionCard.find('.panel-body .description .content-description')
      .length,
    'Collection Description should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Missing share button'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Missing preview button'
  );
});

test('Assessment Card Layout', function(assert) {
  var assessment = Ember.Object.create({
    title: 'Biodiversity at All Three Levels',
    resourceCount: 3,
    questionCount: 4,
    isAssessment: true,
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
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    author: 'dara.weiner',
    description:
      'Students will be able to break salt down into its basic chemical components (NaCl) and describe how these atoms come together to form this important compound.',
    course: 'Any course title'
  });

  this.set('assessment', assessment);
  this.render(
    hbs`{{new-cards/gru-collection-card content=assessment isStudent=false}}`
  );
  var $component = this.$(); //component dom element
  const $collectionCard = $component.find('.gru-collection-card');
  assert.ok(
    $collectionCard.find('.panel-heading h3.title').length,
    'Missing Title'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image img').length,
    'Missing Assessment Image'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .question-resources').length,
    'Missing Question and Resource Label section'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .question-resources .question-count')
      .length,
    'Question count should appear'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .question-resources .resource-count')
      .length,
    'Resource count should appear'
  );
  assert.ok(
    $collectionCard.find('.panel-body .gru-taxonomy-tag-list').length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find('.panel-body .author').length,
    'Missing Author section'
  );
  assert.ok(
    $collectionCard.find('.panel-body .author img').length,
    'Missing Remixed By image'
  );
  assert.ok(
    $collectionCard.find('.panel-body .description .learning-objective').length,
    'Missing Collection Learning objective'
  );
  assert.notOk(
    $collectionCard.find('.panel-body .description .content-description')
      .length,
    'Collection Description should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Missing share button'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Missing preview button'
  );
});

test('Course Card Layout as a Teacher/anonymous', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false,
    originalCreatorId: 'some-id',
    owner: Ember.Object.create({
      id: 'some-id'
    }),
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_3@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ]),
    taxonomy: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ])
  });

  this.set('course', course);
  this.render(
    hbs`{{new-cards/gru-collection-card content=course isCourse=true isStudent=false}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.notOk(
    $collectionCard.find('.panel-heading .image a.preview-content img').length,
    'Course Image should not open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should not open the preview'
  );

  assert.ok(
    $collectionCard.find('.panel-heading .unit-count').length,
    'Missing unit count'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .question-resources').length,
    'Missing Question and Resource Label section'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .question-resources .question-count')
      .length,
    'Question count should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .question-resources .resource-count')
      .length,
    'Resource count should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-body .gru-taxonomy-tag-list').length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find('.panel-body .remixed-by').length,
    'Missing Author section'
  );
  assert.ok(
    $collectionCard.find('.panel-body .remixed-by img').length,
    'Missing Remixed By image'
  );
  assert.notOk(
    $collectionCard.find('.panel-body .description .learning-objective').length,
    'Collection Learning objective should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-body .description .content-description')
      .length,
    'Collection Description should appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Missing share button'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Missing preview button'
  );
});

test('Share Collection', function(assert) {
  var collection = Ember.Object.create({
    title: 'Collection Title',
    questionCount: 4,
    isAssessment: false,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  this.set('collection', collection);
  this.render(hbs`{{new-cards/gru-collection-card content=collection}}`);
  var $component = this.$();
  let $share = $component.find('.panel-footer .share-btn');
  assert.notOk(
    $component.find('.gru-share-pop-over-window').length,
    'Share pop up should not appear'
  );
  $share.click();
  return wait().then(function() {
    assert.ok(
      $component.find('.gru-share-pop-over-window').length,
      'Share pop up missing'
    );
  });
});

test('Share Assessment', function(assert) {
  var assessment = Ember.Object.create({
    title: 'Biodiversity at All Three Levels',
    resourceCount: 3,
    questionCount: 4,
    isAssessment: true,
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
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    author: 'dara.weiner',
    description:
      'Students will be able to break salt down into its basic chemical components (NaCl) and describe how these atoms come together to form this important compound.',
    course: 'Any course title'
  });

  this.set('assessment', assessment);
  this.render(hbs`{{new-cards/gru-collection-card content=assessment}}`);
  var $component = this.$();
  let $share = $component.find('.panel-footer .share-btn');
  assert.notOk(
    $component.find('.gru-share-pop-over-window').length,
    'Share pop up should not appear'
  );
  $share.click();
  return wait().then(function() {
    assert.ok(
      $component.find('.gru-share-pop-over-window').length,
      'Share pop up missing'
    );
  });
});

test('Share course', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false,
    originalCreatorId: 'some-id',
    owner: Ember.Object.create({
      id: 'some-id'
    }),
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_3@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ]),
    taxonomy: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ])
  });

  this.set('course', course);
  this.render(
    hbs`{{new-cards/gru-collection-card content=course isCourse=true}}`
  );
  var $component = this.$();
  let $share = $component.find('.panel-footer .share-btn');
  assert.notOk(
    $component.find('.gru-share-pop-over-window').length,
    'Share pop up should not appear'
  );
  $share.click();
  return wait().then(function() {
    assert.ok(
      $component.find('.gru-share-pop-over-window').length,
      'Share pop up missing'
    );
  });
});

test('Functions when Teacher is in their own profile', function(assert) {
  var collection = Ember.Object.create({
    id: '123',
    title: 'Collection Title',
    questionCount: 4,
    isAssessment: false,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  this.set('collection', collection);

  var profile = Ember.Object.create({
    role: 'teacher'
  });

  this.set('profile', profile);

  this.set('isMyProfile', true);
  this.set('isOnProfile', true);

  this.on('parentAction', function(content) {
    assert.ok(content.id, '123', 'Incorrect content to edit');
  });

  this.render(
    hbs`{{new-cards/gru-collection-card profile=profile isOnProfile=isOnProfile isMyProfile=isMyProfile content=collection onEditContent='parentAction'}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should not open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .play-content').length,
    'Title should not open the player'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .title-section .edit-content').length,
    'Title should open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .preview-content').length,
    'Image should not open the preview'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image .edit-content').length,
    'Image should  open the edit'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .edit-btn').length,
    'Missing edit button'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .play-btn').length,
    'Missing play button'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Share button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Preview button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .visibility').length,
    'Not visible icon should appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .add-btn').length,
    'Missing add to button'
  );

  let $title = $collectionCard.find(
    '.panel-heading .title-section .edit-content'
  );
  $title.click();

  let $image = $collectionCard.find('.panel-heading .image .edit-content');
  $image.click();
});

test('Functions when Student is in their own profile', function(assert) {
  var collection = Ember.Object.create({
    id: '123',
    title: 'Collection Title',
    questionCount: 4,
    isAssessment: false,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  this.set('collection', collection);

  var profile = Ember.Object.create({
    role: 'student'
  });

  this.set('profile', profile);

  this.set('isMyProfile', true);
  this.set('isOnProfile', true);

  this.on('parentAction', function(content) {
    assert.ok(content.id, '123', 'Incorrect content to edit');
  });

  this.render(
    hbs`{{new-cards/gru-collection-card profile=profile isOnProfile=isOnProfile isMyProfile=isMyProfile content=collection onEditContent='parentAction'}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should not open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .play-content').length,
    'Title should not open the player'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .title-section .edit-content').length,
    'Title should open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .preview-content').length,
    'Image should not open the preview'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image .edit-content').length,
    'Image should  open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Share button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Preview button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .visibility').length,
    'Not visible icon should appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .add-btn').length,
    'Add to button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .edit-btn').length,
    'Edit button should appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .play-btn').length,
    'Play button should appear'
  );

  let $title = $collectionCard.find(
    '.panel-heading .title-section .edit-content'
  );
  $title.click();

  let $image = $collectionCard.find('.panel-heading .image .edit-content');
  $image.click();
});

test('Visibility icon when the content is visible on profile', function(
  assert
) {
  var assessment = Ember.Object.create({
    id: '123',
    title: 'Biodiversity at All Three Levels',
    resourceCount: 3,
    questionCount: 4,
    isAssessment: true,
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
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    author: 'dara.weiner',
    description:
      'Students will be able to break salt down into its basic chemical components (NaCl) and describe how these atoms come together to form this important compound.',
    course: 'Any course title',
    isVisibleOnProfile: true
  });

  this.set('assessment', assessment);

  var profile = Ember.Object.create({
    role: 'teacher'
  });

  this.set('profile', profile);

  this.set('isMyProfile', true);
  this.set('isOnProfile', true);

  this.on('parentAction', function(content) {
    assert.ok(content.id, '123', 'Incorrect content to edit');
  });

  this.render(
    hbs`{{new-cards/gru-collection-card profile=profile isOnProfile=isOnProfile isMyProfile=isMyProfile content=assessment onEditContent='parentAction'}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should not open the preview'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .title-section .edit-content').length,
    'Title should open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .preview-content').length,
    'Image should not open the preview'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image .edit-content').length,
    'Image should open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Share button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Preview button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .visibility').length,
    'Not visible icon should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .add-btn').length,
    'Missing add to button'
  );

  let $title = $collectionCard.find(
    '.panel-heading .title-section .edit-content'
  );
  $title.click();

  let $image = $collectionCard.find('.panel-heading .image .edit-content');
  $image.click();
});

test('Functions when anonymous is on a another person profile (Teacher or Student)', function(
  assert
) {
  var collection = Ember.Object.create({
    id: '123',
    title: 'Collection Title',
    questionCount: 4,
    isCollection: true,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: true
  });

  this.set('collection', collection);

  this.set('isMyProfile', false);

  this.set('profile', null);

  this.set('isOnProfile', true);

  this.on('parentAction', function(content) {
    assert.ok(content.id, '123', 'Incorrect content to play');
  });

  this.render(
    hbs`{{new-cards/gru-collection-card profile=profile isOnProfile=isOnProfile isMyProfile=isMyProfile content=collection onOpenContentPlayer='parentAction'}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should not open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .edit-content').length,
    'Title should not open the edit'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .title-section .play-content').length,
    'Title should open the play content'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image .play-content').length,
    'Image should open the player'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .edit-content').length,
    'Image should not open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .preview-content').length,
    'Image should not open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Share button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Missing preview button'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .visibility').length,
    'Not visible icon should appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .add-btn').length,
    'Add to button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .edit-btn').length,
    'Edit button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .play-btn').length,
    'Play button should not appear'
  );
});

test('Functions when student user is on a another person profile (Teacher or Student)', function(
  assert
) {
  var collection = Ember.Object.create({
    id: '123',
    title: 'Collection Title',
    questionCount: 4,
    isAssessment: false,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: true
  });

  this.set('collection', collection);

  this.set('isMyProfile', false);

  var profile = Ember.Object.create({
    role: 'student'
  });

  this.set('profile', profile);

  this.set('isOnProfile', true);

  this.on('parentAction', function(content) {
    assert.ok(content.id, '123', 'Incorrect content to preview');
  });

  this.render(
    hbs`{{new-cards/gru-collection-card profile=profile isOnProfile=isOnProfile isMyProfile=isMyProfile content=collection onOpenContentPlayer='parentAction'}}`
  );
  var $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.ok(
    $collectionCard.find('.panel-heading .title-section .preview-content')
      .length,
    'Title should open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .title-section .edit-content').length,
    'Title should not open the edit'
  );
  assert.ok(
    $collectionCard.find('.panel-heading .image .preview-content').length,
    'Image should open the preview'
  );
  assert.notOk(
    $collectionCard.find('.panel-heading .image .edit-content').length,
    'Image should not open the edit'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .share-btn').length,
    'Share button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.panel-footer .preview-btn').length,
    'Missing preview button'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .visibility').length,
    'Not visible icon should appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .add-btn').length,
    'Add to button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .edit-btn').length,
    'Edit button should not appear'
  );
  assert.notOk(
    $collectionCard.find('.panel-footer .play-btn').length,
    'Play button should not appear'
  );

  let $title = $collectionCard.find(
    '.panel-heading .title-section .preview-content'
  );
  $title.click();

  let $image = $collectionCard.find('.panel-heading .image .preview-content');
  $image.click();
});

test('Bookmark content from card', function(assert) {
  let done = assert.async();
  this.on('onBookmarkContent', function(content, showType) {
    assert.ok(showType, 'The type should be shown');
    assert.equal(content, 'test-content', 'Content should match');
    done();
  });
  this.set('content', 'test-content');
  this.render(
    hbs`{{new-cards/gru-collection-card content=content isCourse=true isStudent=true onBookmarkContent='onBookmarkContent'}}`
  );
  const $component = this.$();
  const $btn = $component.find('.bookmark-btn');
  assert.ok($btn.length, 'Bookmark button should appear');
  $btn.click();
});

test('Collection Card Published', function(assert) {
  var collection = Ember.Object.create({
    id: '123',
    title: 'Collection Title',
    questionCount: 4,
    isAssessment: false,
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
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: true,
    isPublished: true
  });

  this.set('collection', collection);

  var profile = Ember.Object.create({
    role: 'teacher'
  });

  this.set('profile', profile);

  this.set('isMyProfile', true);
  this.set('isOnProfile', true);

  this.render(
    hbs`{{new-cards/gru-collection-card profile=profile isOnProfile=isOnProfile isMyProfile=isMyProfile content=collection publishVisible=true}}`
  );

  const $component = this.$();
  const $collectionCard = $component.find('.gru-collection-card');
  assert.ok(
    assert,
    $collectionCard.find('.panel-heading .publish-icon').length,
    'Missing publish icon'
  );
});
