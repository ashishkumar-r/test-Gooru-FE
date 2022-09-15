/*import { moduleForComponent, test } from 'ember-qunit';
//import hbs from 'htmlbars-inline-precompile';
//import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';

// Stub unit service
const unitServiceStub = Ember.Service.extend({

  findByClassAndCourse(classId, courseId) {
    var response;
    var promiseResponse;

    if (classId === '111-333-555' && courseId === '222-444-666') {
      response = [
        Ember.Object.create({
          id: "unit-1",
          title: "Unit 1",
          visibility: true
        }),
        Ember.Object.create({
          id: "unit-2",
          title: "Unit 2",
          visibility: true
        }),
        Ember.Object.create({
          id: "unit-3",
          title: "Unit 3",
          visibility: false
        })
      ];
    } else {
      response = [];
    }

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

// performance service
const performanceServiceStub = Ember.Service.extend({

  findStudentPerformanceByCourse(userId, classId, courseId) {
    var response;
    var promiseResponse;

    if (classId === '111-333-555' && courseId === '222-444-666') {
      response = [
        Ember.Object.create({
          id: "unit-1",
          title: "Unit 1",
          visibility: true
        }),
        Ember.Object.create({
          id: "unit-2",
          title: "Unit 2",
          visibility: true
        }),
        Ember.Object.create({
          id: "unit-3",
          title: "Unit 3",
          visibility: false
        })
      ];
    } else {
      response = [];
    }

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

const courseLocationStub = Ember.Service.extend({

  findByCourse(courseId) {
    var response;
    const users = [
      Ember.Object.create({
        isActive: false,
        user: Ember.Object.create({
          id: 1,
          firstName: "John",
          lastName: "Fitzgerald",
          fullName: "Fitzgerald, John"
        })
      })
    ];

    if (courseId === '222-444-666') {
      response = [
        Ember.Object.create({
          unit: 'unit-1',
          locationUsers: DS.PromiseArray.create({
            promise: new Ember.RSVP.resolve(users)
          })
        })
      ];
    } else {
      response = Ember.A();
    }

    return DS.PromiseArray.create({
      promise: new Ember.RSVP.resolve(response)
    });
  }
});

moduleForComponent('class/overview/gru-accordion-course', 'Integration | Component | class/overview/gru accordion course', {
  integration: true,

  beforeEach: function() {
    this.register('service:api-sdk/unit', unitServiceStub);
    this.inject.service('api-sdk/unit', { as: 'unitService' });

    this.register('service:api-sdk/course-location', courseLocationStub);
    this.inject.service('api-sdk/course-location', { as: 'courseLocationService' });

    this.register('service:api-sdk/performance', performanceServiceStub);
    this.inject.service('api-sdk/performance', { as: 'performanceService' });

    this.inject.service('i18n');
  }
});

// TODO JBP Fix this!!
/*
test('it renders correctly when there are no units', function(assert) {
  assert.expect(6);

  const context = this;

  // Class with no units per stub
  const currentClass = Ember.Object.create({
    id: "111-111-111",
    courseId: "999-999-999"
  });

  this.set('currentClass', currentClass);

  this.render(hbs`{{class/overview/gru-accordion-course currentClass=currentClass}}`);

  const $component = this.$('.gru-accordion-course');
  assert.ok($component.length, 'Component does not have the component class');

  const $panelGroup = $component.find('.accordion-course');
  assert.ok($panelGroup.length, 'Accordion  is missing');

  var $loadingSpinner = $panelGroup.find('.three-bounce-spinner');
  assert.ok($loadingSpinner.length, 'Loading spinner should be displayed');

  return wait().then(function() {
    $loadingSpinner = $panelGroup.find('.three-bounce-spinner');
    assert.ok(!$loadingSpinner.length, 'Loading spinner should have been hidden');

    const $items = $panelGroup.find('.gru-accordion-unit');
    assert.equal($items.length, 0, 'Incorrect number of lessons listed');
    assert.equal($panelGroup.text().trim(), context.get('i18n').t('common.contentUnavailable').string, 'Wrong text output');
  });
});
*/

// TODO JBP Fix this!!
/*
test('it renders correctly when there are units', function(assert) {
  assert.expect(9);

  // Class with units per stub
  const currentClass = Ember.Object.create({
    id: "111-333-555",
    courseId: "222-444-666"
  });

  this.set('currentClass', currentClass);

  this.render(
    hbs`{{class/overview/gru-accordion-course
          currentClass=currentClass
          userLocation=''}}`);

  const $component = this.$('.gru-accordion-course');
  assert.ok($component.length, 'Component does not have the component class');

  const $panelGroup = $component.find('.accordion-course');
  assert.ok($panelGroup.length, 'Accordion is missing');

  var $loadingSpinner = $panelGroup.find('.three-bounce-spinner');
  assert.ok($loadingSpinner.length, 'Loading spinner should be displayed');

  return wait().then(function() {
    $loadingSpinner = $panelGroup.find('.three-bounce-spinner');
    assert.ok(!$loadingSpinner.length, 'Loading spinner should have been hidden');

    const $items = $panelGroup.find('.gru-accordion-unit');
    assert.equal($items.length, 3, 'Incorrect number of lessons listed');
    assert.equal($items.first().find('.panel-title .title span').html().replace(/&nbsp;/g, " ").trim(), 'Unit 1.  Unit 1', 'Incorrect first unit title');
    assert.equal($items.last().find('.panel-title .title span').html().replace(/&nbsp;/g, " ").trim(), 'Unit 3.  Unit 3', 'Incorrect last unit title');

    assert.equal($items.first().find('.unit .gru-user-icons .first-view li').length, 1, 'Wrong number of user icons showing for the first unit for mobile');
    assert.equal($items.last().find('.unit .gru-user-icons .first-view li').length, 1, 'Wrong number of user icons showing for the last unit for mobile');

  });
});
*/
