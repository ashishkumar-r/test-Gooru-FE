import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent(
  'student/gru-performance-filter-panel',
  'Unit | Component | student/gru performance filter panel',
  {
    unit: true,
    needs: ['service:configuration']
  }
);

test('selectActivity', function(assert) {
  let component = this.subject();
  component.send('selectActivity', 'activity-test');
  assert.equal(
    component.get('activityFilter'),
    'activity-test',
    'Incorrect activity filter'
  );
});

test('showActivitySubcategory', function(assert) {
  let component = this.subject();
  assert.ok(
    component.get('showActivitySubcategory'),
    'Should show the activity subCategory'
  );
  component.set('isActivityFiltersExpanded', true);
  assert.notOk(
    component.get('showActivitySubcategory'),
    'Should not show the activity subCategory'
  );
});

test('expandPanel', function(assert) {
  let component = this.subject();
  component.send('expandPanel', 'subject');
  assert.ok(
    component.get('isSubjectFiltersExpanded'),
    'Incorrect value of isSubjectFiltersExpanded'
  );
  component.send('expandPanel', 'subject');
  assert.notOk(
    component.get('isSubjectFiltersExpanded'),
    'Incorrect value of isSubjectFiltersExpanded'
  );

  component.send('expandPanel', 'course');
  assert.notOk(
    component.get('isCourseFiltersExpanded'),
    'Incorrect value of isCourseFiltersExpanded'
  );
  component.send('expandPanel', 'course');
  assert.ok(
    component.get('isCourseFiltersExpanded'),
    'Incorrect value of isCourseFiltersExpanded'
  );

  component.send('expandPanel', 'unit');
  assert.ok(
    component.get('isUnitFiltersExpanded'),
    'Incorrect value of isUnitFiltersExpanded'
  );
  component.send('expandPanel', 'unit');
  assert.notOk(
    component.get('isUnitFiltersExpanded'),
    'Incorrect value of isUnitFiltersExpanded'
  );

  component.send('expandPanel', 'lesson');
  assert.ok(
    component.get('isLessonFiltersExpanded'),
    'Incorrect value of isLessonFiltersExpanded'
  );
  component.send('expandPanel', 'lesson');
  assert.notOk(
    component.get('isLessonFiltersExpanded'),
    'Incorrect value of isLessonFiltersExpanded'
  );

  component.send('expandPanel', 'activity');
  assert.ok(
    component.get('isActivityFiltersExpanded'),
    'Incorrect value of isActivityFiltersExpanded'
  );
  component.send('expandPanel', 'activity');
  assert.notOk(
    component.get('isActivityFiltersExpanded'),
    'Incorrect value of isActivityFiltersExpanded'
  );

  component.send('expandPanel', 'time-period');
  assert.ok(
    component.get('isTimePeriodFiltersExpanded'),
    'Incorrect value of isTimePeriodFiltersExpanded'
  );
  component.send('expandPanel', 'time-period');
  assert.notOk(
    component.get('isTimePeriodFiltersExpanded'),
    'Incorrect value of isTimePeriodFiltersExpanded'
  );
});

test('unit', function(assert) {
  let component = this.subject();
  const selectedCourse = Ember.Object.create({
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
      }),
      Ember.Object.create({
        id: '0202',
        title: 'Unit 2',
        children: [
          Ember.Object.create({
            id: '0203',
            title: 'Lesson 1'
          })
        ]
      })
    ]
  });

  component.set('selectedCourse', selectedCourse);
  component.set('unitId', '0102');
  assert.equal(component.get('unit.id'), '0102', 'Incorrect unit');
});

test('lesson', function(assert) {
  let component = this.subject();
  const selectedUnit = Ember.Object.create({
    id: '0102',
    title: 'Unit 1',
    children: [
      Ember.Object.create({
        id: '0103',
        title: 'Lesson 1'
      })
    ]
  });

  component.set('unit', selectedUnit);
  component.set('lessonId', '0103');
  assert.equal(component.get('lesson.id'), '0103', 'Incorrect lesson');
});

test('units', function(assert) {
  let component = this.subject();
  const selectedUnit = Ember.Object.create({
    id: '0102',
    title: 'Unit 1',
    children: [
      Ember.Object.create({
        id: '0103',
        title: 'Lesson 1'
      })
    ]
  });

  component.set('unit', selectedUnit);
  component.set('lessonId', '0103');
  assert.equal(component.get('lesson.id'), '0103', 'Incorrect lesson');
});

test('units', function(assert) {
  let component = this.subject();

  const selectedCourse = Ember.Object.create({
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
      }),
      Ember.Object.create({
        id: '0202',
        title: 'Unit 2',
        children: [
          Ember.Object.create({
            id: '0203',
            title: 'Lesson 1'
          })
        ]
      })
    ]
  });

  component.set('selectedCourse', selectedCourse);

  assert.equal(component.get('units').length, 2, 'Incorrect number of units');
});

test('lessons', function(assert) {
  let component = this.subject();
  const selectedUnit = Ember.Object.create({
    id: '0102',
    title: 'Unit 1',
    children: [
      Ember.Object.create({
        id: '0103',
        title: 'Lesson 1'
      })
    ]
  });

  component.set('unit', selectedUnit);
  assert.equal(
    component.get('lessons').length,
    1,
    'Incorrect number of lessons'
  );
});
