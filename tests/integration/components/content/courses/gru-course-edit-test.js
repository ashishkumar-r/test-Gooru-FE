import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Course from 'gooru-web/models/content/course';
import TaxonomyRoot from 'gooru-web/models/taxonomy/taxonomy-root';
import TaxonomyItem from 'gooru-web/models/taxonomy/taxonomy-item';
import DS from 'ember-data';
import AudienceModel from 'gooru-web/models/audience';
import KnowledgeModel from 'gooru-web/models/depth-of-knowledge';

const courseServiceStub = Ember.Service.extend({
  updateCourse(editedCourse) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!editedCourse) {
        reject({
          status: 500
        });
      } else {
        resolve(editedCourse);
      }
    });
  }
});

const taxonomyServiceStub = Ember.Service.extend({
  getSubjects: function() {
    const t1 = TaxonomyRoot.create({
      id: 'subject.K12.1',
      frameworkId: 'framework-1',
      title: 'Subject 1',
      subjectTitle: 'Subject 1.1',
      code: 'subject.K12.1-code',
      frameworks: []
    });

    const t2 = TaxonomyRoot.create({
      id: 'subject-2',
      frameworkId: 'framework-2',
      title: 'Subject 2',
      subjectTitle: 'Subject 2.1',
      code: 'subject-2-code',
      frameworks: []
    });

    return new Ember.RSVP.resolve([t1, t2]);
  },

  getCategories: function() {
    const c1 = Ember.Object.create({
      id: 'k_12',
      code: 'K12',
      title: 'K12'
    });

    const c2 = Ember.Object.create({
      id: 'higher_education',
      code: 'HE',
      title: 'Higher Education'
    });

    const c3 = Ember.Object.create({
      id: 'professional_learning',
      code: 'PL',
      title: 'Professional Development'
    });

    return new Ember.RSVP.resolve([c1, c2, c3]);
  },

  getCourses: function(subject) {
    const courses = [
      TaxonomyItem.create({
        id: 'course-1',
        code: 'course-1-code',
        title: 'Course 1'
      }),
      TaxonomyItem.create({
        id: 'course-2',
        code: 'course-2-code',
        title: 'Course 2'
      })
    ];
    subject.set('courses', courses); //TODO the method should return the courses, not assign it to the parameter
    return new Ember.RSVP.resolve(courses);
  },
  findSubjectById: function(/* subjectId */) {
    const t1 = TaxonomyRoot.create({
      id: 'subject.K12.1',
      frameworkId: 'framework-1',
      title: 'Subject 1',
      subjectTitle: 'Subject 1.1',
      code: 'subject.K12.1-code',
      frameworks: []
    });
    return new Ember.RSVP.resolve(t1);
  }
});

var lookupServiceStub = Ember.Service.extend({
  readAudiences() {
    var promiseResponse;
    var response = [
      AudienceModel.create({ id: 1, name: 'all students', order: 1 }),
      AudienceModel.create({ id: 4, name: 'none students', order: 2 })
    ];

    promiseResponse = new Ember.RSVP.Promise(function(resolve) {
      Ember.run.next(this, function() {
        resolve(response);
      });
    });

    return DS.PromiseArray.create({
      promise: promiseResponse
    });
  },
  readDepthOfKnowledgeItems() {
    var promiseResponse;
    var response = [
      KnowledgeModel.create({ id: 1, name: 'Level 1: Recall', order: 1 }),
      KnowledgeModel.create({ id: 4, name: 'Level 4: Skill/Concept', order: 2 })
    ];

    promiseResponse = new Ember.RSVP.Promise(function(resolve) {
      Ember.run.next(this, function() {
        resolve(response);
      });
    });

    return DS.PromiseArray.create({
      promise: promiseResponse
    });
  }
});

moduleForComponent(
  'content/courses/gru-course-edit',
  'Integration | Component | content/courses/gru course edit',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.register('service:popover', Ember.Service.extend({}));
      this.register('service:api-sdk/course', courseServiceStub);
      this.inject.service('api-sdk/course');
      this.register('service:taxonomy', taxonomyServiceStub);
      this.inject.service('taxonomy');
      this.register('service:api-sdk/lookup', lookupServiceStub);
      this.inject.service('api-sdk/lookup');
    }
  }
);

test('it has header and main sections', function(assert) {
  assert.expect(11);
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Course Title',
    subject: 'CCSS.K12.Math',
    category: 'k_12',
    metadata: {},
    useCase: 'Use Case'
  });

  this.set('course', course);
  this.render(hbs`{{content/courses/gru-course-edit course=course}}`);

  var $container = this.$('article.content.courses.gru-course-edit');
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
    4,
    'Number of header navigation links'
  );

  assert.equal(
    $container.find('> section').length,
    4,
    'Number of edit sections'
  );
  assert.ok(
    $container.find('> section#information').length,
    'Information section'
  );
  assert.ok($container.find('> section#builder').length, 'Builder section');
  assert.ok($container.find('> section#settings').length, 'Settings section');
  assert.ok(
    $container.find('> section#collaborators').length,
    'Collaborators section'
  );
});

test('Layout of the information section', function(assert) {
  assert.expect(8);
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Course Title',
    subject: 'CCSS.K12.Math',
    category: 'k_12',
    metadata: {},
    useCase: 'Use Case'
  });

  this.set('course', course);
  this.render(hbs`{{content/courses/gru-course-edit course=course}}`);

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
  assert.ok($informationContent.find('.title').length, 'Course Title');
  assert.ok(
    $informationContent.find('.description').length,
    'Course description'
  );
  assert.ok(
    $informationContent.find('.gru-taxonomy-selector').length,
    'gru-taxonomy-selector component'
  );
  assert.ok($informationContent.find('.use-case').length, 'Course use-case');
});

/*test('Update Course Information', function (assert) {
  assert.expect(1);
  var newTitle ='Course for testing gooru';
  var newDescription ='Description for testing gooru';
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question for testing',
    description:""
  });
  this.set('course',course);
  this.render(hbs`{{content/courses/gru-course-edit course=course isEditing=true}}`);

  const $component = this.$('.gru-course-edit');
  const $titleField = $component.find(".gru-input.title");

  $titleField.find("input").val(newTitle);
  $titleField.find("input").trigger('blur');
  const $textDescription = $component.find(".gru-textarea.text");
  $textDescription.find("textarea").val(newDescription);
  $textDescription.find("textarea").change();

  const $save =  $component.find("#information .actions .save");
  $save.click();
  return wait().then(function () {
    assert.equal($component.find(".title label b").text(),newTitle , "The question title should be updated");
    const $textDescription = $component.find(".description textarea");
    $textDescription.blur();
    assert.equal($textDescription.text(),newDescription , "The question title should be updated");
  });
});*/

test('Validate the character limit in the Description field', function(assert) {
  assert.expect(1);
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question for testing',
    description: '',
    metadata: {},
    useCase: 'Use Case',
    category: 'k_12'
  });
  this.set('course', course);

  this.render(
    hbs`{{content/courses/gru-course-edit isEditing=true course=course tempCourse=course}}`
  );

  const maxLenValue = this.$(
    '.gru-course-edit .gru-textarea.description textarea'
  ).prop('maxlength');
  assert.equal(maxLenValue, 500, 'Input max length');
});

test('Validate the character limit in the Use Case field', function(assert) {
  assert.expect(1);
  var course = Course.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Question for testing',
    description: '',
    category: 'k_12',
    metadata: {},
    useCase: ''
  });
  this.set('course', course);

  this.render(
    hbs`{{content/courses/gru-course-edit isEditing=true course=course tempCourse=course}}`
  );

  const maxLenValue = this.$(
    '.gru-course-edit .gru-textarea.useCase textarea'
  ).prop('maxlength');
  assert.equal(maxLenValue, 500, 'Input max length');
});
