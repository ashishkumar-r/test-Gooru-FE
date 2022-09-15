import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

var performanceService = Ember.Object.create({
  findClassPerformanceSummaryByClassIds: () => {
    return Ember.Test.resolve([]);
  }
});

var activeClasses = false;
let archivedClasses = [
  Ember.Object.create({
    id: 'class1',
    title: 'Class Archived 1',
    isArchived: true,
    startDate: '2017-04-19T21:30:56Z',
    isTeacher: function() {
      return true;
    }
  }),
  Ember.Object.create({
    id: 'class2',
    title: 'Class Archived 2',
    isArchived: true,
    startDate: '2016-04-19T21:30:56Z',
    isTeacher: function() {
      return true;
    }
  })
];
var applicationController = Ember.Object.create({
  profile: Ember.Object.create({
    id: 'profile-id'
  }),

  showArchivedClasses: true,

  getLocalStorage: () => ({
    getItem: () => null
  })
});
moduleForComponent(
  'controller:teacher-home',
  'Unit | Controller | teacher-home',
  {
    needs: ['controller:application', 'controller:teacher/class']
  }
);
test('Sort Archived Classes by Date', function(assert) {
  Ember.run(() => {
    let controller = this.subject({
      applicationController,
      performanceService,
      activeClasses,
      archivedClasses
    });
    controller.set('showArchivedClasses', true);
    controller.send('filterByDate');
    assert.equal(
      controller.get('sortedArchivedClassrooms')[0].get('title'),
      'Class Archived 2',
      'Incorrect first class'
    );
    assert.equal(
      controller.get('sortedArchivedClassrooms')[1].get('title'),
      'Class Archived 1',
      'Incorrect last class'
    );
    controller.send('filterByDate');
    assert.equal(
      controller.get('sortedArchivedClassrooms')[0].get('title'),
      'Class Archived 1',
      'Incorrect first class'
    );
    assert.equal(
      controller.get('sortedArchivedClassrooms')[1].get('title'),
      'Class Archived 2',
      'Incorrect last class'
    );
  });
});

test('Sort Archived Classes By Title', function(assert) {
  Ember.run(() => {
    let controller = this.subject({
      applicationController,
      performanceService,
      activeClasses,
      archivedClasses
    });
    controller.send('filterByTitle');
    assert.equal(
      controller.get('sortedArchivedClassrooms')[0].get('title'),
      'Class Archived 1',
      'Incorrect first class'
    );
    assert.equal(
      controller.get('sortedArchivedClassrooms')[1].get('title'),
      'Class Archived 2',
      'Incorrect last class'
    );
    controller.send('filterByTitle');
    assert.equal(
      controller.get('sortedArchivedClassrooms')[0].get('title'),
      'Class Archived 2',
      'Incorrect first class'
    );
    assert.equal(
      controller.get('sortedArchivedClassrooms')[1].get('title'),
      'Class Archived 1',
      'Incorrect last class'
    );
  });
});
