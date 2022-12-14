import Ember from 'ember';
import TaxonomyRoot from 'gooru-web/models/taxonomy/taxonomy-root';
import TaxonomyItem from 'gooru-web/models/taxonomy/taxonomy-item';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { TAXONOMY_LEVELS } from 'gooru-web/config/config';
/**
 * Serializer for Taxonomy endpoints
 *
 * @typedef {Object} ProfileSerializer
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  /**
   * Normalize the Fetch Taxonomy Subjects endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Subject[]} an array of subjects
   */
  normalizeFetchSubjects: function(payload) {
    var result = [];
    const serializer = this;
    const subjects = payload.subjects;
    if (Ember.isArray(subjects)) {
      result = subjects.map(function(subject) {
        return serializer.normalizeSubject(subject);
      });
    }
    return result;
  },

  normalizeSubject: function(subjectPayload) {
    var serializer = this;
    return TaxonomyRoot.create(Ember.getOwner(serializer).ownerInjection(), {
      id: subjectPayload.id,
      frameworkId:
        subjectPayload.standard_framework_id || subjectPayload.frameworkId,
      title: subjectPayload.title,
      subjectTitle: subjectPayload.title,
      code: subjectPayload.code,
      frameworks: serializer.normalizeFrameworks(
        subjectPayload.frameworks,
        subjectPayload.title
      )
    });
  },

  /**
   * Method to normalize taxonomy subjects from DS
   */
  normalizeTaxonomySubjects(subjectPayload) {
    var result = [];
    const serializer = this;
    const subjects = subjectPayload.subjects;
    if (Ember.isArray(subjects)) {
      result = subjects.map(function(subject) {
        return serializer.normalizeSubject(subject);
      });
    }
    return result;
  },

  normalizeFrameworks: function(frameworksPayload, parentTitle) {
    var frameworks = [];
    const serializer = this;
    if (frameworksPayload && Ember.isArray(frameworksPayload)) {
      frameworks = frameworksPayload.map(function(framework) {
        return serializer.normalizeFramework(framework, parentTitle);
      });
    }
    return frameworks;
  },

  normalizeFramework: function(subjectPayload, parentTitle) {
    const serializer = this;
    return TaxonomyRoot.create(Ember.getOwner(serializer).ownerInjection(), {
      id: subjectPayload.taxonomy_subject_id,
      frameworkId: subjectPayload.standard_framework_id,
      title: subjectPayload.title,
      subjectTitle: `${parentTitle}`
    });
  },

  /**
   * Normalize the Fetch Taxonomy Courses endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Course[]} an array of courses
   */
  normalizeFetchCourses: function(payload) {
    var result = [];
    const serializer = this;
    const courses = payload.courses;
    if (Ember.isArray(courses)) {
      result = courses.map(function(course) {
        return serializer.normalizeCourse(course);
      });
    }
    return result;
  },

  normalizeCourse: function(coursePayload) {
    var serializer = this;
    return TaxonomyItem.create(Ember.getOwner(serializer).ownerInjection(), {
      id: coursePayload.id,
      code: coursePayload.code,
      title: coursePayload.title
    });
  },

  /**
   * Normalize the Fetch Taxonomy Domains endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Course[]} an array of domains
   */
  normalizeFetchDomains: function(payload) {
    var result = [];
    const serializer = this;
    const domains = payload.domains;
    if (Ember.isArray(domains)) {
      result = domains.map(function(domain) {
        return serializer.normalizeDomain(domain);
      });
    }
    return result;
  },

  normalizeDomain: function(domainPayload) {
    return TaxonomyItem.create({
      id: domainPayload.id,
      code: domainPayload.code,
      title: domainPayload.title,
      sequence: domainPayload.sequence_id || 0
    });
  },

  /**
   * Normalize the Fetch Taxonomy Codes endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Object[]} an array of objects, each one with code information.
   */
  normalizeFetchCodes: function(payload) {
    var result = [];
    const serializer = this;
    const codes = payload.codes;
    if (Ember.isArray(codes)) {
      result = codes.map(function(code) {
        return serializer.normalizeCode(code);
      });
    }
    return result;
  },

  normalizeCode: function(codePayload) {
    return {
      id: codePayload.id,
      code: codePayload.code,
      title: codePayload.title,
      parentTaxonomyCodeId: codePayload.parent_taxonomy_code_id,
      codeType: codePayload.code_type
    };
  },

  /**
   * Serialize a TaxonomyTagData object into a JSON representation required by a core element (course|unit|collection|assessment|resource|question)
   *
   * @param taxonomyData the taxonomyData object
   * @returns {Object} a JSON Object
   */
  serializeTaxonomy: function(taxonomyData) {
    var taxonomyResult = null;
    if (
      taxonomyData &&
      Ember.isArray(taxonomyData) &&
      taxonomyData.length > 0
    ) {
      taxonomyResult = {};
      taxonomyData.forEach(function(taxonomy) {
        const taxonomyKey = taxonomy.get('id');
        taxonomyResult[taxonomyKey] = {
          code: taxonomy.get('code'),
          title: taxonomy.get('title'),
          parent_title: taxonomy.hasOwnProperty('parentTitle')
            ? taxonomy.get('parentTitle')
            : '',
          description: taxonomy.get('description'),
          framework_code: taxonomy.get('frameworkCode')
        };
      });
    }
    return taxonomyResult;
  },

  /**
   * Normalize the core element taxonomy data into a TaxonomyTagData object
   *
   * @param taxonomyArray - array of taxonomy objects
   * @param {string} level
   * @returns {TaxonomyTagData[]} a TaxonomyTagData array
   */
  normalizeTaxonomyArray: function(taxonomyArray, level) {
    var taxonomyData = [];

    if (taxonomyArray && taxonomyArray.length) {
      taxonomyArray.forEach(function(taxonomyObject) {
        let isMicroStandard = TaxonomyTagData.isMicroStandardId(
          taxonomyObject.internalCode
        );
        taxonomyData.push(
          TaxonomyTagData.create({
            id: taxonomyObject.internalCode,
            code: taxonomyObject.code,
            title: taxonomyObject.title,
            parentTitle: taxonomyObject.parentTitle,
            frameworkCode: taxonomyObject.frameworkCode,
            taxonomyId: taxonomyObject.id,
            taxonomyLevel: level
              ? level
              : isMicroStandard
                ? TAXONOMY_LEVELS.MICRO
                : TAXONOMY_LEVELS.STANDARD
          })
        );
      });
    }
    return Ember.A(taxonomyData);
  },

  /**
   * Normalize the core element taxonomy data into a TaxonomyTagData object
   *
   * @param taxonomyObject - object of taxonomy objects
   * @param level taxonomy level
   * @returns {TaxonomyTagData[]} a TaxonomyTagData array
   */
  normalizeTaxonomyObject: function(taxonomyObject, level) {
    var taxonomyData = [];
    if (taxonomyObject) {
      for (var key in taxonomyObject) {
        if (taxonomyObject.hasOwnProperty(key)) {
          let taxonomy = taxonomyObject[key];
          let isMicroStandard = level
            ? false
            : TaxonomyTagData.isMicroStandardId(key);
          taxonomyData.push(
            TaxonomyTagData.create({
              id: key,
              code: taxonomy.code,
              title: taxonomy.title,
              parentTitle: taxonomy.parent_title ? taxonomy.parent_title : '',
              description: taxonomy.description ? taxonomy.description : '',
              frameworkCode: taxonomy.framework_code || taxonomy.frameworkCode,
              taxonomyId: key,
              taxonomyLevel: level
                ? level
                : isMicroStandard
                  ? TAXONOMY_LEVELS.MICRO
                  : TAXONOMY_LEVELS.STANDARD
            })
          );
        }
      }
    }
    return Ember.A(taxonomyData);
  },

  /**
   * Serialize a TaxonomyTagData object into a JSON representation only for Resource Player Events
   *
   * @param taxonomyData the taxonomyData object
   * @returns {Object} a JSON Object
   */
  serializeTaxonomyForEvents: function(taxonomyData) {
    var taxonomyResult = null;
    if (
      taxonomyData &&
      Ember.isArray(taxonomyData) &&
      taxonomyData.length > 0
    ) {
      taxonomyResult = {};
      taxonomyData.forEach(function(taxonomy) {
        const taxonomyKey = taxonomy.get('id');
        taxonomyResult[taxonomyKey] = taxonomy.get('code');
      });
    }
    return taxonomyResult;
  },

  /**
   * @function normalizeDomainGradeBoundary
   */
  normalizeDomainGradeBoundary(payload) {
    let normalizedData = Ember.A([]);
    if (payload && payload.domains) {
      normalizedData = payload.domains;
    }
    return normalizedData;
  },

  /**
   * @function normalizeGrades
   */
  normalizeGrades(payload) {
    let resultSet = Ember.A();
    payload = Ember.A(payload.grades);
    payload.forEach(data => {
      if (data.levels) {
        let levelItem = Ember.A();
        data.levels.forEach(element => {
          element.levelId = data.id;
          levelItem.pushObject(Ember.Object.create(element));
        });
        data.levels = levelItem;
      }
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    resultSet = resultSet.sortBy('sequence');
    return resultSet;
  },

  /**
   * Normalize the learning maps taxonomy array
   *
   * @param taxonomyArray - array of taxonomy objects
   * @param {string} level
   * @returns {TaxonomyTagData[]} a TaxonomyTagData array
   */
  normalizeLearningMapsTaxonomyArray: function(taxonomyObject, level) {
    var taxonomyData = [];
    if (taxonomyObject) {
      Object.keys(taxonomyObject).forEach(function(internalCode) {
        let isMicroStandard = TaxonomyTagData.isMicroStandardId(
          taxonomyObject.internalCode
        );
        let taxonomyInfo = taxonomyObject[internalCode];
        taxonomyData.push(
          TaxonomyTagData.create({
            id: internalCode,
            code: taxonomyInfo.code,
            title: taxonomyInfo.title,
            parentTitle: taxonomyInfo.parentTitle,
            frameworkCode: taxonomyInfo.frameworkCode,
            taxonomyId: internalCode,
            taxonomyLevel: level
              ? level
              : isMicroStandard
                ? TAXONOMY_LEVELS.MICRO
                : TAXONOMY_LEVELS.STANDARD
          })
        );
      });
    }
    return Ember.A(taxonomyData);
  },
  /**
   * Normalize the Fetch Taxonomy Subjects endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Subject[]} an array of subjects
   */
  normalizeFetchSubject: function(payload) {
    var result = {};
    if (payload) {
      result = Object.assign(result, payload);
      result.standardFrameworkId = result.standard_framework_id;
      delete result.standard_framework_id;
    }
    return result;
  },

  /**
   * Normalize the Fetch Taxonomy categories endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Subject[]} an array of Categories
   */
  normalizeFetchCategories: function(payload) {
    let resultSet = Ember.A();
    payload = Ember.A(payload.subject_classifications);
    payload.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  /**
   * Normalize the Fetch Taxonomy subject frameworks endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {frameworks[]} an array of frameworks
   */
  normalizeFetchSubjectFrameworks: function(payload) {
    let resultSet = Ember.A();
    payload = Ember.A(payload.frameworks);
    payload.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  normalizeFWCMatrixs(payload) {
    let domainMatrixs = Ember.A(payload.competencyMatrix);
    return domainMatrixs.map(domainMatrix => {
      let domain = Ember.Object.create(domainMatrix.topics[0]);
      let domainComptencies = domain.get('competencies').map(competency => {
        return Ember.Object.create(competency);
      });
      domain.set('domainCode', domainMatrix.domainCode);
      domain.set('domainName', domainMatrix.domainName);
      domain.set('domainSeq', domainMatrix.domainSeq);
      domain.set('fwDomainName', domainMatrix.fwDomainName);
      domain.set('topics', domainMatrix.topics);
      domain.set('competencies', domainComptencies);
      return domain;
    });
  },

  /**
   * @function normalizeCrosswalkCompetency
   */
  normalizeCrosswalkCompetency(payload) {
    let crosswalkCompetencies = Ember.A(payload.frameworkCrossWalkComp);
    return crosswalkCompetencies.map(competency =>
      Ember.Object.create({
        sourceDisplayCode: competency.source_display_code,
        sourceTaxonomyCodeId: competency.source_taxonomy_code_id,
        targetDisplayCode: competency.target_display_code,
        targetFrameworkId: competency.target_framework_id,
        targetTaxonomyCodeId: competency.target_taxonomy_code_id,
        targetLoCode:
          competency && competency.target_lo_code
            ? competency.target_lo_code
            : null,
        targetLoName:
          competency && competency.target_lo_name
            ? competency.target_lo_name
            : null
      })
    );
  }
});
