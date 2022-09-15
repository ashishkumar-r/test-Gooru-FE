import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'student/gru-performance-course-filter',
  'Integration | Component | student/gru performance course filter',
  {
    integration: true
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

  const filterCriteria = Ember.Object.create({
    collectionType: 'assessment',
    courseId: '0101',
    lessonId: '0103',
    unitId: '0102'
  });

  this.set('selectedCourse', courseMock);
  this.set('filterCriteria', filterCriteria);

  this.render(
    hbs`{{student/gru-performance-course-filter selectedCourse=selectedCourse filterCriteria=filterCriteria}}`
  );

  var $performanceFilterPanel = this.$(); //component dom element

  const $performanceFilterPanelHeader = $performanceFilterPanel.find('.header');
  T.exists(assert, $performanceFilterPanelHeader, 'Missing filter header');
  T.exists(
    assert,
    $performanceFilterPanelHeader.find('.title'),
    'Missing filter header title'
  );
  const units = [
    Ember.Object.create({
      collectionType: 'assessment',
      courseId: '0101',
      lessonId: '0103',
      unitId: '0102',
      title: 'new unit title',
      isUnitFiltersExpanded: true
    })
  ];

  this.set('units', units);

  const $performanceFilterPanelBody = $performanceFilterPanel.find('.body');
  T.exists(assert, $performanceFilterPanelBody, 'Missing filter body');

  const $filterType = $performanceFilterPanelBody.find('.filter-type');
  assert.equal($filterType.length, 1, 'Incorrect number of filter Types');

  const $course = $performanceFilterPanelBody.find('.filter-type.course');
  assert.ok($course.length, 'Missing course option');

  const $contenPanel = $performanceFilterPanelBody.find('.content-panel');
  assert.equal($contenPanel.length, 1, 'Incorrect number of content Panels');

  const $coursePanel = $performanceFilterPanelBody.find(
    '.content-panel.course'
  );
  assert.ok($coursePanel.length, 'Missing course panel');

  const $courseContentPanel = $performanceFilterPanelBody.find(
    '.content-panel.course'
  );
  assert.ok(
    $courseContentPanel.hasClass('visible'),
    'Course content panel is visible by default'
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

  const filterCriteria = Ember.Object.create({
    collectionType: 'assessment',
    courseId: '0101',
    lessonId: null,
    unitId: null
  });

  this.set('selectedCourse', courseMock);
  this.set('filterCriteria', filterCriteria);

  this.render(
    hbs`{{student/gru-performance-course-filter  selectedCourse=selectedCourse filterCriteria=filterCriteria}}`
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
test('Do not show the course tab', function(assert) {
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

  const filterCriteria = Ember.Object.create({
    collectionType: 'assessment',
    courseId: '0101',
    lessonId: '0103',
    unitId: '0102'
  });

  this.set('selectedCourse', courseMock);
  this.set('filterCriteria', filterCriteria);
  this.set('showCourse', false);

  this.render(
    hbs`{{student/gru-performance-course-filter selectedCourse=selectedCourse filterCriteria=filterCriteria showCourse=showCourse}}`
  );

  var $performanceFilterPanel = this.$(); //component dom element

  const $performanceFilterPanelHeader = $performanceFilterPanel.find('.header');
  T.exists(assert, $performanceFilterPanelHeader, 'Missing filter header');
  T.exists(
    assert,
    $performanceFilterPanelHeader.find('.title'),
    'Missing filter header title'
  );

  const units = [
    Ember.Object.create({
      collectionType: 'assessment',
      courseId: '0101',
      lessonId: '0103',
      unitId: '0102',
      title: 'new unit title',
      isUnitFiltersExpanded: true
    })
  ];

  this.set('units', units);

  const $performanceFilterPanelBody = $performanceFilterPanel.find('.body');
  T.exists(assert, $performanceFilterPanelBody, 'Missing filter body');

  const $course = $performanceFilterPanelBody.find('.filter-type.course');
  assert.notOk($course.length, 'Course filter should not appear');

  const $coursePanel = $performanceFilterPanelBody.find(
    '.content-panel.course'
  );
  assert.notOk($coursePanel.length, 'Course panel should not appear');

  const $courseContentPanel = $performanceFilterPanelBody.find(
    '.content-panel.course'
  );
  assert.notOk(
    $courseContentPanel.hasClass('visible'),
    'Course content panel is not visible by default'
  );
});
