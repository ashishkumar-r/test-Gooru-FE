import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Collection from 'gooru-web/models/content/collection';
import Ember from 'ember';

moduleForComponent(
  'content/modals/gru-add-to-classroom',
  'Integration | Component | content/modals/gru add to classroom',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  let collection = Collection.create({
    id: 'collection-id',
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
  let classroomList = Ember.A([
    Ember.Object.create({
      id: 'class-id',
      title: 'class title',
      studentCount: 6
    })
  ]);

  let model = {
    content: collection,
    classActivity: true,
    classroomList: classroomList
  };

  this.set('model', model);

  this.render(hbs`{{content/modals/gru-add-to-classroom model=model}}`);
  var $container = this.$('.content.modals.gru-add-to-classroom');
  assert.ok($container.length, 'Missing add to classroom component');
  assert.ok(
    $container.find('.modal-header .modal-title').length,
    'Missing title'
  );
  assert.ok($container.find('.modal-body .lead').length, 'Missing lead');
  assert.equal(
    $container.find('.list .panel').length,
    1,
    'Missing class panel'
  );
  assert.ok(
    $container.find('.modal-footer .cancel').length,
    'Missing cancel button'
  );
  assert.ok(
    $container.find('.modal-footer .add-to').length,
    'Missing add to button'
  );
});
