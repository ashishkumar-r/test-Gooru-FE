import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel(
  'performance/class-performance',
  'Unit | Model | performance/class-performance',
  {
    // Specify the other units that are required for this test.
    needs: [
      'model:performance/student-performance',
      'model:performance/performance',
      'model:user/user',
      'model:meta',
      'model:taxonomy-preference',
      'validator:presence',
      'validator:length',
      'validator:format',
      'validator:username',
      'validator:email'
    ]
  }
);

test('Class average calculations for students and existing units', function(
  assert
) {
  var store = this.store();
  var studentPerformanceData = Ember.A();

  Ember.run(function() {
    var user = store.createRecord('user/user', {
      id: 'user-1',
      firstName: 'User1',
      lastName: 'Test'
    });
    var performanceData = Ember.A();
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-1@item-1',
        score: 50,
        completionDone: 5,
        completionTotal: 25,
        timeSpent: 1000
      })
    );
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-1@item-2',
        score: 75,
        completionDone: 10,
        completionTotal: 10,
        timeSpent: 500
      })
    );
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-1@item-3',
        score: 25,
        completionDone: 15,
        completionTotal: 20,
        timeSpent: 1500
      })
    );
    studentPerformanceData.pushObject(
      store.createRecord('performance/student-performance', {
        user: user,
        performanceData: performanceData
      })
    );

    user = store.createRecord('user/user', {
      id: 'user-2',
      firstName: 'User2',
      lastName: 'Test'
    });
    performanceData = Ember.A();
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-2@item-1',
        score: 50,
        completionDone: 5,
        completionTotal: 25,
        timeSpent: 1000
      })
    );
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-2@item-2',
        score: 75,
        completionDone: 10,
        completionTotal: 10,
        timeSpent: 500
      })
    );
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-2@item-3',
        score: 50,
        completionDone: 15,
        completionTotal: 20,
        timeSpent: 1500
      })
    );
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-2@item-4',
        score: 25,
        completionDone: 10,
        completionTotal: 30,
        timeSpent: 1000
      })
    );
    studentPerformanceData.pushObject(
      store.createRecord('performance/student-performance', {
        user: user,
        performanceData: performanceData
      })
    );

    user = store.createRecord('user/user', {
      id: 'user-3',
      firstName: 'User3',
      lastName: 'Test'
    });
    performanceData = Ember.A();
    performanceData.pushObject(
      store.createRecord('performance/performance', {
        id: 'user-3@item-1',
        score: 50,
        completionDone: 10,
        completionTotal: 25,
        timeSpent: 1000
      })
    );
    studentPerformanceData.pushObject(
      store.createRecord('performance/student-performance', {
        user: user,
        performanceData: performanceData
      })
    );
  });

  var model = this.subject({
    studentPerformanceData: studentPerformanceData
  });

  assert.equal(model.get('classAverageScore'), 50, 'Wrong class average score');
  assert.equal(
    model.get('classAverageTimeSpent'),
    1000,
    'Wrong class average time spent'
  );
  assert.equal(
    model.get('classSumCompletionDone'),
    80,
    'Wrong class sum completion done'
  );
  assert.equal(
    model.get('classSumCompletionTotal'),
    165,
    'Wrong class sum completion total'
  );
  assert.equal(
    model.calculateAverageScoreByItem('item-1'),
    50,
    'Wrong average score for item-1'
  );
  assert.equal(
    model.calculateAverageScoreByItem('item-4'),
    25,
    'Wrong average score for item-4'
  );
  assert.equal(
    model.calculateAverageTimeSpentByItem('item-1'),
    1000,
    'Wrong average time spent for item-1'
  );
  assert.equal(
    model.calculateAverageTimeSpentByItem('item-4'),
    1000,
    'Wrong average time spent for item-4'
  );
  assert.equal(
    model.calculateSumCompletionDoneByItem('item-2'),
    20,
    'Wrong sum completion done for item-2'
  );
  assert.equal(
    model.calculateSumCompletionDoneByItem('item-4'),
    10,
    'Wrong sum completion done for item-4'
  );
  assert.equal(
    model.calculateSumCompletionTotalByItem('item-1'),
    75,
    'Wrong sum completion done for item-1'
  );
  assert.equal(
    model.calculateSumCompletionTotalByItem('item-3'),
    40,
    'Wrong sum completion done for item-3'
  );
});
