import Ember from 'ember';
import { getGradeColor } from 'gooru-web/utils/utils';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['rubric-category-container'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains the state of the read or write mode.
   * @type {Boolean}
   */
  isReadOnly: false,

  /**
   * Maintains the rubric categories and sort score by asc.
   * @type {Boolean}
   */
  rubricCategories: Ember.computed('categories', function() {
    let component = this;
    let categories = component.get('categories');
    if (categories) {
      categories.map(category => {
        let levels = category.get('levels').sortBy('score');
        levels.map((level, index) => {
          let score =
            index > 0 ? index * Math.floor(100 / (levels.length - 1)) : 10;
          level.set('scoreInPrecentage', score);
        });
        category.set('levels', levels);
      });
      return categories;
    }
  }),

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is after rendered
   */
  didRender() {
    let component = this;
    component.setupTooltip();
    if (component.get('isReadOnly')) {
      component.disableClickEvent();
    }
  },

  actions: {
    /**
     * Action get triggered when comment icon got toggle.
     */
    onShowAddCommentBox(categoryIndex) {
      let component = this;
      let element = component.$(`#grade-rubric-category-${categoryIndex}`);
      if (element.hasClass('comment-active')) {
        element.find('.grade-comment-section').slideUp(400, function() {
          element.removeClass('comment-active');
        });
      } else {
        element.find('.grade-comment-section').slideDown(400, function() {
          element.addClass('comment-active');
        });
      }
    },

    /**
     * Action triggered when clear the category level choosen
     * @param  {Object} category
     */
    unSelectCategoryLevel(category) {
      category.set('scoreInPrecentage', null);
      let levels = category.get('levels');
      if (levels && levels.length > 0) {
        levels.findBy('selected', true).set('selected', false);
      }
      category.set('selected', false);
    }
  },

  disableClickEvent() {
    let component = this;
    component.$('.grade-info-popover').off('click');
  },

  setupTooltip() {
    let component = this;
    let categories = component.get('rubricCategories');
    component.$('.grade-info-popover').popover({
      placement: 'top auto',
      container: 'body',
      trigger: 'manual'
    });
    let isMobile = window.matchMedia('only screen and (max-width: 768px)');

    component.$('.grade-info-popover').on('click', function() {
      let levelIndex = component.$(this).data('level');
      let categoryIndex = component.$(this).data('category');
      let category = categories.objectAt(categoryIndex);
      let level = category.get('levels').objectAt(levelIndex);
      category.get('levels').map(level => {
        level.set('selected', false);
      });
      level.set('selected', true);
      category.set('scoreInPrecentage', level.get('scoreInPrecentage'));
      category.set('selected', true);
      if (isMobile.matches) {
        component
          .$('.grade-info-popover')
          .not(this)
          .popover('hide');
        component.$(this).popover('show');
        Ember.$('.popover-title').css(
          'background-color',
          getGradeColor(level.get('scoreInPrecentage'))
        );
      }
    });

    if (!isMobile.matches) {
      component.$('.grade-info-popover').on('mouseleave', function() {
        $(this).popover('hide');
      });
      component.$('.grade-info-popover').on('mouseenter', function() {
        let levelIndex = component.$(this).data('level');
        let categoryIndex = component.$(this).data('category');
        let category = categories.objectAt(categoryIndex);
        let totalPoints = category.get('totalPoints');
        let level = category.get('levels').objectAt(levelIndex);
        $(this).popover('show');
        if (category.get('allowsScoring')) {
          let scoreInPrecentage = Math.floor(
            (level.get('score') / totalPoints) * 100
          );
          Ember.$('.popover-title').css(
            'background-color',
            getGradeColor(scoreInPrecentage)
          );
        } else {
          Ember.$('.popover-title').hide();
        }
      });
    }
  }
});
