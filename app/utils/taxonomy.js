import Ember from 'ember';
import TaxonomyItem from 'gooru-web/models/taxonomy/taxonomy-item';
import BrowseItem from 'gooru-web/models/taxonomy/browse-item';
import { TAXONOMY_CATEGORIES } from 'gooru-web/config/config';

/**
 * Generates a taxonomy tree data structure for testing
 * @param {Number} levels - total number of parent/children levels in the tree
 * @param {TaxonomyItem} parent - parent item for all the items created in the current level
 * @param {Number} inc - number by which the number of items in each level will increase
 * @param {Number} currentLevel - current tree level being built (starts at 1)
 * @return {TaxonomyItem[][] ...} - the list of taxonomy items in the first level
 */
export function generateTaxonomyTestTree(
  levels = 1,
  parent = null,
  inc = 1,
  currentLevel = 1
) {
  var totalItems = currentLevel * inc;
  var items = [];

  if (currentLevel <= levels) {
    for (let i = 0; i < totalItems; i++) {
      let parentId = parent ? parent.get('id') : '0';
      let parentIdNum = parentId.charAt(parentId.length - 1);
      let itemId = currentLevel + parentIdNum + i;

      let taxonomyItem = TaxonomyItem.create({
        id: `${parentId}-${itemId}`,
        code: `Code : ${currentLevel} : ${parentIdNum} : ${i}`,
        title: `Item : ${currentLevel} : ${parentIdNum} : ${i}`,
        level: currentLevel,
        parent: parent
      });

      generateTaxonomyTestTree(levels, taxonomyItem, inc, currentLevel + 1);
      items.push(taxonomyItem);
    }

    if (parent) {
      // Link all items to parent
      parent.set('children', items);
    }

    return items;
  }
}

/**
 * Generates a tree data structure for testing the browse selector (@see gru-browse-selector)
 * @param {Number} levels - total number of parent/children levels in the tree
 * @param {Number} lastLevels - number of sub-levels in the last level of the tree
 * @param {Number} inc - number by which the number of items in each level will increase
 * @return {BrowseItem[][] ...} - the list of browse items in the first level
 */
export function generateBrowseTestTree(levels = 1, lastLevels = 0, inc = 1) {
  const startLevel = 1;
  var browseItems = [];

  var taxonomyItems = generateTaxonomyTestTree(
    levels + lastLevels,
    null,
    inc,
    startLevel
  );

  taxonomyItems.forEach(function(rootTaxonomyItem) {
    var item = BrowseItem.createFromTaxonomyItem(
      rootTaxonomyItem,
      levels + lastLevels
    );
    browseItems.push(item);
  });

  return browseItems;
}

/**
 * Gets a category object from a subjectId
 * @param {String} subjectId - The subject id with the format 'CCSS.K12.Math'
 * @return {Object} - An object with the category information
 */
export function getCategoryFromSubjectId(subjectId) {
  let categoryCode = subjectId.split('.')[0];
  let categories = Ember.A(TAXONOMY_CATEGORIES);
  let category = categories.findBy('apiCode', categoryCode);
  if (!category) {
    categoryCode = subjectId.split('.')[1];
    category = categories.findBy('apiCode', categoryCode);
  }
  return category ? category.value : null;
}

/**
 * Gets a category object from a subjectId
 * @param {String} subjectId - The subject id with the format 'CCSS.K12.Math', 'K12.Math'
 * @return {Object} - An object with the category information
 */
export function getCategoryCodeFromSubjectId(subjectId) {
  let categoryCode = subjectId.split('.');
  return categoryCode.length === 3 ? categoryCode[1] : categoryCode[0];
}

/**
 * Parse and read subject id for given string
 * @param  {String} id
 * @return {String}
 */
export function getSubjectId(id) {
  return id.substring(0, id.indexOf('-'));
}

/**
 * Parse and read gut code id from given subject id
 * @param  {String} id
 * @return {String}
 */
export function getGutCodeFromSubjectId(subjectId) {
  let subjectCodes = subjectId.split('.');
  return subjectCodes.length === 3
    ? `${subjectCodes[1]}.${subjectCodes[2]}`
    : subjectId;
}

/**
 * Parse and read course id for given string
 * @param  {String} id
 * @return {String}
 */
export function getCourseId(id) {
  let ids = id.split('-');
  return `${ids[0]}-${ids[1]}`;
}

/**
 * Parse and read domain id for given string
 * @param  {String} id
 * @return {String}
 */
export function getDomainId(id) {
  let ids = id.split('-');
  return `${ids[0]}-${ids[1]}-${ids[2]}`;
}

/**
 * Parse and extract domain code from given GUT code
 * @param {String} gutCode
 * @return {String}
 */
export function getDomainCode(gutCode) {
  let domainCode = null;
  if (gutCode) {
    let ids = gutCode.split('-');
    domainCode = ids.objectAt(2);
  }
  return domainCode;
}

/**
 * parse and form a json object
 * @param {Array} competencyMatrixs
 * @return {Array}
 */
export function flattenGutToFwCompetency(competencyMatrixs) {
  let fwCompetencies = [];
  competencyMatrixs.map(competencyMatrix => {
    let topics = competencyMatrix.get('topics');
    topics.forEach(topic => {
      let competencies = topic.competencies;
      competencies.forEach(competency => {
        fwCompetencies.push({
          [competency.competencyCode]: competency
        });
      });
    });
  });
  return fwCompetencies;
}

/**
 * parse and form a json object
 * @param {Array} competencyMatrixs
 * @return {Array}
 */
export function flattenGutToFwDomain(competencyMatrixs) {
  return competencyMatrixs.map(competencyMatrix => {
    return {
      [competencyMatrix.domainCode]: competencyMatrix
    };
  });
}

/**
 * parse and form a string
 * @param {string} getTaxonomySubject
 * @return {string}
 */
export function getTaxonomySubject(competencyCode) {
  const compFWCode = competencyCode.split('.');
  const compCode = compFWCode.slice(1, 3).join('.');
  const subjectCode = compCode.split('-');
  return subjectCode[0] || null;
}
