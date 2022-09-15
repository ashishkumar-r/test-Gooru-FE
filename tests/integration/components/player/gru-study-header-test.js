import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import Class from 'gooru-web/models/content/class';

const classServiceStub = Ember.Service.extend({
  readClassInfo: function() {
    const aClassInfo = Class.create(Ember.getOwner(this).ownerInjection(), {
      id: 'class-1',
      title: 'MPM-Data Analytics Class',
      code: 'CZHAMO3'
    });

    return new Ember.RSVP.resolve(aClassInfo);
  }
});

const performanceServiceStub = Ember.Service.extend({
  findClassPerformanceSummaryByStudentAndClassIds: function() {
    const aClassPerformance = Class.create({
      id: 'class-1',
      classId: 'class-1',
      score: 80,
      timeSpent: 3242209,
      total: 5,
      totalCompleted: 4
    });

    return new Ember.RSVP.resolve([aClassPerformance]);
  },
  findCourseCompetencyCompletionByCourseIds: function() {
    const courseCompetencyCompletion = Class.create({
      courseId: 'course-1',
      score: 80,
      timeSpent: 3242209,
      totalCount: 5,
      completedCount: 2
    });
    return new Ember.RSVP.resolve([courseCompetencyCompletion]);
  },

  getCAPerformanceData: function() {
    const aClassCaPerformance = Class.create({
      score: 80,
      timeSpent: 3242209
    });
    return new Ember.RSVP.resolve([aClassCaPerformance]);
  }
});

moduleForComponent(
  'player/gru-study-header',
  'Integration | Component | player/gru study header',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.register('service:api-sdk/class', classServiceStub);
      this.inject.service('api-sdk/class');
      this.register('service:api-sdk/performance', performanceServiceStub);
      this.inject.service('api-sdk/performance');
      this.inject.service('api-sdk/suggest');
    }
  }
);

test('Layout', function(assert) {
  this.set('session', {
    userId: 'user-id'
  });

  this.set('classId', 'class-1');

  this.set('courseTitle', 'Marine Biology');

  this.render(
    hbs`{{player/gru-study-header classId=classId collection=collection  session=session courseTitle=courseTitle}}`
  );

  var $component = this.$(); //component dom element
  const $header = $component.find('.gru-study-header');

  T.exists(
    assert,
    $header.find('.bar-charts .completion-chart .gru-x-bar-chart'),
    'Missing completion chart'
  );
});
