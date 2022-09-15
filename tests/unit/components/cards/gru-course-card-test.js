import Ember from 'ember';
import { test, moduleForComponent } from 'ember-qunit';
import Course from 'gooru-web/models/content/course';

moduleForComponent(
  'cards/gru-course-card',
  'Unit | Component | cards/gru course card',
  {
    integration: false,
    needs: ['service:session']
  }
);

test('previewCourse', function(assert) {
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
    course: course,
    remixCourse: function() {
      return true;
    }
  });

  var expectedModel = Ember.Object.create({
    content: course,
    remixCourse: () => component.remixCourse()
  });

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
  component.send('previewCourse', course);
});
