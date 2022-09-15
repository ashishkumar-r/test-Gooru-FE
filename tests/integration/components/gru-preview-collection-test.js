import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Collection from 'gooru-web/models/content/collection';
import Ember from 'ember';

moduleForComponent(
  'gru-preview-collection',
  'Integration | Component | gru preview collection',
  {
    integration: true
  }
);

test('Preview Collection Layout - teacher', function(assert) {
  let model = {
    content: Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Collection Title',
      questionCount: 1,
      resourceCount: 1,
      owner: Ember.Object.create({
        id: 'owner-id',
        username: 'dara.weiner',
        avatarUrl: 'avatar-url'
      }),
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
        }),
        Ember.Object.create({
          description:
            'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
          code: 'CCSS.Math.Content.5.NBT.A.2'
        })
      ]),
      children: [
        Ember.Object.create({
          id: 'question-123',
          type: 'MC',
          order: 1,
          title: 'question Title A'
        }),
        Ember.Object.create({
          id: 'resource-456',
          type: 'interactive',
          order: 2,
          title: 'resource Title B'
        })
      ]
    }),
    isTeacher: true
  };

  this.set('model', model);

  this.render(hbs`{{gru-preview-collection model=model}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-collection');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.notOk(
    $collectionCard.find('.header-action .bookmark-btn').length,
    'Bookmark should not appear'
  );
  assert.ok(
    $collectionCard.find('.collection-information .image img').length,
    'Missing Image'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .title-section h3.title'
    ).length,
    'Missing Title'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .standards .gru-taxonomy-tag-list'
    ).length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .remixed-by .title'
    ).length,
    'Owner title is missing'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .remixed-by img'
    ).length,
    'Missing image'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .remixed-by .owner'
    ).length,
    'Missing owner name'
  );
  assert.ok(
    $collectionCard.find('.description').length,
    'Missing collection description'
  );
  assert.ok(
    $collectionCard.find('.resources').length,
    'Missing resources panel'
  );
  assert.equal(
    $collectionCard.find('.resources .resource').length,
    2,
    'Should have 2 resources'
  );
  assert.ok(
    $collectionCard.find('.actions .cancel').length,
    'Missing cancel button'
  );
  assert.ok(
    $collectionCard.find('.actions .remix-btn').length,
    'Missing remix button'
  );
});

test('Preview Collection Layout - student', function(assert) {
  let model = {
    content: Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Collection Title',
      questionCount: 1,
      resourceCount: 1,
      owner: Ember.Object.create({
        id: 'owner-id',
        username: 'dara.weiner',
        avatarUrl: 'avatar-url'
      }),
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
        }),
        Ember.Object.create({
          description:
            'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
          code: 'CCSS.Math.Content.5.NBT.A.2'
        })
      ]),
      children: [
        Ember.Object.create({
          id: 'question-123',
          type: 'MC',
          order: 1,
          title: 'question Title A'
        }),
        Ember.Object.create({
          id: 'resource-456',
          type: 'interactive',
          order: 2,
          title: 'resource Title B'
        })
      ]
    }),
    isTeacher: false
  };

  this.set('model', model);

  this.render(hbs`{{gru-preview-collection model=model}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-collection');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.ok(
    $collectionCard.find('.actions .cancel').length,
    'Missing cancel button'
  );
  assert.ok(
    $collectionCard.find('.actions .study-btn').length,
    'Missing study button'
  );
});
test('Preview Collection Layout - anonymous', function(assert) {
  let model = {
    content: Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Collection Title',
      questionCount: 1,
      resourceCount: 1,
      owner: Ember.Object.create({
        id: 'owner-id',
        username: 'dara.weiner',
        avatarUrl: 'avatar-url'
      }),
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
        }),
        Ember.Object.create({
          description:
            'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
          code: 'CCSS.Math.Content.5.NBT.A.2'
        })
      ]),
      children: [
        Ember.Object.create({
          id: 'question-123',
          type: 'MC',
          order: 1,
          title: 'question Title A'
        }),
        Ember.Object.create({
          id: 'resource-456',
          type: 'interactive',
          order: 2,
          title: 'resource Title B'
        })
      ]
    }),
    isTeacher: true
  };

  this.set('model', model);

  this.set(
    'session',
    Ember.Object.create({
      isAnonymous: true
    })
  );

  this.render(hbs`{{gru-preview-collection model=model session=session}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-collection');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.notOk(
    $collectionCard.find('.header-action .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.collection-information .image img').length,
    'Missing Image'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .title-section h3.title'
    ).length,
    'Missing Title'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .standards .gru-taxonomy-tag-list'
    ).length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .remixed-by .title'
    ).length,
    'Owner title is missing'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .remixed-by img'
    ).length,
    'Missing image'
  );
  assert.ok(
    $collectionCard.find(
      '.collection-information .collection-info .remixed-by .owner'
    ).length,
    'Missing owner name'
  );
  assert.ok(
    $collectionCard.find('.description').length,
    'Missing collection description'
  );
  assert.ok(
    $collectionCard.find('.resources').length,
    'Missing resources panel'
  );
  assert.equal(
    $collectionCard.find('.resources .resource').length,
    2,
    'Should have 2 resources'
  );
  assert.ok(
    $collectionCard.find('.actions .cancel').length,
    'Missing cancel button'
  );
  assert.ok(
    $collectionCard.find('.actions .remix-btn').length,
    'Missing remix button'
  );
});

test('Click on Study button', function(assert) {
  assert.expect(4);

  let model = {
    content: Collection.create(),
    playCollection: () => assert.ok(true, 'Play collection needs to be called.')
  };

  this.set('model', model);

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.render(hbs`{{gru-preview-collection model=model}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-collection');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.ok(
    $collectionCard.find('.actions .study-btn').length,
    'Missing study button'
  );
  $collectionCard.find('.actions .study-btn').click();
});
