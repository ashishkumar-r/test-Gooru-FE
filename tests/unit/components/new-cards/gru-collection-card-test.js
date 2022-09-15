import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import Course from 'gooru-web/models/content/course';
import Collection from 'gooru-web/models/content/collection';
import Assessment from 'gooru-web/models/content/assessment';

moduleForComponent(
  'new-cards/gru-collection-card',
  'Unit | Component | new-cards/gru collection card',
  {
    integration: false,
    needs: [
      'service:session',
      'service:api-sdk/assessment',
      'service:api-sdk/collection',
      'service:api-sdk/course'
    ]
  }
);

test('disabledBookmark', function(assert) {
  let component = this.subject({
    session: {
      isAnonymous: false
    },
    isTeacher: false
  });
  assert.notOk(
    component.get('disabledBookmark'),
    'Wrong value of disabled bookmark'
  );

  component.set('isTeacher', true);
  assert.ok(
    component.get('disabledBookmark'),
    'Wrong value of disabled bookmark'
  );

  component.set('isTeacher', false);
  component.set('session.isAnonymous', true);
  assert.ok(
    component.get('disabledBookmark'),
    'Wrong value of disabled bookmark'
  );
});

test('previewContent - Course', function(assert) {
  let component = this.subject({
    courseService: {
      fetchById: courseId => {
        assert.equal(courseId, '123', 'Course id should match');
        return Ember.RSVP.resolve(
          Course.create(Ember.getOwner(this).ownerInjection(), {
            id: '123',
            children: [
              Ember.Object.create({
                id: 'unit-123',
                sequence: 1,
                title: 'Unit Title A'
              }),
              Ember.Object.create({
                id: 'unit-456',
                sequence: 2,
                title: 'Unit Title B'
              })
            ]
          })
        );
      }
    },
    remixCourse: function() {
      return true;
    }
  });

  let course = Course.create(Ember.getOwner(this).ownerInjection(), {
    id: '123',
    title: 'Course Title',
    subject: 'CCSS.K12.Math',
    category: 'k_12',
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    useCase: 'Use Case',
    taxonomy: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    children: [
      Ember.Object.create({
        id: 'unit-123',
        sequence: 1,
        title: 'Unit Title A'
      }),
      Ember.Object.create({
        id: 'unit-456',
        sequence: 2,
        title: 'Unit Title B'
      })
    ]
  });
  var expectedModel = Ember.Object.create({
    content: course,
    remixCourse: () => component.remixCourse()
  });

  component.set('isCourse', true);

  component.set('isTeacher', true);

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.deepEqual(
      model.remixCourse(),
      expectedModel.remixCourse(),
      'Model function should match'
    );
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.equal(
      componentName,
      'gru-preview-course',
      'Component name should match'
    );
    done();
  });
  component.send('previewContent', course);
});

test('previewContent - Collection', function(assert) {
  let component = this.subject({
    collectionService: {
      readCollection: collectionId => {
        assert.equal(
          collectionId,
          'collection-123',
          'Collection id should match'
        );
        return Ember.RSVP.resolve(
          Collection.create(Ember.getOwner(this).ownerInjection(), {
            id: 'collection-123',
            children: [
              Ember.Object.create({
                id: 'unit-123',
                sequence: 1,
                title: 'Unit Title A'
              }),
              Ember.Object.create({
                id: 'unit-456',
                sequence: 2,
                title: 'Unit Title B'
              })
            ]
          })
        );
      }
    },
    remixCollection: function() {
      return true;
    }
  });

  let collection = Collection.create({
    id: 'collection-123',
    title: 'Collection Title',
    questionCount: 4,
    isCollection: true,
    standards: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  var expectedModel = Ember.Object.create({
    content: collection,
    remixCollection: () => component.remixCollection()
  });

  component.set('isCourse', false);

  component.set('isTeacher', true);

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.deepEqual(
      model.remixCollection(),
      expectedModel.remixCollection(),
      'Model function should match'
    );
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.equal(
      componentName,
      'gru-preview-collection',
      'Component name should match'
    );
    done();
  });
  component.send('previewContent', collection);
});

test('previewContent - Assessment', function(assert) {
  let component = this.subject({
    assessmentService: {
      readAssessment: assessmentId => {
        assert.equal(
          assessmentId,
          'assessment-123',
          'Assessment id should match'
        );
        return Ember.RSVP.resolve(
          Assessment.create(Ember.getOwner(this).ownerInjection(), {
            id: 'collection-123',
            children: [
              Ember.Object.create({
                id: 'unit-123',
                sequence: 1,
                title: 'Unit Title A'
              }),
              Ember.Object.create({
                id: 'unit-456',
                sequence: 2,
                title: 'Unit Title B'
              })
            ]
          })
        );
      }
    },
    remixCollection: function() {
      return true;
    }
  });

  let assessment = Assessment.create({
    id: 'assessment-123',
    title: 'Assessment Title',
    questionCount: 4,
    isAssessment: true,
    isCollection: false,
    standards: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  var expectedModel = Ember.Object.create({
    content: assessment,
    remixCollection: () => component.remixCollection()
  });

  component.set('isCourse', false);

  component.set('isTeacher', true);

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.deepEqual(
      model.remixCollection(),
      expectedModel.remixCollection(),
      'Model function should match'
    );
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.equal(
      componentName,
      'gru-preview-collection',
      'Component name should match'
    );
    done();
  });
  component.send('previewContent', assessment);
});

test('addToClassroom - Collection', function(assert) {
  let collection = Ember.Object.create({
    id: 'collection-123',
    title: 'Collection Title',
    questionCount: 4,
    isCollection: true,
    standards: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  let component = this.subject({
    classroomList: [Ember.Object.create({ id: 'class1', title: 'class-1' })],
    content: collection
  });

  var expectedModel = Ember.Object.create({
    classroomList: [
      Ember.Object.create({ id: 'class1', title: 'class-1', studentCount: 0 })
    ],
    classActivity: true,
    content: collection
  });

  component.set('isCourse', false);

  component.set('isTeacher', true);

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.deepEqual(
      model.classroomList,
      expectedModel.classroomList,
      'Incorrect classroom list'
    );
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.equal(
      componentName,
      'content.modals.gru-add-to-classroom',
      'Component name should match'
    );
    assert.notOk(model.callback, 'Should not have Callback');
    done();
  });
  component.send('addToClassroom');
});

test('addToClassroom - Assessment', function(assert) {
  let assessment = Ember.Object.create({
    id: 'assessment-123',
    title: 'Assessment Title',
    questionCount: 4,
    isAssessment: true,
    isCollection: false,
    standards: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    course: 'Any course title',
    remixedBy: ['James', 'Andrea', 'Patric'],
    isVisibleOnProfile: false
  });

  let component = this.subject({
    classroomList: [Ember.Object.create({ id: 'class1', title: 'class-1' })],
    content: assessment
  });

  var expectedModel = Ember.Object.create({
    classroomList: [
      Ember.Object.create({ id: 'class1', title: 'class-1', studentCount: 0 })
    ],
    classActivity: true,
    content: assessment
  });

  component.set('isCourse', false);

  component.set('isTeacher', true);

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.deepEqual(
      model.classroomList,
      expectedModel.classroomList,
      'Incorrect classroom list'
    );
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.equal(
      componentName,
      'content.modals.gru-add-to-classroom',
      'Component name should match'
    );
    assert.notOk(model.callback, 'Should not have Callback');
    done();
  });
  component.send('addToClassroom');
});

test('addToClassroom - Course', function(assert) {
  let course = Course.create(Ember.getOwner(this).ownerInjection(), {
    id: '123',
    title: 'Course Title',
    subject: 'CCSS.K12.Math',
    category: 'k_12',
    owner: Ember.Object.create({
      id: 'owner-id',
      username: 'dara.weiner',
      avatarUrl: 'avatar-url'
    }),
    useCase: 'Use Case',
    taxonomy: Ember.A([
      Ember.Object.create({
        description:
          'Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error.',
        code: 'CCSS.Math.Content.7.RP.A.3'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      }),
      Ember.Object.create({
        description:
          'Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10.',
        code: 'CCSS.Math.Content.5.NBT.A.2'
      })
    ]),
    children: [
      Ember.Object.create({
        id: 'unit-123',
        sequence: 1,
        title: 'Unit Title A'
      }),
      Ember.Object.create({
        id: 'unit-456',
        sequence: 2,
        title: 'Unit Title B'
      })
    ]
  });

  let component = this.subject({
    classroomList: [Ember.Object.create({ id: 'class1', title: 'class-1' })],
    content: course
  });

  var expectedModel = Ember.Object.create({
    classroomList: [
      Ember.Object.create({ id: 'class1', title: 'class-1', studentCount: 0 })
    ],
    classActivity: false,
    content: course
  });

  component.set('isCourse', true);

  component.set('isTeacher', true);

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.deepEqual(
      model.classroomList,
      expectedModel.classroomList,
      'Incorrect classroom list'
    );
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.ok(model.callback.success, 'Missing Callback');
    assert.equal(
      componentName,
      'content.modals.gru-add-to-classroom',
      'Component name should match'
    );
    done();
  });
  component.send('addToClassroom');
});
