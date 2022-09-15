/**
 * @function getTenantFwPrefBySubject
 * @param {String} assSubject
 * @param {Object} tenantFwPref
 * @return {Array}
 * Method to get an array of frameworks
 * which are mapped with given subject as tenant pref
 */
export function getTenantFwPrefBySubject(assSubject, tenantFwPref) {
  let fwSubject = [];
  if (tenantFwPref) {
    const subjectFramework = tenantFwPref[assSubject];
    fwSubject = subjectFramework ? subjectFramework.fw_ids : [];
  }
  return fwSubject;
}

/**
 * @function getMinScoreByTenantFwSub
 * @param {String} fwSub
 * @param {Number | NULL} minScores
 * Method to get MinScore by matching tenant's subject framework otherwise null
 */
export function getMinScoreByTenantFwSub(fwSub, minScores) {
  if (minScores && fwSub) {
    return parseFloat(minScores[fwSub]);
  }
  return null;
}

/**
 * @function concatFwSub
 * @param {String} fw
 * @param {String} sub
 * @return {String}
 * Method to concat framework with subject
 */
export function concatFwSub(fw = '', sub = '') {
  return `${fw}.${sub}`;
}

/**
 * @function getMasteryMinScore
 * @param {String} assSubject
 * @param {Object} classPreference
 * @param {Object} tenantSetting
 * @return {Number} masteryMinScore
 * Method to get mastery min score by matching class preferency if any,
 * otherwise look into tenant's subject framework preferences
 */
export function getMasteryMinScore(
  assSubject,
  classPreference = {},
  tenantSetting
) {
  let frameworks = [];
  const tenantSubFwPref = tenantSetting.tw_fw_pref;
  if (classPreference && classPreference.subject && classPreference.framework) {
    if (classPreference.subject === assSubject && classPreference.framework) {
      frameworks = [classPreference.framework];
    } else {
      frameworks = getTenantFwPrefBySubject(assSubject, tenantSubFwPref);
    }
  } else if (tenantSubFwPref) {
    frameworks = getTenantFwPrefBySubject(assSubject, tenantSubFwPref);
  }
  let minScore = tenantSetting.competency_completion_default_min_score || 0;
  const competencyCompletionMinScores =
    tenantSetting.competency_completion_min_score;
  frameworks.forEach(framework => {
    const masteryMinScore = getMinScoreByTenantFwSub(
      concatFwSub(framework, assSubject),
      competencyCompletionMinScores
    );
    if (masteryMinScore) {
      minScore = masteryMinScore;
    }
  });
  return parseFloat(minScore);
}
