import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';
import { KEY_CODES } from 'gooru-web/config/config';

moduleForAcceptance('Acceptance | Edit Course', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'profile-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Remove Assessment from Lesson', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    assert.equal(currentURL(), '/content/courses/edit/course-123');
    var $unit = find('.content.courses.gru-accordion.gru-accordion-unit:eq(0)');
    click($unit.find('.panel-heading a')); //expand unit
    andThen(function() {
      var $lesson = $unit.find('.gru-accordion-lesson:eq(2)');
      click($lesson.find('.panel-heading a')); //expand lesson
      andThen(function() {
        var $itemContainer = $lesson.find('.accordion-lesson');
        var $removeItemBtn = $itemContainer.find(
          'li:first-child button.remove-item'
        );
        click($removeItemBtn);
        andThen(function() {
          var $removeContentModal = find('.gru-modal .gru-remove-content');
          var $check1 = $removeContentModal.find('ul li:eq(0) input');
          click($check1);
          andThen(function() {
            var $check2 = $removeContentModal.find('ul li:eq(1) input');
            click($check2);
            andThen(function() {
              var $input = $removeContentModal.find('.remove-input');
              $input.val('remove');
              $input.blur();
              keyEvent($input, 'keyup', KEY_CODES.ENTER);
              var $removeBtn = $removeContentModal.find(
                '.remove button.remove'
              );
              andThen(function() {
                click($removeBtn);
                andThen(function() {
                  assert.equal(
                    $itemContainer.find('li').length,
                    1,
                    'Didn\'t remove Assessment from lesson'
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});

skip('Edit course information', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    assert.equal(currentURL(), '/content/courses/edit/course-123');

    var newTitle = 'New Course Name';

    var $container = find('.controller.content.courses.edit');
    var $headerActions = $container.find('#information .header .actions');
    var $content = $container.find('#information .content');

    assert.equal(
      $content.find('.panel-body .gru-audience  > div > div.btn-empty').length,
      0,
      'No audience value selected'
    );

    click($headerActions.find('button.edit'));
    andThen(function() {
      var $contentPanel = $content.find('.panel-body');
      var $title = $contentPanel.find('.title input');

      // Change title
      fillIn($title, newTitle);
      // validation.gru-input updates on focus-out
      triggerEvent($title, 'blur');

      // Open audience menu
      $contentPanel.find('.gru-audience button.dropdown-toggle').click();
      click(
        $contentPanel.find(
          '.gru-audience .dropdown-menu li:eq(0) input[type="checkbox"]'
        )
      );
      click($headerActions.find('button.save'));
      andThen(function() {
        assert.equal(
          $contentPanel.find('.title b').text(),
          newTitle,
          'Course title updated'
        );
        // TODO: add support for saving audience
        // assert.equal($contentPanel.find('.gru-audience  > div > div.btn-empty').length, 1, 'Audience value updated');
      });
    });
  });
});

skip('Click share button and check clipboard functionality', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    assert.equal(currentURL(), '/content/courses/edit/course-123');
    var $shareButton = find('.gru-share-pop-over');

    click($shareButton);
    andThen(function() {
      var $popOverContent = find('.gru-share-pop-over-content');

      T.exists(assert, $popOverContent.find('p'), 'Missing share description');
      T.exists(
        assert,
        $popOverContent.find('.share-actions #course-popover-input'),
        'Missing readonly input'
      );
      var $copyBtn = $popOverContent.find('.share-actions .copy-btn');
      T.exists(assert, $copyBtn, 'Missing copy button');
    });
  });
});

skip('Delete unit', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    assert.equal(currentURL(), '/content/courses/edit/course-123');
    assert.equal(find('.gru-accordion-unit').length, 4, 'Should have 4 units');
    var $unit = find('.gru-accordion-unit:eq(0)');
    var $deleteButton = $unit.find('.item-actions .delete-item');
    click($deleteButton);
    andThen(function() {
      var $deleteContentModal = find('.gru-modal .gru-delete-content');
      var $check1 = $deleteContentModal.find('ul li:eq(0) input');
      click($check1);
      andThen(function() {
        var $check2 = $deleteContentModal.find('ul li:eq(1) input');
        click($check2);
        andThen(function() {
          var $check3 = $deleteContentModal.find('ul li:eq(2) input');
          click($check3);
          andThen(function() {
            var $input = $deleteContentModal.find('.delete-input');
            $input.val('delete');
            $input.blur();
            keyEvent($input, 'keyup', KEY_CODES.ENTER);
            andThen(function() {
              var $deleteButton = $deleteContentModal.find('button.delete');
              click($deleteButton);
              andThen(function() {
                assert.equal(
                  find('.gru-accordion-unit').length,
                  3,
                  'Should have 3 units'
                );
              });
            });
          });
        });
      });
    });
  });
});

skip('Delete lesson', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    assert.equal(currentURL(), '/content/courses/edit/course-123');
    var $unit = find('.content.courses.gru-accordion.gru-accordion-unit:eq(0)');
    click($unit.find('.panel-heading a')); //expand unit
    andThen(function() {
      assert.equal(
        find('.gru-accordion-lesson').length,
        3,
        'Should have 3 lesson'
      );
      var $lesson = find('.gru-accordion-lesson:eq(0)');
      var $deleteButton = $lesson.find('.item-actions .delete-item');
      click($deleteButton);
      andThen(function() {
        var $deleteContentModal = find('.gru-modal .gru-delete-content');
        var $check1 = $deleteContentModal.find('ul li:eq(0) input');
        click($check1);
        andThen(function() {
          var $check2 = $deleteContentModal.find('ul li:eq(1) input');
          click($check2);
          andThen(function() {
            var $check3 = $deleteContentModal.find('ul li:eq(2) input');
            click($check3);
            andThen(function() {
              var $input = $deleteContentModal.find('.delete-input');
              $input.val('delete');
              $input.blur();
              keyEvent($input, 'keyup', KEY_CODES.ENTER);
              andThen(function() {
                var $deleteButton = $deleteContentModal.find('button.delete');
                click($deleteButton);
                andThen(function() {
                  assert.equal(
                    find('.gru-accordion-lesson').length,
                    2,
                    'Should have 2 lessons'
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});

skip('Delete collection', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    assert.equal(currentURL(), '/content/courses/edit/course-123');
    var $unit = find('.content.courses.gru-accordion.gru-accordion-unit:eq(0)');
    click($unit.find('.panel-heading a')); //expand unit
    andThen(function() {
      var $lesson = find('.gru-accordion-lesson:eq(2) .panel a');
      click($lesson);
      andThen(function() {
        assert.equal(
          find('.gru-accordion-lesson-item').length,
          2,
          'Should have 2 lesson items'
        );
        var $deleteButton = find(
          '.gru-accordion-lesson-item:eq(1) .item-actions .delete-item'
        );
        click($deleteButton);
        andThen(function() {
          var $deleteContentModal = find('.gru-modal .gru-delete-content');
          var $check1 = $deleteContentModal.find('ul li:eq(0) input');
          click($check1);
          andThen(function() {
            var $check2 = $deleteContentModal.find('ul li:eq(1) input');
            click($check2);
            andThen(function() {
              var $check3 = $deleteContentModal.find('ul li:eq(2) input');
              click($check3);
              andThen(function() {
                var $input = $deleteContentModal.find('.delete-input');
                $input.val('delete');
                $input.blur();
                keyEvent($input, 'keyup', KEY_CODES.ENTER);
                andThen(function() {
                  var $deleteButton = $deleteContentModal.find('button.delete');
                  click($deleteButton);
                  andThen(function() {
                    assert.equal(
                      find('.gru-accordion-lesson-item').length,
                      1,
                      'Should have 1 lesson item'
                    );
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

skip('Delete assessment', function(assert) {
  visit('/content/courses/edit/course-123');

  andThen(function() {
    var $unit = find('.content.courses.gru-accordion.gru-accordion-unit:eq(0)');
    click($unit.find('.panel-heading a')); //expand unit
    andThen(function() {
      var $lesson = find('.gru-accordion-lesson:eq(2) .panel a');
      click($lesson);
      andThen(function() {
        assert.equal(
          find('.gru-accordion-lesson-item').length,
          2,
          'Should have 2 lesson items'
        );
        var $deleteButton = find(
          '.gru-accordion-lesson-item:eq(0) .item-actions .delete-item'
        );
        click($deleteButton);
        andThen(function() {
          var $deleteContentModal = find('.gru-modal .gru-delete-content');
          var $check1 = $deleteContentModal.find('ul li:eq(0) input');
          click($check1);
          andThen(function() {
            var $check2 = $deleteContentModal.find('ul li:eq(1) input');
            click($check2);
            andThen(function() {
              var $check3 = $deleteContentModal.find('ul li:eq(2) input');
              click($check3);
              andThen(function() {
                var $input = $deleteContentModal.find('.delete-input');
                $input.val('delete');
                $input.blur();
                keyEvent($input, 'keyup', KEY_CODES.ENTER);
                andThen(function() {
                  var $deleteButton = $deleteContentModal.find('button.delete');
                  click($deleteButton);
                  andThen(function() {
                    assert.equal(
                      find('.gru-accordion-lesson-item').length,
                      1,
                      'Should have 1 lesson item'
                    );
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

skip('Delete resource', function(assert) {
  visit(
    '/content/collections/edit/all-resource-types-collection-id?courseId=course-123'
  );

  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/collections/edit/all-resource-types-collection-id?courseId=course-123'
    );
    andThen(function() {
      var $deleteButton = find(
        '.gru-collection-list-item:eq(0) .item-actions .delete-item'
      );
      click($deleteButton);
      andThen(function() {
        var $deleteContentModal = find('.gru-modal .gru-quick-remove-content');
        const total = find('.gru-collection-list-item').length;
        var $removeButton = $deleteContentModal.find('button.remove');
        click($removeButton);
        andThen(function() {
          assert.equal(
            find('.gru-collection-list-item').length,
            total - 1,
            'Should have one collection item less'
          );
        });
      });
    });
  });
});

skip('Delete question from collection', function(assert) {
  visit(
    '/content/collections/edit/all-resource-types-collection-id?courseId=course-123'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/collections/edit/all-resource-types-collection-id?courseId=course-123'
    );
    var $deleteButton = find(
      '.gru-collection-list-item:eq(6) .item-actions .delete-item'
    );
    click($deleteButton);
    andThen(function() {
      var $deleteContentModal = find('.gru-modal .gru-quick-delete-content');
      const total = find('.gru-collection-list-item').length;
      var $deleteButton = $deleteContentModal.find('button.delete');
      click($deleteButton);
      andThen(function() {
        assert.equal(
          find('.gru-collection-list-item').length,
          total - 1,
          'Should have 1 collection item less'
        );
      });
    });
  });
});

skip('Delete question from assessment', function(assert) {
  visit(
    '/content/assessments/edit/all-question-types-assessment-id?courseId=course-123'
  );

  andThen(function() {
    assert.equal(
      currentURL(),
      '/content/assessments/edit/all-question-types-assessment-id?courseId=course-123'
    );
    var $deleteButton = find(
      '.gru-collection-list-item:eq(0) .item-actions .delete-item'
    );
    click($deleteButton);
    andThen(function() {
      var $deleteContentModal = find('.gru-modal .gru-quick-delete-content');
      const total = find('.gru-collection-list-item').length;
      var $deleteButton = $deleteContentModal.find('button.delete');
      click($deleteButton);
      andThen(function() {
        assert.equal(
          find('.gru-collection-list-item').length,
          total - 1,
          'Should have 1 collection item less'
        );
      });
    });
  });
});
