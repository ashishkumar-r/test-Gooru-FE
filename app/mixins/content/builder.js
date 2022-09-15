import Ember from 'ember';
import BuilderItem from 'gooru-web/models/content/builder/item';

/**
 * Properties/functionality in common for content creation
 *
 * @mixin
 */
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Reorder child items
     */
    sortItems: function() {
      var $sortable = this.$(this.get('sortableSelector'));
      this.set('model.isExpanded', true);
      this.set('model.isSorting', true);
      $sortable.sortable({
        scroll: false
      });
      $sortable.addClass('sorting').sortable('enable');
    },

    /**
     * Cancel sorting of child items
     */
    cancelSort: function() {
      var $sortable = this.$(this.get('sortableSelector'));
      this.set('model.isSorting', false);
      this.cancelSort();
      $sortable.removeClass('sorting').sortable('disable');
    },

    /**
     * Save sorting of child items
     */
    finishSort: function() {
      var $sortable = this.$(this.get('sortableSelector'));
      this.set('model.isSorting', false);
      $sortable.removeClass('sorting').sortable('disable');
      this.refreshList();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  setupSortable: Ember.on('didInsertElement', function() {
    this._super(...arguments);
    var component = this;
    var sortableSelector = this.get('sortableSelector');

    this.$(sortableSelector).sortable({
      disabled: true,
      update: () => component.refreshOrderList()
    });
  }),

  destroySortable: Ember.on('willDestroyElement', function() {
    var $sortable = this.$(this.get('sortableSelector'));

    // Test if the element had a sortable widget instantiated
    if ($sortable.hasClass('ui-sortable')) {
      $sortable.sortable('destroy');
    }
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop {Number} index - Item index number relative to its sibling
   */
  index: null,

  /**
   * @property {Boolean} isAddingItem - Is a new item being added or not?
   */
  isAddingItem: Ember.computed('items.@each.isNew', function() {
    var items = this.get('items');
    return !!items.filterBy('isNew').length;
  }),

  /**
   * @property {Boolean} Is this item currently being reordered among its siblings?
   */
  isSorting: false,

  /**
   * @property {Boolean} isEditingItem - Is an item being edited or not?
   * New items (i.e. not yet saved) are also considered as being edited.
   */
  isEditingItem: Ember.computed('items.@each.isEditing', function() {
    var items = this.get('items');
    return items.filterBy('isEditing', true).length;
  }),

  /**
   * @prop {Ember.RSVP.Promise} items - children of the accordion
   * Will resolve to {Unit[] | Lesson[] | Collection[]}
   */
  items: [],

  /**
   * @prop {Unit | Lesson} model - Item data model (accordion root)
   */
  model: null,

  /**
   * @property {String[]} Array of item IDs corresponding to the current order of the child items
   */
  orderList: null,

  /**
   * @prop {String} sortableSelector - CSS selector for the sortable element in all places this
   * mixin is being used
   */
  sortableSelector: '> .panel > .panel-body > .sortable, > .sortable',

  dragElSelector: ' > li',

  parentElSelector: ' > li',

  /**
   * @property {Boolean} totalSavedItems - Number of items that have been saved at least once?
   */
  totalSavedItems: Ember.computed('items.@each.isNew', function() {
    var items = this.get('items');
    return items.filterBy('isNew', false).length;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Refresh the order list when changing items
   */
  refreshOrderList: function() {
    const items = this.get('items');
    let findById;
    if (items.length && items[0] instanceof BuilderItem) {
      findById = id => items.findBy('data.id', id);
    } else {
      findById = id => items.findBy('id', id);
    }
    const $items = this.$(this.get('sortableSelector')).find(
      this.get('dragElSelector')
    );
    // Only use DOM elements that have a corresponding item in the list
    const orderList = $items
      .filter((idx, item) => !!findById($(item).data('id')))
      .map((idx, item) => $(item).data('id'))
      .toArray();
    this.set('orderList', orderList);
    // Remove DOM elements that have no corresponding item in the list
    const toRemove = $items.filter((idx, item) => {
      let dataId = $(item).data('id');
      return !!dataId && !findById(dataId);
    });
    toRemove.each((idx, item) => $(item).remove());
  },

  /**
   * Refresh the item list after save reorder
   */
  refreshList: function() {
    var orderList = this.get('orderList');
    var items = this.get('items');
    if (orderList) {
      let filterFunc;

      if (items.length && items[0] instanceof BuilderItem) {
        filterFunc = function(item, index, items) {
          return items.findBy('data.id', orderList[index]);
        };
      } else {
        filterFunc = function(item, index, items) {
          return items.findBy('id', orderList[index]);
        };
      }

      let sortedItems = items.map(filterFunc);
      items.clear();
      items.addObjects(sortedItems);
    }
  },

  /**
   * Return elements to their original positions
   */
  cancelSort: function() {
    const sortableSelector = this.get('sortableSelector');
    const items = this.get('items');
    const $sortable = this.$(sortableSelector);
    const dragEl = this.get('parentElSelector');
    const $items = $sortable.find(dragEl);
    // Create map of dom elements with the id as key
    const itemsMap = $items.toArray().reduce((itemsMap, item) => {
      itemsMap[$(item).data('id')] = item;
      return itemsMap;
    }, {});
    let getId;
    if (items.length && items[0] instanceof BuilderItem) {
      getId = item => item.get('data.id');
    } else {
      getId = item => item.get('id');
    }
    // Send an update event to move every element to its original position
    items
      .map(item => itemsMap[getId(item)])
      .forEach((item, index) => {
        $sortable.sortable('option', 'update')(null, {
          item: $sortable.find(`${dragEl}:eq(${index})`).after($(item))
        });
      });
  }
});
