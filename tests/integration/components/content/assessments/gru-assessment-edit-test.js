import { moduleForComponent, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Assessment from 'gooru-web/models/content/assessment';
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
  'content/assessments/gru-assessment-edit',
  'Integration | Component | content/assessments/gru assessment edit',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.register('service:popover', Ember.Service.extend({}));
      this.register('service:api-sdk/taxonomy', taxonomyServiceStub);
      this.inject.service('api-sdk/taxonomy');

      registerQuizzesServices(this);
    }
  }
);

skip('it has header and main sections', function(assert) {
  var assessment = Assessment.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Assessment Title'
  });

  this.set('assessment', assessment);
  this.render(
    hbs`{{content/assessments/gru-assessment-edit collection=assessment}}`
  );

  var $container = this.$('article.content.assessments.gru-assessment-edit');
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
    'Should not have the option Back to course'
  );

  assert.equal(
    $container.find('> section').length,
    3,
    'Number of edit sections'
  );
  assert.ok(
    $container.find('> section#information').length,
    'Information section'
  );
  assert.ok($container.find('> section#builder').length, 'Builder section');
  assert.ok($container.find('> section#settings').length, 'Settings section');

  //TODO adding a timeout here, this component has subcomponents doing async calls, producing a test error,
  var done = assert.async();
  Ember.run.later(function() {
    done();
  }, 300);
});

skip('Header when comes from content builder', function(assert) {
  var assessment = Assessment.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Assessment Title'
  });

  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Course Title',
    id: '123445566'
  });

  this.set('assessment', assessment);
  this.set('course', course);

  this.render(
    hbs`{{content/assessments/gru-assessment-edit allowBack=true course=course collection=assessment}}`
  );

  var $container = this.$('article.content.assessments.gru-assessment-edit');
  assert.ok($container.length, 'Component');

  const $header = $container.find('> header');
  assert.ok($header.length, 'Header');
  assert.ok(
    $header.find('.back-to').length,
    'Should have the option Back to Assessment'
  );

  //TODO adding a timeout here, this component has subcomponents doing async calls, producing a test error,
  var done = assert.async();
  Ember.run.later(function() {
    done();
  }, 300);
});

skip('Information section - Century skills Label', function(assert) {
  var assessment = Assessment.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Assessment Title',
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

  this.set('assessment', assessment);
  this.set('centurySkills', centurySkills);
  this.render(
    hbs`{{content/assessments/gru-assessment-edit collection=assessment centurySkills=centurySkills}}`
  );

  var $informationSection = this.$('#information');
  var $centurySkillsLabel = $informationSection.find('.century-skills label');

  assert.ok($centurySkillsLabel.length, 'Assessment century-skills label');
  assert.equal(
    $centurySkillsLabel.find('.skills .gru-century-skill-tag').length,
    2,
    'Two gru-century-skill-tag components'
  );

  //TODO adding a timeout here, this component has subcomponents doing async calls, producing a test error,
  var done = assert.async();
  Ember.run.later(function() {
    done();
  }, 300);
});
