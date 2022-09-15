import Ember from 'ember';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer for Struggling Competency endpoints
 *
 * @typedef {Object} StrugglingCompetencySerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * Normalized data of struggling competency
   * @return {Object}
   */
  normalizeStrugglingCompetency(payload) {
    let serialize = this;
    let strugglingCompetency = payload.struggling_competencies
      ? payload.struggling_competencies
      : [];
    let strugglingCompetencyPayload = [];
    if (strugglingCompetency && strugglingCompetency.length) {
      strugglingCompetency.forEach(grade => {
        strugglingCompetencyPayload.pushObject(
          Ember.Object.create({
            gradeId: grade.grade_id,
            grade: grade.grade,
            gradeSeq: grade.grade_Seq,
            description: grade.description,
            fwCode: grade.fw_code,
            domains: serialize.normalizeDomains(grade.domains)
          })
        );
      });
    }
    return strugglingCompetencyPayload;
  },
  /**
   * Normalized data of struggling competency domains
   * @return {Object}
   */
  normalizeDomains(payload) {
    let domains = payload ? payload : null;
    let domainList = [];
    if (domains && domains.length) {
      domains.map(domain => {
        domainList.pushObject(
          Ember.Object.create({
            competencies: this.normalizeCompetency(domain.competencies),
            domainCode: domain.domain_code,
            domainId: domain.domain_id,
            domainName: domain.domain_name,
            domainSeq: domain.domain_seq
          })
        );
      });
    }
    return domainList;
  },

  /**
   * Normalized data of domains competencies
   * @return {Object}
   */
  normalizeCompetency(payload) {
    let competencies = payload ? payload : null;
    let competencyList = [];
    if (competencies && competencies.length) {
      competencies.map(competency => {
        competencyList.pushObject(
          Ember.Object.create({
            code: competency.comp_code,
            displayCode: competency.comp_display_code,
            name: competency.comp_name,
            sequence: competency.comp_seq,
            studentsDescription: competency.comp_student_desc,
            studentsCount: competency.student_count
          })
        );
      });
    }
    return competencyList.length
      ? competencyList.sortBy('studentsCount').reverse()
      : competencyList;
  },

  /**
   * Normalized data of student performance
   * @return {Object}
   */
  normalizeStudentsPerfomance(payload) {
    const basePath = this.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    let students = payload.students ? payload.students : [];
    let studentsList = [];
    if (students && students.length) {
      students.forEach(student => {
        const thumbnailUrl = student.thumbnail
          ? basePath + student.thumbnail
          : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
        studentsList.pushObject(
          Ember.Object.create({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            displayName: student.display_name,
            thumbnail: thumbnailUrl,
            username: student.username,
            performanceScore: student.performance
          })
        );
      });
    }
    return studentsList;
  },

  answerStrugglingCompetency(payload) {
    let struggles = payload.struggles ? payload.struggles : [];
    let strugglesList = Ember.A();
    struggles.forEach(item => {
      let struggle = {
        manifestCompCode: item.manifest_comp_code,
        manifestDisplayCode: item.manifest_comp_display_code,
        originCompCode: item.origin_comp_code,
        originDisplayCode: item.origin_comp_display_code,
        struggleCode: item.tx_struggle_code,
        struggleDesc: item.tx_struggle_desc,
        struggleDisplayText: item.tx_struggle_display_text,
        subjectCode: item.tx_subject_code
      };
      strugglesList.push(Ember.Object.create(struggle));
    });
    return strugglesList;
  },
  serializeStruggleList(params) {
    let result = { struggles: [] };
    params.struggles = params.struggles.flat(1);
    params.struggles &&
      params.struggles.forEach(item => {
        let struggle = {
          manifestCompCode: item.manifestCompCode,
          manifestDisplayCode: item.manifestDisplayCode,
          originCompCode: item.originCompCode,
          originDisplayCode: item.originDisplayCode,
          struggleCode: item.struggleCode,
          struggleDesc: item.struggleDesc,
          struggleDisplayText: item.struggleDisplayText,
          subjectCode: item.subjectCode
        };
        result.struggles.push(struggle);
      });
    return result;
  }
});
