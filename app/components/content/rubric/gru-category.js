import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'rubric', 'gru-category'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Enable edit inline
     */
    editInline: function() {
      this.showInlinePanel();
    },

    /**
     * show category information
     */
    showInfo: function() {
      this.toggleProperty('isPanelExpanded');
    },

    /**
     * Cancel edit inline
     */
    cancel: function() {
      let component = this;
      let category = component.get('category');
      if (category.get('isNew') && !category.get('title')) {
        component.sendAction('onCancelNewCategory', category);
      }
      this.setProperties({
        isPanelExpanded: false,
        isEditingInline: false
      });
      component.clearErrorMessages();
    },
    /**
     *Copy category
     */
    copyCategory: function(category, index) {
      this.sendAction('onCopyCategory', category, index);
    },
    /**
     *Delete a category
     */
    deleteCategory: function(category) {
      this.sendAction('onDeleteCategory', category);
    },
    /**
     *Set if feedback is required
     */
    setFeedBack: function() {
      this.set(
        'category.requiresFeedback',
        !this.get('category.requiresFeedback')
      );
    },
    /**
     *Save category
     */
    saveCategory: function() {
      const component = this;
      component.clearErrorMessages();
      let tempCategory = component.get('tempCategory');

      tempCategory.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          if (component.validateLevels(tempCategory)) {
            let category = component.get('category');
            category.setProperties(tempCategory);
            component.sendAction('onUpdateCategory', category);
            component.setProperties({
              isPanelExpanded: false,
              isEditingInline: false
            });
          }
        }
      });
    }
  },
  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    this._super(...arguments);
    const component = this;
    // Adds tooltip to UI elements (elements with attribute 'data-toggle')
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });

    //Determinate if the device where the component is showing is a touch device in order to deactivate the tooltips
    var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0;
    if (isTouch) {
      component.$('.actions .item-actions button').tooltip('disable');
    }

    if (!this.get('category.title')) {
      component.showInlinePanel();
    }
  },
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Category} category
   */
  category: null,
  /**
   * @property {Boolean} isEditingInline
   */
  isEditingInline: false,

  /**
   * @property {Boolean} isPanelExpanded
   */
  isPanelExpanded: false,

  /**
   * @property {Boolean} preview
   */
  preview: false,

  /**
   * Copy of the category used for editing.
   * @property {Category}
   */
  tempCategory: null,

  /**
   * Action to send when save is clicked
   * @property {String}
   */
  onUpdateCategory: null,

  /**
   * @property {boolean} Show if the category has levels
   */
  hasLevels: Ember.computed('category.levels[]', function() {
    return this.get('category.levels.length') > 0 || false;
  }),

  /**
   * @property {Boolean} showNoLevelsError
   */
  showNoLevelsError: false,

  // -------------------------------------------------------------------------
  // Events
  /**
   * Initialize tempCategory by coping it from source of category object.
   */
  init() {
    this._super(...arguments);
    let tempCategory = this.get('category').copy();
    this.set('tempCategory', tempCategory);
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Show Inline Edit Panel
   */
  showInlinePanel: function() {
    var modelForEditing = this.get('category').copy();
    this.setProperties({
      tempCategory: modelForEditing,
      isPanelExpanded: true,
      isEditingInline: true
    });
  },

  validateLevels: function(category) {
    const component = this;
    let areOk = true;
    const levels = category.get('levels');
    if (category.get('allowsLevels')) {
      if (levels.length > 0) {
        let gotFirstName = false;
        levels.map(function(level, index) {
          if (!level.name && !gotFirstName) {
            areOk = false;
            $(`.name-input.${index} span.name-error`).addClass('visible');
            gotFirstName = true;
          }
        });
      } else {
        areOk = false;
        component.set('showNoLevelsError', true);
      }

      if (category.get('allowsScoring')) {
        let gotFirstScore = false;
        levels.map(function(level, index) {
          if (level.score == null && !gotFirstScore) {
            areOk = false;
            $(`.score-input.${index} span.score-error`).addClass('visible');
            gotFirstScore = true;
          }
        });
      }
    }
    return areOk;
  },

  clearErrorMessages: function() {
    $('.name-input span.name-error').removeClass('visible');
    $('.score-input span.score-error').removeClass('visible');
    this.set('showNoLevelsError', false);
  }
});
