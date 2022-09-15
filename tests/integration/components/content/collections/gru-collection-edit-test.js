import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Collection from 'gooru-web/models/content/collection';
import Course from 'gooru-web/models/content/course';
import CenturySkillModel from 'gooru-web/models/century-skill/century-skill';
import { registerQuizzesServices } from 'gooru-web/tests/helpers/quizzes';

const taxonomyServiceStub = Ember.Service.extend({
  getSubjects(category) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!category) {
        reject({ status: 500 });
      } else {
        resolve({
          subjects: [
            {
              id: 'GDF.K12.CS',
              title: 'Computer Science',
              description: null,
              code: 'GDF.K12.CS',
              standard_framework_id: 'GDF'
            }
          ]
        });
      }
    });
  }
});

moduleForComponent(
  'content/collections/gru-collection-edit',
  'Integration | Component | content/collections/gru collection edit',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.register('service:api-sdk/taxonomy', taxonomyServiceStub);
      this.register('service:popover', Ember.Service.extend({}));
      this.inject.service('api-sdk/taxonomy');

      registerQuizzesServices(this);
    }
  }
);

skip('it has header and main sections', function(assert) {
  var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Collection Title'
  });

  this.set('collection', collection);
  this.render(
    hbs`{{content/collections/gru-collection-edit collection=collection}}`
  );

  var $container = this.$('article.content.collections.gru-collection-edit');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('> .actions').length, 'Header actions');
  assert.equal(
    $header.find('> .actions > button').length,
    5,
    'Number of header actions'
  );
  assert.ok($header.find('> nav').length, 'Header navigation');
  assert.equal(
    $header.find('> nav > a').length,
    3,
    'Number of header navigation links'
  );
  assert.notOk(
    $header.find('.back-to').length,
    'Should don\'t have the option Back to course'
  );

  assert.equal(
    $container.find('> section').length,
    3,
    'Number of edit sections'
  );

  const $informationSection = $container.find('> section#information');
  const $builderSection = $container.find('> section#builder');
  const $settingsSection = $container.find('> section#settings');

  assert.ok($informationSection.length, 'Information section');
  assert.ok($builderSection.length, 'Builder section');
  assert.ok($settingsSection.length, 'Settings section');
});

test('Layout of the information section', function(assert) {
  var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Collection Title'
  });

  this.set('collection', collection);
  this.render(
    hbs`{{content/collections/gru-collection-edit collection=collection}}`
  );

  var $informationSection = this.$('#information');

  assert.ok($informationSection.find('> .header').length, 'Information Header');
  assert.ok(
    $informationSection.find('> .header h2').length,
    'Information Title'
  );
  assert.ok(
    $informationSection.find('> .header .actions').length,
    'Information actions'
  );

  const $informationContent = $informationSection.find('.content');
  assert.ok($informationContent.length, 'Information section');
  assert.ok($informationContent.find('.title').length, 'Collection Title');
  assert.ok(
    $informationContent.find('.learning-objectives').length,
    'Collection learning-objectives'
  );

  var $standardsLabel = $informationSection.find('.standards label span');

  assert.ok($standardsLabel.length, 'Missing standards label');
  assert.equal(
    $standardsLabel.text(),
    this.get('i18n').t('common.standards').string,
    'Incorrect standards label text'
  );
  //ToDo: Enable this assert after century init fix
  // assert.ok(
  //   $informationContent.find('.century-skills').length,
  //   'Collection century-skills'
  // );
});

test('Information section - Competency Label', function(assert) {
  var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Collection Title'
  });

  this.set('collection', collection);
  this.render(
    hbs`{{content/collections/gru-collection-edit collection=collection standardLabel=false}}`
  );

  var $informationSection = this.$('#information');
  var $competencyLabel = $informationSection.find(
    '.panel-body .standards label span'
  );

  assert.ok($competencyLabel.length, 'Missing standards label');
  assert.equal(
    $competencyLabel.text(),
    this.get('i18n').t('common.competencies').string,
    'Incorrect competency label text'
  );
});

test('Information section - Century skills Label', function(assert) {
  var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Collection Title',
    centurySkills: [1, 5]
  });

  var centurySkills = [
    CenturySkillModel.create({
      id: 1,
      label: 'Problem Formulation',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Cognitive Skills and Strategies'
    }),
    CenturySkillModel.create({
      id: 2,
      label: 'Research: Access and Evaluate Information',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Cognitive Skills and Strategies'
    }),
    CenturySkillModel.create({
      id: 3,
      label: 'Global Awareness',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Content Knowledge'
    }),
    CenturySkillModel.create({
      id: 4,
      label: 'Building of Persistence',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Learning Skills and Techniques'
    }),
    CenturySkillModel.create({
      id: 5,
      label: 'Leadership',
      hewlettDeepLearningModel: true,
      conleyFourKeysModel: false,
      p21FrameworkModel: true,
      nationalResearchCenterModel: false,
      group: 'Key Learning Skills and Techniques'
    })
  ];

  this.set('collection', collection);
  this.set('centurySkills', centurySkills);
  this.render(
    hbs`{{content/collections/gru-collection-edit collection=collection centurySkills=centurySkills}}`
  );

  var $informationSection = this.$('#information');
  var $centurySkillsLabel = $informationSection.find('.century-skills');

  assert.ok($centurySkillsLabel.length, 'Collection century-skills');
  assert.equal(
    $centurySkillsLabel.find('.skills .gru-century-skill-tag').length,
    2,
    'Two gru-century-skill-tag components'
  );
});

test('Header when comes from content builder', function(assert) {
  var collection = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Collection Title'
  });

  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Course Title',
    id: '123445566'
  });

  this.set('collection', collection);
  this.set('course', course);

  this.render(
    hbs`{{content/collections/gru-collection-edit allowBack=true collection=collection course=course}}`
  );

  var $container = this.$('article.content.collections.gru-collection-edit');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok(
    $header.find('.back-to').length,
    'Should have the option Back to course'
  );
});
