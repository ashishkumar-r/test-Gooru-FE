import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'student/gru-performance-filter-panel',
  'Integration | Component | student/gru performance filter panel',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Layout', function(assert) {
  const courseMock = Ember.Object.create({
    id: '0101',
    title: 'Course 1',
    children: [
      Ember.Object.create({
        id: '0102',
        title: 'Unit 1',
        children: [
          Ember.Object.create({
            id: '0103',
            title: 'Lesson 1'
          })
        ]
      })
    ]
  });

  const coursesMock = [
    Ember.Object.create({
      id: '0101',
      title: 'Course 1'
    }),
    Ember.Object.create({
      id: '0201',
      title: 'Course 2'
    }),
    Ember.Object.create({
      id: '0301',
      title: 'Course 3'
    })
  ];

  const filterCriteria = Ember.Object.create({
    collectionType: 'assessment',
    courseId: '0101',
    lessonId: '0103',
    unitId: '0102'
  });

  this.set('selectedCourse', courseMock);
  this.set('courses', coursesMock);
  this.set('filterCriteria', filterCriteria);

  this.render(
    hbs`{{student/gru-performance-filter-panel courses=courses selectedCourse=selectedCourse filterCriteria=filterCriteria}}`
  );

  var $performanceFilterPanel = this.$(); //component dom element

  const $performanceFilterPanelHeader = $performanceFilterPanel.find('.header');
  T.exists(assert, $performanceFilterPanelHeader, 'Missing filter header');
  T.exists(
    assert,
    $performanceFilterPanelHeader.find('.title'),
    'Missing filter header title'
  );
  assert.equal(
    T.text($performanceFilterPanel.find('.title')),
    'Filter',
    'Wrong header title text'
  );

  const $performanceFilterPanelBody = $performanceFilterPanel.find('.body');
  T.exists(assert, $performanceFilterPanelBody, 'Missing filter body');

  T.exists(
    assert,
    $performanceFilterPanelBody.find('.filter-buttons'),
    'Missing filter buttons'
  );
  T.exists(
    assert,
    $performanceFilterPanelBody.find('.filter-buttons .course'),
    'Missing course button'
  );

  const $filterType = $performanceFilterPanelBody.find('.filter-type');
  assert.equal($filterType.length, 6, 'Incorrect number of filter Types');

  const $course = $performanceFilterPanelBody.find('.filter-type.course');
  assert.ok($course.length, 'Missing course option');

  const $activity = $performanceFilterPanelBody.find('.filter-type.activity');
  assert.ok($activity.length, 'Missing activity option');

  const $timePeriod = $performanceFilterPanelBody.find(
    '.filter-type.time-period'
  );
  assert.ok($timePeriod.length, 'Missing time period option');

  const $subject = $performanceFilterPanelBody.find('.filter-type.subject');
  assert.ok($subject.length, 'Missing subject option');

  const $unit = $performanceFilterPanelBody.find('.filter-type.unit');
  assert.ok($unit.length, 'Missing unit option');

  const $lesson = $performanceFilterPanelBody.find('.filter-type.lesson');
  assert.ok($lesson.length, 'Missing lesson option');

  const $contenPanel = $performanceFilterPanelBody.find('.content-panel');
  assert.equal($contenPanel.length, 4, 'Incorrect number of content Panels');

  const $coursePanel = $performanceFilterPanelBody.find(
    '.content-panel.course'
  );
  assert.ok($coursePanel.length, 'Missing course panel');

  const $activityPanel = $performanceFilterPanelBody.find(
    '.content-panel.activity'
  );
  assert.ok($activityPanel.length, 'Missing activity panel');

  const $unitPanel = $performanceFilterPanelBody.find('.content-panel.unit');
  assert.ok($unitPanel.length, 'Missing unit panel');

  const $lessonPanel = $performanceFilterPanelBody.find(
    '.content-panel.lesson'
  );
  assert.ok($lessonPanel.length, 'Missing lesson panel');

  const $courseContentPanel = $performanceFilterPanelBody.find(
    '.content-panel.course'
  );
  assert.ok(
    $courseContentPanel.hasClass('visible'),
    'Course content panel is visible by default'
  );

  T.exists(
    assert,
    $performanceFilterPanelBody.find('.actions'),
    'Missing action buttons'
  );
  T.exists(
    assert,
    $performanceFilterPanelBody.find('.update-report'),
    'Missing update report button'
  );
});

test('Expand/Collapse Course content panel', function(assert) {
  const courseMock = Ember.Object.create({
    id: '0101',
    title: 'Course 1',
    children: [
      Ember.Object.create({
        id: '0102',
        title: 'Unit 1',
        children: [
          Ember.Object.create({
            id: '0103',
            title: 'Lesson 1'
          })
        ]
      })
    ]
  });

  const coursesMock = [
    Ember.Object.create({
      id: '0101',
      title: 'Course 1'
    }),
    Ember.Object.create({
      id: '0201',
      title: 'Course 2'
    }),
    Ember.Object.create({
      id: '0301',
      title: 'Course 3'
    })
  ];

  const filterCriteria = Ember.Object.create({
    collectionType: 'assessment',
    courseId: '0101',
    lessonId: null,
    unitId: null
  });

  this.set('selectedCourse', courseMock);
  this.set('courses', coursesMock);
  this.set('filterCriteria', filterCriteria);

  this.render(
    hbs`{{student/gru-performance-filter-panel courses=courses selectedCourse=selectedCourse filterCriteria=filterCriteria}}`
  );

  var $performanceFilterPanel = this.$(); //component dom element

  const $courseFilterTypeArrow = $performanceFilterPanel.find(
    '.filter-type.course .arrow'
  );

  const $courseContentPanel = $performanceFilterPanel.find(
    '.content-panel.course'
  );
  assert.ok(
    $courseContentPanel.hasClass('visible'),
    'Course content panel is visible by default'
  );

  $courseFilterTypeArrow.click();
  return wait().then(function() {
    assert.ok(
      $courseContentPanel.hasClass('hidden'),
      'Course content panel is hidden'
    );
    $courseFilterTypeArrow.click();
    return wait().then(function() {
      assert.ok(
        $courseContentPanel.hasClass('visible'),
        'Course content panel is visible'
      );
    });
  });
});

test('Layout when a menu course item is selected', function(assert) {
  const courseMock = Ember.Object.create({
    id: '0101',
    title: 'Course 1',
    children: [
      Ember.Object.create({
        id: '0102',
        title: 'Unit 1',
        children: [
          Ember.Object.create({
            id: '0103',
            title: 'Lesson 1'
          })
        ]
      })
    ]
  });

  const coursesMock = [
    Ember.Object.create({
      id: '0101',
      title: 'Course 1'
    }),
    Ember.Object.create({
      id: '0201',
      title: 'Course 2'
    }),
    Ember.Object.create({
      id: '0301',
      title: 'Course 3'
    })
  ];

  const filterCriteria = Ember.Object.create({
    collectionType: 'assessment',
    courseId: '0101',
    lessonId: null,
    unitId: null
  });

  this.set('selectedCourse', courseMock);
  this.set('courses', coursesMock);
  this.set('filterCriteria', filterCriteria);

  this.on('selectCourse', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{student/gru-performance-filter-panel courses=courses selectedCourse=selectedCourse filterCriteria=filterCriteria onSelectCourse='selectCourse'}}`
  );
  var $performanceFilterPanel = this.$(); //component dom element

  const $courseContentPanel = $performanceFilterPanel.find(
    '.content-panel.course'
  );
  const $courseItem = $courseContentPanel.find('.items .item:eq(0) input');

  assert.ok($courseItem, 'Missing first course item in the content panel');
  $courseItem.click();
});
test('Expand/Collapse Activity content panel', function(assert) {
  this.render(hbs`{{student/gru-performance-filter-panel }}`);

  var $performanceFilterPanel = this.$();

  assert.equal(
    $performanceFilterPanel
      .find('.filter-type.activity .filter-category')
      .text()
      .trim(),
    'Study',
    'Study filter selected'
  );

  const $activityFilterTypeArrow = $performanceFilterPanel.find(
    '.filter-type.activity .arrow'
  );

  const $activityContentPanel = $performanceFilterPanel.find(
    '.content-panel.activity'
  );
  assert.ok(
    $activityContentPanel.hasClass('hidden'),
    'Activity content panel is hidden by default'
  );

  $activityFilterTypeArrow.click();
  return wait().then(function() {
    assert.ok(
      $activityContentPanel.hasClass('visible'),
      'Activity content panel should be visible'
    );
    assert.equal(
      $performanceFilterPanel
        .find('.filter-type.activity .filter-category')
        .text()
        .trim(),
      'Activity',
      'Activity filter selected'
    );
    assert.ok(
      $activityContentPanel.find('.activity-option.study.active'),
      'Study should be active'
    );
    $activityFilterTypeArrow.click();
    return wait().then(function() {
      assert.equal(
        $performanceFilterPanel
          .find('.filter-type.activity .filter-category')
          .text()
          .trim(),
        'Study',
        'Activity filter selected'
      );
      assert.ok(
        $activityContentPanel.hasClass('hidden'),
        'Activity content panel is visible'
      );
    });
  });
});
