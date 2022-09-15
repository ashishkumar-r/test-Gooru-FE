import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'cards/gru-course-card',
  'Integration | Component | cards/gru course card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Course Card Layout', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    description: 'Water cycle description',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false,
    originalCreatorId: 'some-id',
    owner: Ember.Object.create({
      id: 'some-id'
    }),
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_3@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ]),
    taxonomy: Ember.A([
      Ember.Object.create({
        code: 'NGSS.K12.SC-HS2',
        frameworkCode: 'NGSS2',
        id: 'NGSS.K12.SC-HS2',
        parentTitle: 'Science',
        taxonomyLevel: 'course',
        title: 'High School'
      }),
      Ember.Object.create({
        code: 'NGSS.K12.SC-HS',
        frameworkCode: 'NGSS',
        id: 'NGSS.K12.SC-HS',
        parentTitle: 'Science',
        taxonomyLevel: 'course',
        title: 'High School'
      })
    ])
  });

  this.set('course', course);
  assert.expect(16);
  this.render(hbs`{{cards/gru-course-card course=course}}`);

  var $component = this.$(); //component dom element
  const $courseCard = $component.find('.gru-course-card');
  const $cardHeader = $courseCard.find('.card-header');
  const $cardContent = $courseCard.find('.card-content');

  T.exists(assert, $courseCard, 'Missing course card section');
  T.exists(assert, $cardHeader, 'Missing card-header section');
  T.exists(assert, $cardContent, 'Missing card-content section');

  T.exists(
    assert,
    $cardHeader.find('.image-container'),
    'Missing course image'
  );
  T.exists(
    assert,
    $cardHeader.find('.course-title'),
    'Missing course card title'
  );
  T.exists(assert, $cardHeader.find('.total-units'), 'Missing total units');
  T.exists(assert, $cardHeader.find('.subject'), 'Missing subject');
  T.exists(assert, $cardHeader.find('.icon.public'), 'Missing public icon');
  T.exists(assert, $cardHeader.find('.created'), 'Missing Created By');
  T.exists(assert, $cardHeader.find('.users-teaser'), 'Missing users teaser');

  T.exists(
    assert,
    $cardContent.find('.taxonomy-standards'),
    'Missing taxonomy standards teaser'
  );
  assert.equal(
    $cardContent.find('.taxonomy-standards .gru-taxonomy-tag').length,
    2,
    'Wrong taxonomy elements'
  );
  T.exists(
    assert,
    $cardContent.find('.course-description'),
    'Missing course description'
  );
  T.exists(
    assert,
    $cardContent.find('.actions .remix-button  button'),
    'Missing remix button'
  );
  T.notExists(
    assert,
    $cardContent.find('.actions .play-button  button'),
    'Play button should not appear'
  );
  T.exists(
    assert,
    $cardContent.find('.visibility .gru-icon'),
    'Missing visibility icon'
  );
});

test('Course Card Private', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: false,
    isVisibleOnProfile: false,
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ])
  });

  this.set('course', course);
  assert.expect(2);
  this.render(hbs`{{cards/gru-course-card course=course}}`);

  var $component = this.$(); //component dom element
  const $courseCard = $component.find('.gru-course-card');
  T.notExists(assert, $courseCard.find('.icon'), 'Icon should not appear');
  T.notExists(
    assert,
    $courseCard.find('.remix-button  button'),
    'Remix Button should not appear'
  );
});

test('Course Card Layout Owner and Public', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false,
    originalCreatorId: 'some-id',
    owner: Ember.Object.create({
      id: 'some-other-id'
    }),
    isRemixed: true,
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ])
  });

  this.set('course', course);
  assert.expect(9);
  this.render(
    hbs`{{cards/gru-course-card course=course isOwner=true isEditEnabled=true}}`
  );

  var $component = this.$(); //component dom element
  const $courseCard = $component.find('.gru-course-card');
  T.exists(assert, $courseCard, 'Missing course card section');
  T.exists(
    assert,
    $courseCard.find('.course-title'),
    'Missing course card title'
  );
  T.exists(assert, $courseCard.find('.total-units'), 'Missing total units');
  T.exists(assert, $courseCard.find('.subject'), 'Missing subject');
  T.exists(assert, $courseCard.find('.icon.public'), 'Missing public icon');
  T.exists(
    assert,
    $courseCard.find('.visibility  .gru-icon'),
    'Missing visibility icon'
  );
  T.exists(assert, $courseCard.find('.remixed'), 'Missing Remixed By');
  T.exists(assert, $courseCard.find('.users-teaser'), 'Missing users teaser');
  T.exists(
    assert,
    $courseCard.find('.edit-button  button'),
    'Missing edit button'
  );
});

test('Course Card Layout Owner and Private', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: false,
    isVisibleOnProfile: true,
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ])
  });

  this.set('course', course);
  assert.expect(9);
  this.render(
    hbs`{{cards/gru-course-card course=course isOwner=true isEditEnabled=true}}`
  );

  var $component = this.$(); //component dom element
  const $courseCard = $component.find('.gru-course-card');
  T.exists(assert, $courseCard, 'Missing course card section');
  T.exists(
    assert,
    $courseCard.find('.course-title'),
    'Missing course card title'
  );
  T.exists(assert, $courseCard.find('.total-units'), 'Missing total units');
  T.exists(assert, $courseCard.find('.subject'), 'Missing subject');
  T.notExists(assert, $courseCard.find('.icon .public'), 'Missing public icon');
  T.exists(assert, $courseCard.find('.users-teaser'), 'Missing users teaser');
  T.exists(
    assert,
    $courseCard.find('.edit-button  button'),
    'Missing edit button'
  );
  T.exists(
    assert,
    $courseCard.find('.play-button  button'),
    'Missing play button'
  );
  T.notExists(
    assert,
    $courseCard.find('.visibility  .gru-icon'),
    'Missing visibility icon'
  );
});

test('Click Edit', function(assert) {
  var course = Ember.Object.create({
    id: '1',
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false,
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ])
  });

  this.set('course', course);
  assert.expect(1);

  this.on('editCourse', function(course) {
    assert.equal(course.get('id'), '1', 'Wrong course id');
  });

  this.render(
    hbs`{{cards/gru-course-card course=course isOwner=true isEditEnabled=true onEditCourse='editCourse'}}`
  );
  var $component = this.$(); //component dom element
  var $editButton = $component.find('.edit-button button');
  $editButton.click();
});

test('Click Play', function(assert) {
  var course = Ember.Object.create({
    id: '1',
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false,
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ])
  });

  this.set('course', course);
  assert.expect(1);

  this.on('playCourse', function(course) {
    assert.equal(course.get('id'), '1', 'Wrong course id');
  });

  this.render(
    hbs`{{cards/gru-course-card course=course isOwner=true isEditEnabled=true onPlayCourse='playCourse'}}`
  );
  var $component = this.$(); //component dom element
  var $playButton = $component.find('.play-button button');
  $playButton.click();
});

test('Course Card Unit Count with total 1', function(assert) {
  var course = Ember.Object.create({
    id: '1',
    title: 'Water cycle',
    unitCount: 1,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false
  });

  this.set('course', course);
  assert.expect(1);

  this.render(hbs`{{cards/gru-course-card course=course isOwner=true}}`);
  var $component = this.$(); //component dom element
  var $unit = $component.find('.total-units');
  assert.equal(T.text($unit), '1 Unit');
});

test('Course Card Unit Count more than one', function(assert) {
  var course = Ember.Object.create({
    id: '1',
    title: 'Water cycle',
    unitCount: 2,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false
  });

  this.set('course', course);
  assert.expect(1);

  this.render(hbs`{{cards/gru-course-card course=course isOwner=true}}`);
  var $component = this.$(); //component dom element
  var $unit = $component.find('.total-units');
  assert.equal(T.text($unit), '2 Units');
});

test('Course Card Unit Count zero', function(assert) {
  var course = Ember.Object.create({
    id: '1',
    title: 'Water cycle',
    unitCount: null,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: true,
    isVisibleOnProfile: false
  });

  this.set('course', course);
  assert.expect(1);

  this.render(hbs`{{cards/gru-course-card course=course isOwner=true}}`);
  var $component = this.$(); //component dom element
  var $unit = $component.find('.total-units');
  assert.equal(T.text($unit), '0 Units');
});

test('Course Card Layout not show taxonomies', function(assert) {
  var course = Ember.Object.create({
    title: 'Water cycle',
    totalUnits: 8,
    subjects: ['Science'],
    imageUrl: 'assets/gooru/profile.png',
    isPublished: false,
    isVisibleOnProfile: true,
    remixedBy: Ember.A([
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-1',
        fullName: 'lastname-1 firstname-1',
        id: 'id-1',
        lastName: 'lastname-1',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-1'
      }),
      Ember.Object.create({
        email: 'user_2@test.com',
        firstName: 'firstname-2',
        fullName: 'lastname-2 firstname-2',
        id: 'id-2',
        lastName: 'lastname-2',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-2'
      }),
      Ember.Object.create({
        email: 'user_1@test.com',
        firstName: 'firstname-3',
        fullName: 'lastname-3 firstname-3',
        id: 'id-1',
        lastName: 'lastname-3',
        avatarUrl: 'assets/gooru/profile.png',
        username: 'username-3'
      })
    ])
  });

  this.set('course', course);
  assert.expect(1);
  this.render(hbs`{{cards/gru-course-card course=course showTaxonomy=false}}`);

  var $component = this.$(); //component dom element
  const $cardContent = $component.find('.card-content');

  T.notExists(
    assert,
    $cardContent.find('.taxonomy-standards'),
    'taxonomy standards should not be visible'
  );
});
