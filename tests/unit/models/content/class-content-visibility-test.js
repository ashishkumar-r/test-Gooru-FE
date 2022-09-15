import { moduleFor, test } from 'ember-qunit';

moduleFor(
  'model:content/class-content-visibility',
  'Unit | Model | content/class content visibility',
  {
    unit: true
  }
);

test('getAssessments', function(assert) {
  let model = this.subject({
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'on'
                }
              ],
              collections: [
                {
                  id: '781b8add-31a4-4186-912a-31f735180805',
                  visible: 'off'
                },
                {
                  id: '86e5e705-66b0-470a-9ff0-f00472adeb0b',
                  visible: 'on'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  let expectedResult = [
    {
      id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
      visible: 'on'
    },
    {
      id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
      visible: 'on'
    }
  ];
  assert.equal(
    model.getAssessments().length,
    expectedResult.length,
    'Should return a list of assessments'
  );
});
test('findAssessmentVisibilityById', function(assert) {
  let model = this.subject({
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'on'
                }
              ],
              collections: [
                {
                  id: '781b8add-31a4-4186-912a-31f735180805',
                  visible: 'off'
                },
                {
                  id: '86e5e705-66b0-470a-9ff0-f00472adeb0b',
                  visible: 'on'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  let expectedResult = {
    id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
    visible: 'on'
  };
  assert.equal(
    model.findAssessmentVisibilityById('59f7b7df-cef2-4f09-8012-1e58cb27b95a')
      .id,
    expectedResult.id,
    'Wrong Id'
  );
});

test('isVisible when content visibility is not all visible and the assessment is on', function(assert) {
  let model = this.subject({
    contentVisibility: 'visible_collections',
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'off'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27bbbbb',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  assert.equal(
    model.isVisible('59f7b7df-cef2-4f09-8012-1e58cb27bbbbb'),
    true,
    'The assessment should  be visible'
  );
});
test('isVisible when content visibility is not all visible and the assessment is off', function(assert) {
  let model = this.subject({
    contentVisibility: 'visible_collections',
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'off'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27bbbbb',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  assert.equal(
    model.isVisible('59f7b7df-cef2-4f09-8012-1e58cb27b95a'),
    false,
    'The assessment should not be visible'
  );
});
test('isVisible when content visibility is not all visible and the assessment is not on the course visibility', function(assert) {
  let model = this.subject({
    contentVisibility: 'visible_collections'
  });
  assert.equal(
    model.isVisible('59f7b7df-cef2-4f09-8012-1e58cb27b95a'),
    true,
    'The assessment should be visible'
  );
});
test('isVisible when content visibility is all visible and the assessment is on', function(assert) {
  let model = this.subject({
    contentVisibility: 'visible_all',
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'off'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27bbbbb',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  assert.equal(
    model.isVisible('59f7b7df-cef2-4f09-8012-1e58cb27bbbbb'),
    true,
    'The assessment should  be visible'
  );
});
test('isVisible when content visibility is all visible and the assessment is off', function(assert) {
  let model = this.subject({
    contentVisibility: 'visible_all',
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'off'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27bbbbb',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  assert.equal(
    model.isVisible('59f7b7df-cef2-4f09-8012-1e58cb27b95a'),
    false,
    'The assessment should not be visible'
  );
});

test('isVisible when content visibility is all visible and the assessment is not on the course visibility', function(assert) {
  let model = this.subject({
    contentVisibility: 'visible_all'
  });
  assert.equal(
    model.isVisible('59f7b7df-cef2-4f09-8012-1e58cb27b95a'),
    true,
    'The assessment should be visible'
  );
});

test('setAssessmentVisibility', function(assert) {
  let model = this.subject({
    course: {
      id: '2a121dd9-2acd-4db7-8d15-a8e694a95c5a',
      units: [
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
                  visible: 'on'
                }
              ],
              collections: [
                {
                  id: '781b8add-31a4-4186-912a-31f735180805',
                  visible: 'off'
                },
                {
                  id: '86e5e705-66b0-470a-9ff0-f00472adeb0b',
                  visible: 'on'
                }
              ]
            }
          ]
        },
        {
          id: '6354b8ad-2d32-48e8-9588-2883dbd97152test',
          lessons: [
            {
              id: '176a137d-22c8-4e71-826a-39c2592de889test',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  let expectedResult = {
    id: '59f7b7df-cef2-4f09-8012-1e58cb27b95a',
    visible: 'off'
  };
  assert.equal(
    model.setAssessmentVisibility('59f7b7df-cef2-4f09-8012-1e58cb27b95a', 'off')
      .visible,
    expectedResult.visible,
    'Wrong Visibility'
  );
});

test('getTotals', function(assert) {
  let model = this.subject({
    course: {
      id: 'course-1',
      units: [
        {
          id: 'unit-1',
          lessons: [
            {
              id: 'lesson-1-1',
              assessments: [
                {
                  id: 'assessment-1.1.1',
                  visible: 'on'
                }
              ],
              collections: [
                {
                  id: 'collection-1.1.2',
                  visible: 'off'
                },
                {
                  id: 'collection-1.1.3',
                  visible: 'on'
                }
              ]
            },
            {
              id: 'lesson-1-2',
              assessments: [
                {
                  id: 'assessment-1.2.1',
                  visible: 'on'
                },
                {
                  id: 'assessment-1.2.2',
                  visible: 'on'
                }
              ]
            }
          ]
        },
        {
          id: 'unit-2',
          lessons: [
            {
              id: 'lesson-2-1',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });

  const totals = model.getTotals();
  assert.equal(
    totals.get('units.unit-1.assessments'),
    3,
    'Wrong assessments total for unit-1'
  );
  assert.equal(
    totals.get('units.unit-1.collections'),
    2,
    'Wrong collections total for unit-1'
  );
  assert.equal(
    totals.get('units.unit-1.lessons.lesson-1-1.assessments'),
    1,
    'Wrong assessments total for unit-1/lesson-1-1'
  );
  assert.equal(
    totals.get('units.unit-1.lessons.lesson-1-1.collections'),
    2,
    'Wrong collections total for unit-1/lesson-1-1'
  );
  assert.equal(
    totals.get('units.unit-1.lessons.lesson-1-2.assessments'),
    2,
    'Wrong assessments total for unit-1/lesson-1-2'
  );
  assert.equal(
    totals.get('units.unit-1.lessons.lesson-1-2.collections'),
    0,
    'Wrong collections total for unit-1/lesson-1-2'
  );

  assert.equal(
    totals.get('units.unit-2.assessments'),
    1,
    'Wrong assessments total for unit-2'
  );
  assert.equal(
    totals.get('units.unit-2.collections'),
    0,
    'Wrong collections total for unit-2'
  );
  assert.equal(
    totals.get('units.unit-2.lessons.lesson-2-1.assessments'),
    1,
    'Wrong assessments total for unit-2/lesson-2-1'
  );
  assert.equal(
    totals.get('units.unit-2.lessons.lesson-2-1.collections'),
    0,
    'Wrong collections total for unit-2/lesson-2-1'
  );
});

test('getTotalAssessmentsByUnit and getTotalAssessmentsByUnitAndLesson', function(assert) {
  let model = this.subject({
    course: {
      id: 'course-1',
      units: [
        {
          id: 'unit-1',
          lessons: [
            {
              id: 'lesson-1-1',
              assessments: [
                {
                  id: 'assessment-1.1.1',
                  visible: 'on'
                }
              ],
              collections: [
                {
                  id: 'collection-1.1.2',
                  visible: 'off'
                },
                {
                  id: 'collection-1.1.3',
                  visible: 'on'
                }
              ]
            },
            {
              id: 'lesson-1-2',
              assessments: [
                {
                  id: 'assessment-1.2.1',
                  visible: 'on'
                },
                {
                  id: 'assessment-1.2.2',
                  visible: 'on'
                }
              ]
            }
          ]
        },
        {
          id: 'unit-2',
          lessons: [
            {
              id: 'lesson-2-1',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  assert.equal(
    model.getTotalAssessmentsByUnit('unit-1'),
    3,
    'Wrong assessments total for unit-1'
  );
  assert.equal(
    model.getTotalAssessmentsByUnitAndLesson('unit-1', 'lesson-1-1'),
    1,
    'Wrong assessments total for unit-1/lesson-1-1'
  );
  assert.equal(
    model.getTotalAssessmentsByUnitAndLesson('unit-1', 'lesson-1-2'),
    2,
    'Wrong assessments total for unit-1/lesson-1-2'
  );

  assert.equal(
    model.getTotalAssessmentsByUnit('unit-2'),
    1,
    'Wrong assessments total for unit-2'
  );
  assert.equal(
    model.getTotalAssessmentsByUnitAndLesson('unit-2', 'lesson-2-1'),
    1,
    'Wrong assessments total for unit-2/lesson-2-1'
  );
});

test('getTotalCollectionsByUnit and getTotalCollectionsByUnitAndLesson', function(assert) {
  let model = this.subject({
    course: {
      id: 'course-1',
      units: [
        {
          id: 'unit-1',
          lessons: [
            {
              id: 'lesson-1-1',
              assessments: [
                {
                  id: 'assessment-1.1.1',
                  visible: 'on'
                }
              ],
              collections: [
                {
                  id: 'collection-1.1.2',
                  visible: 'off'
                },
                {
                  id: 'collection-1.1.3',
                  visible: 'on'
                }
              ]
            },
            {
              id: 'lesson-1-2',
              assessments: [
                {
                  id: 'assessment-1.2.1',
                  visible: 'on'
                },
                {
                  id: 'assessment-1.2.2',
                  visible: 'on'
                }
              ]
            }
          ]
        },
        {
          id: 'unit-2',
          lessons: [
            {
              id: 'lesson-2-1',
              assessments: [
                {
                  id: '59f7b7df-cef2-4f09-8012-1e58cb27b95atest',
                  visible: 'on'
                }
              ]
            }
          ]
        }
      ]
    }
  });
  assert.equal(
    model.getTotalCollectionsByUnit('unit-1'),
    2,
    'Wrong collections total for unit-1'
  );
  assert.equal(
    model.getTotalCollectionsByUnitAndLesson('unit-1', 'lesson-1-1'),
    2,
    'Wrong collections total for unit-1/lesson-1-1'
  );
  assert.equal(
    model.getTotalCollectionsByUnitAndLesson('unit-1', 'lesson-1-2'),
    0,
    'Wrong collections total for unit-1/lesson-1-2'
  );

  assert.equal(
    model.getTotalCollectionsByUnit('unit-2'),
    0,
    'Wrong collections total for unit-2'
  );
  assert.equal(
    model.getTotalCollectionsByUnitAndLesson('unit-2', 'lesson-2-1'),
    0,
    'Wrong collections total for unit-2/lesson-2-1'
  );
});
