import Ember from 'ember';

/**
 * Browse selector
 *
 * Component responsible for displaying a tree of browse items as a hierarchical
 * list of panels where each panel displays a level of data from a branch in the
 * tree. Items in the last levels of the tree can be selected/deselected.
 *
 * If there are more levels in the tree than there are levels of panels, then the
 * exceeding tree levels will be displayed as accordions in the last browse panel.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['taxonomy', 'gru-browse-selector'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Select an item that is not in the last panel
     *
     * @function actions:selectInsideItem
     */
    selectInsideItem: function(item) {
      const component = this;
      component.get('onSelectItem')(item);
      component.set('item', item);
      component.sendAction('selectedGrade', item);
      if (component.get('isCompatiableMode')) {
        component.set('doAnimate', true);
        component.animateTaxonomyPicker(item.level);
        component.showBreadcrumbLevels(item);
      }
    },

    /**
     * Select an item in the last panel
     *
     * @function actions:selectCheckableItem
     */
    selectCheckableItem: function(item) {
      var isSelected = !item.get('isSelected');

      item.set('isSelected', isSelected);
      if (isSelected) {
        this.get('onCheckItem')(item);
      } else {
        this.get('onUncheckItem')(item);
      }
    },

    //Action triggered when expand taxonomy browser
    onExpandBrowser(level) {
      this.set('doAnimate', false);
      this.expandTaxonomyPicker(level);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    const component = this;
    if (component.get('isCompatiableMode')) {
      component.set('doAnimate', true);
    }
  },

  didRender() {
    this._super(...arguments);
    const component = this;
    let isCompatiableMode = component.get('isCompatiableMode');
    let item = component.get('item');
    if (item && isCompatiableMode) {
      component.animateTaxonomyPicker(item.level);
    }
    if (isCompatiableMode) {
      component.populateTaxonomyPicker();
    }
    component.$('button[data-toggle="collapse"]').on('click', function(e) {
      e.preventDefault();
    });
  },

  willRender() {
    this._super(...arguments);
    var $component = this.$();

    if ($component) {
      this.$('button[data-toggle="collapse"]').off('click');
    }
  },

  willDestroyElement: function() {
    this.$('button[data-toggle="collapse"]').off('click');
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * List of root nodes for the tree data structure for the browse panels
   * @prop {BrowseItem[][]...}
   */
  data: [],

  /**
   * List of headers, one for each browse panel
   * @prop {String[]}
   */
  headers: [],

  /**
   * List of objects, where each object serves as the model for a browse panel.
   * Each object is made up of two properties:
   * - title : panel header name (String) -@see headers
   * - data  : pointer to a list of browse items (BrowseItem[]).
   *
   * @prop {Object[]}
   */
  headerItems: Ember.computed('selectedPath', function() {
    var headers = this.get('headers');
    var previousPath = this.get('previousSelectedPath');
    var currentPath = this.get('selectedPath');
    var currentList, browseItem;
    // Clear and then update cached path
    this.clearActivePath(previousPath);
    this.set('previousSelectedPath', currentPath);

    return headers.map(
      function(headerTitle, index) {
        var itemId = currentPath[index];

        currentList =
          index === 0
            ? this.get('data')
            : browseItem
              ? browseItem.get('children')
              : [];
        browseItem = currentList.length
          ? currentList.findBy('id', itemId)
          : null;

        if (browseItem) {
          browseItem.set('isActive', true);
        }

        return Ember.Object.create({
          title: headerTitle,
          data: currentList ? currentList : []
        });
      }.bind(this)
    );
  }),

  /**
   * @property {Object} item
   * Property to hold selected item
   */
  item: null,

  /**
   * List of ids of selected panel items where each array index corresponds to a panel level.
   * @prop {String[]}
   */
  selectedPath: [],

  /**
   * Previous value of @see selectedPath.
   * @prop {String[]}
   */
  previousSelectedPath: [],

  /**
   * @property {Boolean} isCompatiableMode
   * Property to load the taxonomy picker in compatiable mode
   */
  isCompatiableMode: false,

  /**
   * @property {String} course
   * Property to hold selected course title
   */
  course: null,

  /**
   * @property {String} domain
   * Property to hold selected domain title
   */
  domain: null,

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @function clearActivePath
   * Set the property 'isActive' to false to every browse item found in 'path'.
   * @param {String[]} path - List of browse item ids
   */
  clearActivePath: function(path) {
    var browseItem = [];

    path.forEach(
      function(browseItemId, index) {
        if (index === 0) {
          browseItem = this.get('data').findBy('id', browseItemId);
        } else {
          browseItem = browseItem.get('children').findBy('id', browseItemId);
        }
        browseItem.set('isActive', false);
      }.bind(this)
    );
  },

  /**
   * @function populateTaxonomyPicker
   * Method to populate taxonomy picker hierarchy
   */
  populateTaxonomyPicker() {
    const component = this;
    if (component.get('doAnimate')) {
      component.$('.hierarchy-1-container').show();
      component.$('.hierarchy-2-container, .hierarchy-3-container').hide();
      if (component.get('course')) {
        component.$('.hierarchy-1-container, .hierarchy-3-container').hide();
        component.$('.hierarchy-2-container').show();
      }
      if (component.get('domain')) {
        component.$('.hierarchy-1-container, .hierarchy-2-container').hide();
        component.$('.hierarchy-3-container').show();
      }
    }
  },

  /**
   * @function animateTaxonomyPicker
   * Method to animate taxonomy picker
   */
  animateTaxonomyPicker(level) {
    const component = this;
    if (component.get('doAnimate')) {
      if (level === 1) {
        component
          .$(`.hierarchy-${level}-container, .hierarchy-${level + 2}-container`)
          .hide(1000);
        component.$(`.hierarchy-${level + 1}-container`).show(1000);
      } else if (level === 2) {
        component
          .$(`.hierarchy-${level - 1}-container, .hierarchy-${level}-container`)
          .hide(1000);
        component.$(`.hierarchy-${level + 1}-container`).show(1000);
      }
    }
  },

  /**
   * @function expandTaxonomyPicker
   * Method to handle taxonomy picker expander operations
   */
  expandTaxonomyPicker(level) {
    const component = this;
    if (level === 1) {
      component.$(`.hierarchy-${level}-container`).show(1000);
      component
        .$(
          `.hierarchy-${level + 1}-container, .hierarchy-${level + 2}-container`
        )
        .hide(1000);
      component.set('domain', null);
    } else if (level === 2) {
      component
        .$(
          `.hierarchy-${level - 1}-container, .hierarchy-${level + 1}-container`
        )
        .hide(1000);
      component.$(`.hierarchy-${level}-container`).show(1000);
    }
  },

  /**
   * @function showBreadcrumbLevels
   * Method to show breadcrumb levels
   */
  showBreadcrumbLevels(item) {
    const component = this;
    let level = item.level;
    let title = item.title;
    if (level === 1) {
      component.set('course', title);
      component.set('domain', null);
    } else if (level === 2) {
      component.set('domain', title);
    }
  }
});
