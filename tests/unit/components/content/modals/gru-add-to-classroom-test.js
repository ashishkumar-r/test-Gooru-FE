import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';
import Collection from 'gooru-web/models/content/collection';
import Course from 'gooru-web/models/content/course';

moduleForComponent(
  'content/modals/gru-add-to-classroom',
  'Unit | Component | content/modals/ gru add to classroom',
  {
    integration: false,
    needs: ['service:api-sdk/class-activity', 'service:api-sdk/class']
  }
);

test('selectClassroom', function(assert) {
  let component = this.subject({});
  assert.notOk(
    component.get('selectedClassroom'),
    'Wrong value of non selected classroom'
  );

  component.send('selectClassroom', 'class');
  assert.equal(
    component.get('selectedClassroom'),
    'class',
    'Incorrect selected class'
  );
});

test('addTo - Daily Class Activities', function(assert) {
  let collection = Collection.create({
    id: 'collection-id',
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
    classActivityService: {
      addActivityToClass: (
        classId,
        contentId,
        contentType,
        addedDate,
        context
      ) => {
        assert.equal(classId, 'class-id', 'Class id should match');
        assert.equal(contentId, 'collection-id', 'Collection id should match');
        assert.equal(contentType, 'collection', 'Should be a collection');
        assert.equal(
          addedDate,
          moment().format('YYYY-MM-DD'),
          'Should be current date'
        );
        assert.equal(context, null, 'Should not have context');
        return Ember.RSVP.resolve({});
      }
    },
    model: {
      content: collection,
      classActivity: true
    },
    selectedClassroom: Ember.Object.create({ id: 'class-id' })
  });

  component.send('addTo');
});

test('addTo - Classroom', function(assert) {
  let course = Course.create(Ember.getOwner(this).ownerInjection(), {
    id: 'course-123',
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
  var done = assert.async();
  let component = this.subject({
    classService: {
      associateCourseToClass: (contentId, classId) => {
        assert.equal(classId, 'class-id', 'Class id should match');
        assert.equal(contentId, 'course-123', 'Course id should match');
        return Ember.RSVP.resolve({});
      }
    },
    model: {
      content: course,
      classActivity: false,
      callback: {
        success: () => {
          assert.ok(true, 'Callback should be call');
          done();
        }
      }
    },
    selectedClassroom: Ember.Object.create({ id: 'class-id' })
  });

  component.send('addTo');
});
