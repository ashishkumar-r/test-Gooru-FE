import Ember from 'ember';
import APITaxonomyService from 'gooru-web/services/api-sdk/taxonomy';
import TaxonomyItem from 'gooru-web/models/taxonomy/taxonomy-item';
import { CODE_TYPES } from 'gooru-web/config/config';
import { getCategoryCodeFromSubjectId } from 'gooru-web/utils/taxonomy';

/**
 * Service for the Taxonomy Singleton elements container
 *
 * @typedef {Object} TaxonomyService
 */
export default Ember.Service.extend({
  /**
   * @private {Number} - Starting taxonomy item level for the standards
   */
  STANDARDS_BASE_LEVEL: 3,

  /**
   * @property {APITaxonomyService} - the taxonomy service
   */
  apiTaxonomyService: null,

  /**
   * @property {Object} An object that contains the hierarchy of taxonomy. It gets populated progressively during
   * application browsing, as data is getting retrieved it gets stored in this property to prevent redundant hits
   * to the API
   */
  taxonomyContainer: null,

  /**
   * @property {Object} taxonomySubjectContainer
   * An object to store taxonomy subjects which is fetched from the ds-user API
   */
  taxonomySubjectContainer: null,

  /**
   * @property {Object} taxonomyCategoriesContainer
   * An object to store taxonomy categories
   */
  taxonomyCategoriesContainer: null,

  init() {
    this._super(...arguments);
    this.set('taxonomyContainer', {});
    this.set(
      'apiTaxonomyService',
      APITaxonomyService.create(Ember.getOwner(this).ownerInjection())
    );
    this.set('taxonomySubjectContainer', {});
    this.set('taxonomyClassificationContainer', null);
    this.set('crosswalkFWCompetencies', Ember.Object.create({}));
  },

  /**
   * Gets the Taxonomy Subjects for a Category from the cached taxonomy. If the subjects are not available then fetch
   * them from the Taxonomy API.
   *
   * @param {String} category - The classification type
   * @returns {Promise}
   */
  getSubjects(category) {
    const service = this;
    const apiTaxonomyService = service.get('apiTaxonomyService');
    return new Ember.RSVP.Promise(function(resolve) {
      var taxonomyContainer = service.get('taxonomyContainer');
      if (taxonomyContainer[category]) {
        resolve(taxonomyContainer[category]);
      } else {
        service.getCategories().then(categories => {
          let promises = categories.map(category => {
            return apiTaxonomyService
              .fetchSubjects(category.get('id'))
              .then(function(subjects) {
                taxonomyContainer[category.get('code')] = subjects;
              });
          });
          Ember.RSVP.all(promises).then(function() {
            resolve(taxonomyContainer[category]);
          });
        });
      }
    });
  },

  /**
   * Gets the Taxonomy Subjects for a Category from the cached taxonomy. If the subjects are not available then fetch
   * them from the Taxonomy API.
   *
   * @param {String} category - The classification type
   * @returns {Promise}
   */
  getTaxonomySubjects(taxonomyCategory) {
    const service = this;
    const apiTaxonomyService = service.get('apiTaxonomyService');
    return new Ember.RSVP.Promise(function(resolve) {
      var taxonomySubjectContainer = service.get('taxonomySubjectContainer');
      if (taxonomySubjectContainer[taxonomyCategory]) {
        resolve(taxonomySubjectContainer[taxonomyCategory]);
      } else {
        return apiTaxonomyService
          .fetchTaxonomySubjects(taxonomyCategory)
          .then(function(subjects) {
            taxonomySubjectContainer[taxonomyCategory] = subjects;
            resolve(taxonomySubjectContainer[taxonomyCategory]);
          });
      }
    });
  },

  /**
   * Gets the Taxonomy Subjects by user id
   *
   * @param {String} userId
   * @returns {Promise}
   */
  getTaxonomySubjectsByUserId(userId) {
    const service = this;
    const apiTaxonomyService = service.get('apiTaxonomyService');
    return new Ember.RSVP.Promise(function(resolve) {
      return apiTaxonomyService
        .getTaxonomySubjectsByUserId(userId)
        .then(function(subjects) {
          resolve(subjects);
        });
    });
  },

  /**
   * Gets the Taxonomy Courses for a Subject from the cached taxonomy. If the courses are not available then fetch
   * them from the Taxonomy API.
   *
   * @param {TaxonomyRoot} subject - The taxonomy subject
   * @returns {Promise}
   */
  getCourses(subject) {
    const service = this;
    const apiTaxonomyService = service.get('apiTaxonomyService');
    return new Ember.RSVP.Promise(function(resolve) {
      if (subject) {
        if (subject.get('courses') && subject.get('courses.length') > 0) {
          resolve(subject.get('courses'));
        } else {
          apiTaxonomyService
            .fetchCourses(subject.get('frameworkId'), subject.get('id'))
            .then(function(courses) {
              subject.set('courses', courses);
              resolve(courses);
            });
        }
      } else {
        resolve(null);
      }
    });
  },

  /**
   * Gets the Taxonomy Domains for a Course from the cached taxonomy. If the domains are not available then fetch
   * them from the Taxonomy API.
   *
   * @param {TaxonomyRoot} subject - The subject
   * @param {String} courseId - ID of course for which to find the domains
   * @returns {Promise}
   */
  getCourseDomains(subject, courseId) {
    const apiTaxonomyService = this.get('apiTaxonomyService');
    var course = subject.get('courses').findBy('id', courseId);

    return new Ember.RSVP.Promise(function(resolve) {
      if (!course.get('children').length) {
        // No domains found ... ask for them
        apiTaxonomyService
          .fetchDomains(subject.get('frameworkId'), subject.get('id'), courseId)
          .then(function(domains) {
            course.set('children', domains);
            // Set reference to parent
            domains.forEach(function(domain) {
              domain.setProperties({
                parent: course,
                level: 2
              });
            });
            resolve(domains);
          });
      } else {
        resolve(course.get('children'));
      }
    });
  },

  /**
   * Gets the Taxonomy Codes for a Domain from the cached taxonomy. If the codes are not available then fetch
   * them from the Taxonomy API.
   *
   * @param {TaxonomyRoot} subject - The subject
   * @param {String} courseId - ID of course the domain belongs to
   * @param {String} domainId - ID of domain for which to find the standards
   * @returns {Promise}
   */
  getDomainCodes(subject, courseId, domainId) {
    const service = this;
    const apiTaxonomyService = this.get('apiTaxonomyService');
    var domain;

    for (let i = subject.get('courses').length - 1; i >= 0; --i) {
      domain = subject.get('courses')[i].find([courseId, domainId]);
      if (domain) {
        break;
      }
    }

    return new Ember.RSVP.Promise(function(resolve) {
      if (!domain || !domain.get('children').length) {
        // No standards found ... ask for them
        apiTaxonomyService
          .fetchCodes(
            subject.get('frameworkId'),
            subject.get('id'),
            courseId,
            domainId
          )
          .then(function(codes) {
            var standards = service.createStandardsHierarchy(codes);
            domain.set('children', standards);
            // Set reference to parent
            standards.forEach(function(standard) {
              standard.set('parent', domain);
            });
            resolve(standards);
          });
      } else {
        resolve(domain.get('children'));
      }
    });
  },

  /**
   * Finds a Taxonomy Subject by category and subject ID
   *
   * @param {String} category - The classification type
   * @param {String} subjectId - The subject id
   * @returns {TaxonomyRoot}
   */
  findSubjectById(subjectId, loadCourses = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      const category = getCategoryCodeFromSubjectId(subjectId);
      if (category) {
        service.getSubjects(category).then(function() {
          var result = service.findSubject(category, subjectId);
          if (result && loadCourses) {
            service.getCourses(result).then(function() {
              resolve(result);
            });
          } else {
            resolve(result);
          }
        });
      } else {
        resolve(null);
      }
    });
  },

  findSubject: function(categoryId, subjectId) {
    var result = null;
    const service = this;
    const taxonomyContainer = service.get('taxonomyContainer');
    if (taxonomyContainer) {
      const categorySubjects = taxonomyContainer[categoryId];
      if (categorySubjects) {
        result = categorySubjects.find(function(subject) {
          if (subjectId.includes(subject.id)) {
            return subject;
          }
        });
        if (!result) {
          categorySubjects.forEach(function(subject) {
            if (!result) {
              // Array forEach function does not have a short circuit, so we are testing is the value has not been found, otherwise just jump to the next element
              result = subject.get('frameworks').findBy('id', subjectId);
            }
          });
        }
      }
    }
    return result;
  },

  createStandardsHierarchy(codes) {
    var sortedTaxonomyItems = this.sortCodes(codes);
    var standardsWithoutCategory;
    var standardsCategories;

    this.attachChildren(
      sortedTaxonomyItems[3],
      3,
      sortedTaxonomyItems[2],
      sortedTaxonomyItems[1]
    );
    this.attachChildren(
      sortedTaxonomyItems[2],
      2,
      sortedTaxonomyItems[1],
      sortedTaxonomyItems[0]
    );
    standardsWithoutCategory = this.attachStandards(
      sortedTaxonomyItems[1],
      sortedTaxonomyItems[0],
      []
    );

    standardsCategories = this.attachStandardsWithoutCategory(
      standardsWithoutCategory,
      sortedTaxonomyItems[0]
    );
    return standardsCategories;
  },

  sortCodes(codes) {
    const BASE_LEVEL = this.get('STANDARDS_BASE_LEVEL'); // standards base level
    const NUM_BUCKETS = 4;
    var codesLen = codes.length;
    var buckets = [];

    for (let i = NUM_BUCKETS - 1; i >= 0; --i) {
      // Make an array of arrays to store the different levels of standards
      buckets[i] = [];
    }

    for (let i = 0; i < codesLen; i++) {
      let code = codes[i];

      // NOTE: temporarily assign the parentTaxonomyCodeId to the parent property
      // It will be replaced in the next phase of the process.
      let taxonomyItem = TaxonomyItem.create({
        id: code.id,
        code: code.code,
        title: code.title,
        parent: code.parentTaxonomyCodeId
      });

      switch (code.codeType) {
      case CODE_TYPES.STANDARD_CATEGORY:
        taxonomyItem.set('level', BASE_LEVEL);
        buckets[0].push(taxonomyItem);
        break;
      case CODE_TYPES.STANDARD:
        taxonomyItem.set('level', BASE_LEVEL + 1);
        buckets[1].push(taxonomyItem);
        break;
      case CODE_TYPES.SUB_STANDARD:
        taxonomyItem.set('level', BASE_LEVEL + 2);
        buckets[2].push(taxonomyItem);
        break;
      case CODE_TYPES.LEARNING_TARGET_L0:
      case CODE_TYPES.LEARNING_TARGET_L1:
      case CODE_TYPES.LEARNING_TARGET_L2:
        taxonomyItem.set('level', BASE_LEVEL + 3);
        buckets[3].push(taxonomyItem);
        break;
      default:
        Ember.Logger.error(`Unknown code_type: ${code.codeType}`);
      }
    }
    return buckets;
  },

  attachChildren(children, levelOffset, firstLevelParents, secondLevelParents) {
    const BASE_LEVEL = this.get('STANDARDS_BASE_LEVEL'); // standards base level

    if (children.length) {
      let siblings = [],
        remaining = [];
      let lead = children.pop();
      let parentId = lead.get('parent'); // parentTaxonomyCodeId
      let parent = firstLevelParents.findBy('id', parentId);

      children.forEach(function(taxonomyItem) {
        if (taxonomyItem.get('parent') === parentId) {
          siblings.push(taxonomyItem);
        } else {
          remaining.push(taxonomyItem);
        }
      });

      if (!parent) {
        let grandparent = secondLevelParents.findBy('id', parentId);

        if (grandparent) {
          grandparent.set('hasMicroStandard', true);
          // Use a "fake" parent to close any gaps in the hierarchy
          parent = TaxonomyItem.create({
            id: `empty-${parentId}`,
            level: BASE_LEVEL + (levelOffset - 1), // Level for fake parent
            parent: grandparent // Save reference to standard
          });
          grandparent.set(
            'children',
            [parent].concat(grandparent.get('children'))
          );
        } else {
          Ember.Logger.warn(
            `Parent with ID ${parentId} not found for items at level: ${levelOffset}`
          );
          this.attachChildren(
            remaining,
            levelOffset,
            firstLevelParents,
            secondLevelParents
          );
        }
      }

      // Add the lead in with its siblings
      siblings.push(lead);
      siblings.forEach(function(taxonomyItem) {
        taxonomyItem.set('parent', parent);
      });

      // Concat the list of children with any existing children the parent may already have
      parent.set('children', siblings.concat(parent.get('children')));
      this.attachChildren(
        remaining,
        levelOffset,
        firstLevelParents,
        secondLevelParents
      );
    }
  },

  attachStandards(standards, categories, listWithoutCategory) {
    if (!standards.length) {
      return listWithoutCategory;
    } else {
      let lead = standards.pop();
      if (!lead.get('parent')) {
        listWithoutCategory.unshift(lead);
        return this.attachStandards(standards, categories, listWithoutCategory);
      } else {
        let siblings = [],
          remaining = [];
        let parentId = lead.get('parent');
        let parent = categories.findBy('id', parentId);

        standards.forEach(function(taxonomyItem) {
          if (taxonomyItem.get('parent') === parentId) {
            siblings.push(taxonomyItem);
          } else {
            remaining.push(taxonomyItem);
          }
        });

        if (!parent) {
          Ember.Logger.warn(`Category with ID ${parentId} not found standards`);
          return this.attachStandards(
            remaining,
            categories,
            listWithoutCategory
          );
        }

        // Add the lead in with its siblings
        siblings.push(lead);
        siblings.forEach(function(taxonomyItem) {
          taxonomyItem.set('parent', parent);
        });

        // Concat the list of children with any existing children the parent may already have
        parent.set('children', siblings.concat(parent.get('children')));
        return this.attachStandards(remaining, categories, listWithoutCategory);
      }
    }
  },

  attachStandardsWithoutCategory(standards, categories) {
    const BASE_LEVEL = this.get('STANDARDS_BASE_LEVEL'); // standards base level

    var defaultCategory = TaxonomyItem.create({
      id: 'empty-category',
      level: BASE_LEVEL,
      children: standards
    });

    standards.forEach(function(taxonomyItem) {
      taxonomyItem.set('parent', defaultCategory);
    });

    categories.push(defaultCategory);
    return categories;
  },

  fetchSubjectsByIds(taxonomyIds) {
    const chain = Ember.A([]);
    let codes = Ember.A([]);
    taxonomyIds.forEach(taxonomyId => {
      codes.push(taxonomyId.substring(0, taxonomyId.indexOf('-')));
    });
    codes = codes.uniq();
    codes.forEach(code => {
      chain.push(this.findSubjectById(code, false));
    });
    return Ember.RSVP.all(chain);
  },

  /**
   * Gets the Taxonomy classifications  from the cached taxonomy. If the classifications are not available then fetch
   * them from the Taxonomy API.
   *
   * @returns {Promise}
   */
  getCategories() {
    const service = this;
    const apiTaxonomyService = service.get('apiTaxonomyService');
    return new Ember.RSVP.Promise(function(resolve) {
      let taxonomyCategoriesContainer = service.get(
        'taxonomyCategoriesContainer'
      );
      if (taxonomyCategoriesContainer) {
        resolve(taxonomyCategoriesContainer);
      } else {
        return apiTaxonomyService.fetchCategories().then(function(categories) {
          service.set('taxonomyCategoriesContainer', categories);
          resolve(categories);
        });
      }
    });
  },

  fetchCrossWalkFWC(frameworkCode, subjectCode) {
    const service = this;
    const apiTaxonomyService = service.get('apiTaxonomyService');
    return new Ember.RSVP.Promise(function(resolve) {
      let crosswalkFWCompetencies = service.get('crosswalkFWCompetencies');
      if (
        crosswalkFWCompetencies.get('framework') === frameworkCode &&
        crosswalkFWCompetencies.get('subject') === subjectCode
      ) {
        resolve(crosswalkFWCompetencies);
      } else {
        return apiTaxonomyService
          .fetchCrossWalkFWC(frameworkCode, subjectCode)
          .then(function(crosswalkFWCompetencyMatrix) {
            crosswalkFWCompetencies.set('framework', frameworkCode);
            crosswalkFWCompetencies.set('subject', subjectCode);
            service.set('crosswalkFWCompetencies', crosswalkFWCompetencyMatrix);
            resolve(crosswalkFWCompetencyMatrix);
          });
      }
    });
  }
});
