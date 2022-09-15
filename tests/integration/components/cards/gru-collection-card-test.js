import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'cards/gru-collection-card',
  'Integration | Component | cards/gru collection card',
  {
    integration: true
  }
);

test('Collection Card Layout', function(assert) {
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
  this.render(hbs`{{cards/gru-collection-card collection=collection}}`);
  var $component = this.$(); //component dom element
  const $collectionCard = $component.find('.gru-collection-card');
  T.exists(
    assert,
    $collectionCard.find('.panel-heading h6.title'),
    'Missing Title'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-heading .image img'),
    'Missing Collection Image'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-heading .question-resources'),
    'Missing Question and Resource Label'
  );
  T.notExists(
    assert,
    $collectionCard.find('.publish-icon'),
    'Publish Icon should no appear'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .course'),
    'Missing Course Label'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .gru-taxonomy-tag-list'),
    'Missing Standards'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .remixed-by'),
    'Missing Remixed By section'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .remixed-by img'),
    'Missing Remixed By image'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .description'),
    'Missing Collection Description'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-footer .remix-btn'),
    'Missing Remixed Button'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-footer .edit-btn'),
    'Edit Button should not be visible'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-footer .play-btn'),
    'Play Button should not be visible'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-footer .visibility .pull-right'),
    'Missing visibility icon'
  );
});

test('Collection Card Published', function(assert) {
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
    isVisibleOnProfile: true,
    isPublished: 'published'
  });

  this.set('collection', collection);
  this.set('isPublished', true);
  this.render(
    hbs`{{cards/gru-collection-card collection=collection publishVisible=false isPublished=isPublished}}`
  );
  var $component = this.$(); //component dom element
  const $collectionCard = $component.find('.gru-collection-card');
  T.exists(
    assert,
    $collectionCard.find('.publish-icon'),
    'Missing publish icon'
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
  this.render(hbs`{{cards/gru-collection-card collection=assessment}}`);
  var $component = this.$(); //component dom element
  const $collectionCard = $component.find('.gru-collection-card');
  T.exists(
    assert,
    $collectionCard.find('.panel-heading h6.title'),
    'Missing Title'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-heading .image img'),
    'Missing Collection Image'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-heading .question-resources'),
    'Missing Question and Resource Label'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .course'),
    'Missing Course Label'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .gru-taxonomy-tag-list'),
    'Missing Standards'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .author'),
    'Missing Remixed By section'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .author img'),
    'Missing Remixed By image'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-body .description'),
    'Missing Collection Description'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-footer .remix-btn'),
    'Missing Remixed Button'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-footer .edit-btn'),
    'Edit Button should not be visible'
  );
});

test('Collection card trying buttons', function(assert) {
  assert.expect(4);

  var collection = Ember.Object.create({
    id: 1,
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
    remixedBy: ['James', 'Andrea', 'Patric']
  });

  this.set('collection', collection);
  this.on('editCollection', function(collection) {
    assert.equal(collection.get('id'), 1, 'Wrong collection id');
  });
  this.on('openContentPlayer', function(collection) {
    assert.equal(collection.get('id'), 1, 'Wrong collection id');
  });

  this.render(
    hbs`{{cards/gru-collection-card collection=collection editEnabled=true onOpenContentPlayer="openContentPlayer" remixEnabled=false}}`
  );
  var $component = this.$(); //component dom element
  const $collectionCard = $component.find('.gru-collection-card');
  T.notExists(
    assert,
    $collectionCard.find('.panel-footer .remix-btn'),
    'Remixed Button should not fixed'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-footer .edit-btn'),
    'Edit Button should be visible'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-footer .play-btn'),
    'Edit Button should be visible'
  );

  $collectionCard.find('.panel-footer .edit-btn').click();
  $collectionCard.find('.panel-footer .play-btn').click();
});

test('Collection Small Card Layout', function(assert) {
  var collection = Ember.Object.create({
    title: 'Biodiversity at All Three Levels',
    resourceCount: 3,
    questionCount: 4,
    isAssessment: false
  });

  this.set('collection', collection);
  this.render(
    hbs`{{cards/gru-collection-card collection=collection isSmall=true}}`
  );
  var $component = this.$(); //component dom element
  const $collectionCard = $component.find('.gru-collection-card');
  T.exists(
    assert,
    $collectionCard.find('.panel-heading h6.title'),
    'Missing Title'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-heading .image img'),
    'Missing Collection Image'
  );
  T.exists(
    assert,
    $collectionCard.find('.panel-heading .question-resources'),
    'Missing Question and Resource Label'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-heading .course'),
    'Course Label shouldn\'t appear'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-body .author'),
    'Remixed By section shouldn\'t appear'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-body .author img'),
    'Remixed By image shouldn\'t appear'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-body .description'),
    'Collection Description shouldn\'t appear'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-footer .remix-btn'),
    'Remixed Button shouldn\'t appear'
  );
  T.notExists(
    assert,
    $collectionCard.find('.panel-footer .edit-btn'),
    'Edit Button should not be visible'
  );
});
