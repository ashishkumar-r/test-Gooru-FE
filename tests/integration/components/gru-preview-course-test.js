import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Course from 'gooru-web/models/content/course';
import Ember from 'ember';

moduleForComponent(
  'gru-preview-course',
  'Integration | Component | gru preview course',
  {
    integration: true
  }
);

test('Preview Course Layout - teacher', function(assert) {
  let model = {
    content: Course.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Course Title',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      owner: Ember.Object.create({
        id: 'owner-id',
        username: 'dara.weiner',
        avatarUrl: 'avatar-url'
      }),
      useCase: 'Use Case',
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
      ]),
      children: [
        Ember.Object.create({
          id: 'unit-123',
          sequence: 1,
          title: 'Unit Title A'
        }),
        Ember.Object.create({
          id: 'unit-456',
          sequence: 2,
          title: 'Unit Title B'
        })
      ]
    }),
    isTeacher: true
  };

  this.set('model', model);

  this.render(hbs`{{gru-preview-course model=model}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-course');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.notOk(
    $collectionCard.find('.header-action .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.course-information .image img').length,
    'Missing Image'
  );
  assert.ok(
    $collectionCard.find(
      '.course-information .course-info .title-section h3.title'
    ).length,
    'Missing Title'
  );
  assert.ok(
    $collectionCard.find(
      '.course-information .course-info .standards .gru-taxonomy-tag-list'
    ).length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find('.course-information .course-info .remixed-by .title')
      .length,
    'Owner title is missing'
  );
  assert.ok(
    $collectionCard.find('.course-information .course-info .remixed-by img')
      .length,
    'Missing image'
  );
  assert.ok(
    $collectionCard.find('.course-information .course-info .remixed-by .owner')
      .length,
    'Missing owner name'
  );
  assert.ok(
    $collectionCard.find('.description').length,
    'Missing course description'
  );
  assert.ok($collectionCard.find('.units').length, 'Missing units panel');
  assert.equal(
    $collectionCard.find('.units .unit').length,
    2,
    'Should have 2 units'
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

test('Preview Course Layout - anonymous', function(assert) {
  let model = {
    content: Course.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Course Title',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      owner: Ember.Object.create({
        id: 'owner-id',
        username: 'dara.weiner',
        avatarUrl: 'avatar-url'
      }),
      useCase: 'Use Case',
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
      ]),
      children: [
        Ember.Object.create({
          id: 'unit-123',
          sequence: 1,
          title: 'Unit Title A'
        }),
        Ember.Object.create({
          id: 'unit-456',
          sequence: 2,
          title: 'Unit Title B'
        })
      ]
    })
  };

  this.set('model', model);

  this.set(
    'session',
    Ember.Object.create({
      isAnonymous: true
    })
  );

  this.render(hbs`{{gru-preview-course model=model session=session}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-course');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.notOk(
    $collectionCard.find('.header-action .bookmark-btn').length,
    'Bookmark button should not appear'
  );
  assert.ok(
    $collectionCard.find('.course-information .image img').length,
    'Missing Image'
  );
  assert.ok(
    $collectionCard.find(
      '.course-information .course-info .title-section h3.title'
    ).length,
    'Missing Title'
  );
  assert.ok(
    $collectionCard.find(
      '.course-information .course-info .standards .gru-taxonomy-tag-list'
    ).length,
    'Missing Standards'
  );
  assert.ok(
    $collectionCard.find('.course-information .course-info .remixed-by .title')
      .length,
    'Owner title is missing'
  );
  assert.ok(
    $collectionCard.find('.course-information .course-info .remixed-by img')
      .length,
    'Missing image'
  );
  assert.ok(
    $collectionCard.find('.course-information .course-info .remixed-by .owner')
      .length,
    'Missing owner name'
  );
  assert.ok(
    $collectionCard.find('.description').length,
    'Missing course description'
  );
  assert.ok($collectionCard.find('.units').length, 'Missing units panel');
  assert.equal(
    $collectionCard.find('.units .unit').length,
    2,
    'Should have 2 units'
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

test('Preview Course Layout - student', function(assert) {
  let model = {
    content: Course.create(Ember.getOwner(this).ownerInjection(), {
      id: '123',
      title: 'Course Title',
      subject: 'CCSS.K12.Math',
      category: 'k_12',
      owner: Ember.Object.create({
        id: 'owner-id',
        username: 'dara.weiner',
        avatarUrl: 'avatar-url'
      }),
      useCase: 'Use Case',
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
      ]),
      children: [
        Ember.Object.create({
          id: 'unit-123',
          sequence: 1,
          title: 'Unit Title A'
        }),
        Ember.Object.create({
          id: 'unit-456',
          sequence: 2,
          title: 'Unit Title B'
        })
      ]
    }),
    isTeacher: false
  };

  this.set('model', model);

  this.render(hbs`{{gru-preview-course model=model}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-course');
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

test('Click on Study button', function(assert) {
  assert.expect(4);

  let model = {
    playCourse: () => assert.ok(true, 'Play course needs to be called.')
  };

  this.set('model', model);

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.render(hbs`{{gru-preview-course model=model}}`);

  var $component = this.$();
  const $collectionCard = $component.find('.gru-preview-course');
  assert.ok($collectionCard.length, 'Missing Component');
  assert.ok(
    $collectionCard.find('.actions .study-btn').length,
    'Missing study button'
  );
  $collectionCard.find('.actions .study-btn').click();
});
