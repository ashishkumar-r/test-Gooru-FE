import Ember from 'ember';
import { isNumeric } from './math';
import { formatTime as formatMilliseconds } from 'gooru-web/utils/utils';
import { aggregateCollectionPerformanceSummaryItems } from 'gooru-web/utils/performance-summary';
import {
  DEFAULT_IMAGES,
  EMOTION_VALUES,
  GRADING_SCALE,
  BARS_GRADING_SCALE,
  WPM_FLAG_ICON
} from 'gooru-web/config/config';

/**
 * Function for sorting strings alphabetically in ascending order
 * @param {string} a
 * @param {string} b
 * @returns {number} - -1 if 'a' should go before 'b'; 1 if 'b' should go before 'a'; or else, 0.
 */
export function alphabeticalStringSort(a, b) {
  const lowerCaseA = a.toLowerCase();
  const lowerCaseB = b.toLowerCase();
  return lowerCaseA < lowerCaseB ? -1 : lowerCaseA > lowerCaseB ? 1 : 0;
}

/**
 * Check the standards that are checkable against the codes (provided by user)
 * and disable those who are not in codes arrays.
 * @param standards
 * @param checkableStandards
 * @param codes
 */
export function checkStandards(standards, checkableStandards, codes) {
  standards.forEach(function(standard) {
    if (checkableStandards.includes(standard.get('id'))) {
      standard.set('disabled', !codes.includes(standard.get('id')));
    }
  });
}

/**
 * Formats the Unit, Lesson, Assessment and Collection label
 * @param {number} index
 * @param {string} type
 * @param {service} i18n
 */
export function courseSectionsPrefix(
  index,
  type,
  i18n,
  longName,
  lessonLabelCourseMap
) {
  index = index === null ? index : index + 1;
  var prefixIndex = index ? index : '';
  var letter;
  var sectionPrefix;
  if (longName) {
    if (lessonLabelCourseMap) {
      if (type === 'unit') {
        const i18nKey = `common.${type}`;
        letter = i18n.t(i18nKey);
        sectionPrefix = `${letter} ${prefixIndex}`;
      } else {
        sectionPrefix = `${type} ${prefixIndex}`;
      }
    } else {
      const i18nKey = `common.${type}`;
      letter = i18n.t(i18nKey);
      sectionPrefix = `${letter} ${prefixIndex}`;
    }
  } else {
    const i18nKey = `common.${type}Initial`;
    letter = i18n.t(i18nKey);
    sectionPrefix = `${letter}${prefixIndex}`;
  }

  return sectionPrefix;
}

/**
 * Formats a date into a string
 * @param {Date} date
 * @param {string} format
 */
export function formatDate(date, format, tz) {
  format = format || 'dddd, MMMM Do, YYYY h:mm A';
  return tz === 'UTC'
    ? moment(date)
      .utc()
      .format(format)
    : moment(date).format(format);
}

/**
 * Formats a date into a string
 * @param {string} strDate
 * @param {string} format
 * @return {Date}
 */
export function parseDate(strDate, format) {
  format = format || 'dddd, MMMM Do, YYYY h:mm A';
  return moment(strDate, format).toDate();
}

/**
 * Format a certain number of milliseconds to a string of the form
 * '<hours>h <min>m or <min>m <sec>s'. If the value is falsey, a string
 * with the value '--' is returned
 * @param timeInMillis - time value in milliseconds
 * @returns {String}
 */
export function formatTime(timeInMillis, hasDigit = false) {
  var result = '';
  var secs;

  if (timeInMillis) {
    secs = timeInMillis / 1000;
    const hours = secs / 3600;
    secs = secs % 3600;
    const mins = secs / 60;
    secs = secs % 60;

    if (hours >= 1) {
      result = `${Math.floor(hours)}h `;
      if (mins >= 1) {
        result += `${Math.floor(mins)}m`;
      }
    } else {
      if (mins >= 1) {
        result = `${Math.floor(mins)}m `;
      }
      if (secs >= 1) {
        result += `${hasDigit ? secs.toFixed(1) : Math.floor(secs)}s`;
      }
    }
  } else {
    result = '';
  }

  return result;
}

/**
 * Format a certain number of seconds to a string of the form
 * '<hours>h <min>m or <min>m <sec>s'. If the value is falsey, a string
 * with the value '--' is returned
 * @param timeInSeconds - time value in seconds
 * @returns {String}
 */
export function formatTimeInSeconds(timeInSeconds) {
  return formatTime(timeInSeconds * 1000);
}

/**
 * Set scope and sequence
 */
export function setScopeAndSequenceState(params) {
  let storeKey = 'SCOPE_AND_SEQUENCE_LAST_STATE';
  localStorage.setItem(storeKey, JSON.stringify(params));
}

/**
 * Get scope and sequence
 */
export function getScopeAndSequenceState() {
  let storeKey = 'SCOPE_AND_SEQUENCE_LAST_STATE';
  let ssState = localStorage.getItem(storeKey);
  return ssState ? JSON.parse(ssState) : null;
}

/**
 * Get an icon depending on whether an answer was correct or not.
 * @param {boolean} isCorrect - was the answer correct or not?
 * @returns {String} - html string
 */
export function getAnswerResultIcon(isCorrect) {
  var html;

  if (isCorrect) {
    html =
      '<span class="score answer-correct"><i class="gru-icon material-icons">done</i></span>';
  } else if (isCorrect === false) {
    html =
      '<span class="score answer-incorrect"><i class="gru-icon material-icons">clear</i></span>';
  } else {
    // Null or any other falsy value
    html = '<span class="score answer-undefined"></span>';
  }
  return html;
}

/**
 * Find the color corresponding to the grade bracket that a specific grade belongs to
 * @see gooru-web/config/config#GRADING_SCALE
 * @param grade
 * @returns {String} - Hex color value
 */
export function getGradeColor(grade) {
  var bracket = GRADING_SCALE.length - 1;
  var color = '#E3E5EA'; // Default color

  if (isNumeric(grade)) {
    for (; bracket >= 0; bracket--) {
      if (grade >= GRADING_SCALE[bracket].LOWER_LIMIT) {
        color = GRADING_SCALE[bracket].COLOR;
        break;
      }
    }
  }
  return color;
}

/**
 * Find the color corresponding to the grade bracket that a specific grade belongs to
 * @see gooru-web/config/config#BARS_GRADING_SCALE
 * @param grade
 * @returns {String} - Hex color value
 */
export function getBarGradeColor(grade) {
  var bracket = BARS_GRADING_SCALE.length - 1;
  var color = '#b8bfc4'; // Default color

  if (isNumeric(grade)) {
    for (; bracket >= 0; bracket--) {
      if (grade >= BARS_GRADING_SCALE[bracket].LOWER_LIMIT) {
        color = BARS_GRADING_SCALE[bracket].COLOR;
        break;
      }
    }
  }
  return color;
}

/**
 * Find the range corresponding to the grade bracket that a specific grade belongs to
 * @see gooru-web/config/config#BARS_GRADING_SCALE
 * @param grade
 * @returns {String} - range value
 */
export function getGradeRange(score) {
  var scaleSize = GRADING_SCALE.length - 1;
  var range = 'not-started'; // Default color

  if (isNumeric(score)) {
    for (; scaleSize >= 0; scaleSize--) {
      if (score >= GRADING_SCALE[scaleSize].LOWER_LIMIT) {
        range = GRADING_SCALE[scaleSize].RANGE;
        break;
      }
    }
  }
  return range;
}
/**
 * Find the range corresponding to the read activity level
 * @returns {String} - html string
 */
export function getReadRange(score, content) {
  if (score < content.wpm_lower_threshold_value) {
    return 'Low';
  } else if (score > content.wpm_higher_threshold_value) {
    return 'High';
  } else {
    return 'Medium';
  }
}

/**
 * Find the range corresponding to the read activity level
 * @returns {String} - html string
 */
export function getWpmIcon(score, content) {
  return WPM_FLAG_ICON[getReadRange(score, content)];
}

/**
 * Get a html of the score string.
 * @param {number} value - %value
 * @returns {String} - html string
 */
export function getScoreString(value) {
  if (typeof value === 'number') {
    var gradeColor = getGradeColor(value);
    return `<span class="score" style="background-color: ${gradeColor}">${value} %</span>`;
  }

  return '<span class="score answer-undefined"></span>';
}

/**
 * Get an icon depending on a reaction value. If the reaction value is null,
 * a dash is returned. For any other falsy value, an empty string is returned.
 * @param {Number} reactionValue
 * @returns {String} - html string
 */
export function getReactionIcon(reactionValue, basePath) {
  var html;
  if (basePath === undefined) {
    basePath = '/';
  }

  if (reactionValue) {
    var reaction = EMOTION_VALUES.filter(function(emotion) {
      return emotion.value === reactionValue;
    })[0];
    if (reaction && reaction.value && reaction.unicode) {
      html = `<div class="emotion emotion-${reaction.value}">`;
      html += '  <svg class="svg-sprite">';
      html += `    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${basePath}assets/emoji-one/emoji.svg#${reaction.unicode}"></use>`;
      html += ' </svg>';
      html += '</div>';
    } else {
      html = '<div class="align-center">&mdash;</div>';
    }
  } else if (reactionValue === null) {
    html = '<div class="align-center">&mdash;</div>';
  } else {
    html = '';
  }
  return html;
}

/**
 * Convert a number into Upper Letter
 * @param number
 * @returns {string}
 */
export function getLetter(number) {
  return String.fromCharCode(65 + number);
}

/**
 * Function for sorting numbers in ascending order
 * @param {number} a
 * @param {number} b
 * @returns {number} - -1 if 'a' should go before 'b'; 1 if 'b' should go before 'a'; or else, 0.
 */
export function numberSort(a, b) {
  a = a ? a : !!a;
  b = b ? b : !!b;
  return a - b;
}

/**
 * Generates Uuid's
 */
export function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

/**
 * Truncates a text
 * @param {string} text
 * @param {number} maxLength max allowed length for text, optional
 * @param {string} type indicates the truncate type, optional
 * @param {boolean} suffix indicates if it adds or not a suffix, default is true
 * @returns {*}
 */
export function truncate(text, maxLength, type, suffix) {
  let config = {
    //TODO product owner will provide max lengths, this will be moved to the configuration
    name: 15,
    short: 10,
    'player-nav-sm': 30,
    medium: 35,
    'collection-card-courses': 45,
    'medium-large': 100,
    large: 200
  };
  let defaultType = 'short';

  if (!text) {
    return null;
  }

  if (!maxLength && !type) {
    //default behavior
    type = defaultType;
  }

  if (type) {
    maxLength = config[type] || config[defaultType];
  }

  let addSuffix = suffix !== false;

  let truncated = text;
  if (text.length > maxLength) {
    truncated = text.substring(0, maxLength);
    if (addSuffix) {
      truncated = `${truncated}...`;
    }
  }

  return truncated;
}

/**
 * Remove html tags from text
 * @param {String} text
 * @returs {String}
 */
export function noTags(text) {
  let element = document.createElement('p');
  element.innerHTML = text;
  return $(element).text();
}

/**
 * Returns a date in utc
 * @param {Date} date
 * @returs {Moment} utc moment
 */
export function toUtc(date) {
  return date ? moment(date).utc() : date;
}

/**
 * Returns a date in timestamp
 * @param {Date} date
 * @returs {number} timestamp
 */
export function toTimestamp(date) {
  return date ? date.getTime() : date;
}

/**
 * Returns a date in timestamp
 * @param {moment} moment
 * @returs {number} timestamp
 */
export function momentToTimestamp(moment) {
  return moment ? moment.valueOf() : moment;
}

/**
 * Returns a date in local time
 * @param {number} timestamp
 */
export function toLocal(timestamp) {
  return moment.utc(timestamp).toDate();
}
/**
 * Replace / to _
 *
 */
export function normalizeQuestionTypes(questionType) {
  return questionType.replace('/', '_');
}

/**
 * check if is a config default image
 * @param {string []} config default images
 * @param {string} url of file
 */
function isDefaultImage(defaultImages, url) {
  var isDefaultImage = false;

  defaultImages.forEach(function(image) {
    if (url.indexOf(image) >= 0) {
      isDefaultImage = true;
    }
  });

  return isDefaultImage;
}

/**
 * Returns filename from url
 * @param {String} file complete url
 */
export function cleanFilename(url, cdnUrls) {
  if (url) {
    var defaultImages = Ember.$.map(DEFAULT_IMAGES, value => value);
    if (cdnUrls) {
      url = url.replace(cdnUrls.content, '');
      url = url.replace(cdnUrls.user, '');
    }
  }

  return url && !isDefaultImage(defaultImages, url)
    ? /([^/]*\/\/[^/]+\/)?(.+)/.exec(url)[2]
    : '';
}

/**
 * This function is used to clear up fields when serializing then. At the
 * BE a null field will delete the value at the repository a non present field (undefined) would be ignored (not changed).
 *
 * Returns null if value is empty or null
 * Returns undefined if value is undefined
 * Otherwise it returns value
 * @param {string} value
 */
export function nullIfEmpty(value) {
  let toReturn = value;
  if (value !== undefined) {
    toReturn = value && value.length ? value : null;
  }
  return toReturn;
}

/**
 * Returns filename with extension from a invalid url
 * @param {String} file complete url
 */
export function getFileNameFromInvalidUrl(url) {
  const regex = /\w+(?:\.\w+)*$/;
  const validURL = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/;
  var match;
  if (validURL.exec(url)) {
    match = url;
  } else {
    match = regex.exec(url);
  }

  return match;
}
/**
 * Replace math expression before save
 */
export function replaceMathExpression(text) {
  var questionText = $.parseHTML(text);
  var newQuestionText = '';
  $.each(questionText, function(i, el) {
    let latex = $(el)
      .find('.source')
      .text();
    if (latex.length > 0) {
      let mathToSave = `<span class='gru-math-expression'><span class='source' hidden>${latex}</span>$$${latex}$$</span>`;
      $(el)
        .empty()
        .append(mathToSave);
    }
    if (el.outerHTML) {
      newQuestionText = newQuestionText.concat(el.outerHTML);
    } else {
      newQuestionText = newQuestionText.concat(el.textContent);
    }
  });

  return newQuestionText;
}

/**
 * Remove html tags to validate blanks
 */
export function removeHtmlTags(text) {
  var newText;

  if (text) {
    newText = text.replace(/(<([^>]+)>)/gi, '');
  }

  return newText;
}

/**
 * Returns resource name with a protocol if it is necessary
 * @param {String} url
 * @param {boolean} addSecureProtocol
 */
export function addProtocolIfNecessary(url, addSecureProtocol) {
  const pattern = /^((http|https|ftp):\/\/)/;
  var protocol = 'http:';

  if (!pattern.test(url)) {
    //if no protocol add http/https
    if (addSecureProtocol) {
      protocol = 'https:';
    }
    return protocol + url;
  }

  return url;
}

/**
 * Check if it is a GoogleDoc
 * @param {String} asset url
 * @returns {boolean}
 */
export function checkIfIsGoogleDoc(assetUrl) {
  return (
    assetUrl.indexOf('//drive.google') !== -1 ||
    assetUrl.indexOf('//docs.google') !== -1
  );
}

/**
 * Check if the session cdn url is in the resource url
 * @param {String} resource url
 * @param {String} cdn url
 * @returns {boolean}
 */
export function checkDomains(resourceUrl, cdnUrl) {
  return resourceUrl.indexOf(cdnUrl) !== -1;
}
/**
 * Prepares student csv file data to download
 * @param {string []} assessments the metrics table headers
 * @param {string []} collectionPerformanceSummaryItems the metrics table performance data
 * @param {string []} headers (assessments/collections)
 *  @param {string} contentTitle
 */
export function prepareStudentFileDataToDownload(
  assessments,
  collectionPerformanceSummaryItems,
  headers,
  contentTitle
) {
  var dataHeaders = headers;
  const dataArray = Ember.A([]);

  assessments.sort(function(a, b) {
    return alphabeticalStringSort(a.title, b.title) * 1;
  });

  let summary = aggregateCollectionPerformanceSummaryItems(
    collectionPerformanceSummaryItems || Ember.A([])
  );

  var summaryItems = Ember.A([
    contentTitle,
    summary.get('score'),
    `${collectionPerformanceSummaryItems.length} / ${assessments.length} `,
    formatMilliseconds(summary.get('timeSpent'))
  ]);

  dataArray.push(summaryItems);

  assessments.forEach(function(assessment) {
    var collectionPerformanceSummaryItem = collectionPerformanceSummaryItems.findBy(
      'id',
      assessment.get('id')
    );
    var itemDataArray = Ember.A([
      assessment.get('title'),
      collectionPerformanceSummaryItem.get('score'),
      collectionPerformanceSummaryItem.get('status'),
      formatMilliseconds(collectionPerformanceSummaryItem.get('timeSpent'))
    ]);
    dataArray.push(itemDataArray);
  });

  return {
    fields: dataHeaders,
    data: dataArray
  };
}

/**
 * prepares collection file data
 * @param {string []} performanceDataHeaders the metrics table headers
 * @param {string []} performanceDataMatrix the metrics table performance data
 */
function collectionFileData(
  performanceDataHeaders,
  performanceDataMatrix,
  level
) {
  const performanceAverageHeaders = performanceDataMatrix.objectAt(0)
    .performanceData;
  const performanceData = performanceDataMatrix.slice(1);
  var dataHeaders = Ember.A(['Student', 'Average time']);
  var dataMatrix = Ember.A([]);
  var averageHeaders = Ember.A(['Class average']);

  let sortedData = performanceData;

  //alphabeticalStringSort
  sortedData.sort(function(a, b) {
    return alphabeticalStringSort(a.user, b.user) * 1;
  });

  performanceDataHeaders.forEach(function(headerItem, index) {
    const prefixHeader =
      level === 'course' ? `U${index + 1} ` : `L${index + 1} `;
    const timeHeader = `${prefixHeader}${headerItem.get('title')} time`;
    dataHeaders.push(timeHeader);
  });

  performanceAverageHeaders.forEach(function(avHeaderItem) {
    const time = avHeaderItem.get('timeSpent');
    averageHeaders.push(time);
  });

  dataMatrix.push(averageHeaders);

  sortedData.forEach(function(dataItem) {
    var data = Ember.A([]);
    const performanceDataContent = dataItem.performanceData;
    const student = dataItem.get('user');
    data.push(student);
    performanceDataContent.forEach(function(dataContentItem) {
      if (dataContentItem) {
        const time = `${dataContentItem.get('timeSpent')}`;
        data.push(time);
      } else {
        //this is to fill the table with blanks when there isn't dataContentItem
        data.push('');
      }
    });
    dataMatrix.push(data);
  });

  return {
    fields: dataHeaders,
    data: dataMatrix
  };
}

/**
 * prepares assessment file data
 * @param {string []} performanceDataHeaders the metrics table headers
 * @param {string []} performanceDataMatrix the metrics table performance data
 */
function assessmentFileData(
  performanceDataHeaders,
  performanceDataMatrix,
  level
) {
  const performanceAverageHeaders = performanceDataMatrix.objectAt(0)
    .performanceData;
  const performanceData = performanceDataMatrix.slice(1);
  var dataHeaders = Ember.A(['Student', 'Average score', 'Average time']);
  var dataMatrix = Ember.A([]);
  var averageHeaders = Ember.A(['Class average']);

  let sortedData = performanceData;

  //alphabeticalStringSort
  sortedData.sort(function(a, b) {
    return alphabeticalStringSort(a.user, b.user) * 1;
  });

  performanceDataHeaders.forEach(function(headerItem, index) {
    const prefixHeader =
      level === 'course'
        ? `U${index + 1} `
        : level === 'unit'
          ? `L${index + 1} `
          : `A${index + 1} `;
    const scoreHeader = `${prefixHeader}${headerItem.get('title')} score`;
    const timeHeader = `${prefixHeader}${headerItem.get('title')} time`;
    dataHeaders.push(scoreHeader);
    dataHeaders.push(timeHeader);
  });
  performanceAverageHeaders.forEach(function(avHeaderItem) {
    const score = avHeaderItem.hideScore
      ? 'N/A'
      : avHeaderItem.hasScore && avHeaderItem.hasStarted
        ? `${avHeaderItem.score}%`
        : '--%';
    const time = `${avHeaderItem.get('timeSpent')}`;
    averageHeaders.push(score);
    averageHeaders.push(time);
  });
  dataMatrix.push(averageHeaders);

  sortedData.forEach(function(dataItem) {
    var data = Ember.A([]);
    const performanceDataContent = dataItem.performanceData;
    const student = dataItem.get('user');
    data.push(student);
    performanceDataContent.forEach(function(dataContentItem) {
      if (dataContentItem) {
        const score = dataContentItem.hideScore
          ? 'N/A'
          : dataContentItem.hasScore && dataContentItem.hasStarted
            ? `${dataContentItem.score}%`
            : '--%';
        const time = `${dataContentItem.get('timeSpent')}`;
        data.push(score);
        data.push(time);
      } else {
        //this is to fill the table with blanks when there isn't dataContentItem
        data.push('');
        data.push('');
      }
    });
    dataMatrix.push(data);
  });

  return {
    fields: dataHeaders,
    data: dataMatrix
  };
}

/**
 * prepares lesson collection file data
 * @param {string []} performanceDataHeaders the metrics table headers
 * @param {string []} performanceDataMatrix the metrics table performance data
 */
function lessonCollectionFileData(
  performanceDataHeaders,
  performanceDataMatrix
) {
  const performanceAverageHeaders = performanceDataMatrix.objectAt(0)
    .performanceData;
  const performanceData = performanceDataMatrix.slice(1);
  var dataHeaders = Ember.A(['Student', 'Average score', 'Average time']);
  var dataMatrix = Ember.A([]);
  var averageHeaders = Ember.A(['Class average']);

  let sortedData = performanceData;

  //alphabeticalStringSort
  sortedData.sort(function(a, b) {
    return alphabeticalStringSort(a.user, b.user) * 1;
  });

  performanceDataHeaders.forEach(function(headerItem, index) {
    const prefixHeader = `C${index + 1} `;
    const timeHeader = `${prefixHeader}${headerItem.get('title')} time`;
    const scoreHeader = `${prefixHeader}${headerItem.get('title')} score`;
    dataHeaders.push(scoreHeader);
    dataHeaders.push(timeHeader);
  });
  performanceAverageHeaders.forEach(function(avHeaderItem) {
    const score = avHeaderItem.hideScore
      ? 'N/A'
      : avHeaderItem.hasScore && avHeaderItem.hasStarted
        ? `${avHeaderItem.score}%`
        : '--%';
    const time = `${avHeaderItem.get('timeSpent')}`;
    averageHeaders.push(score);
    averageHeaders.push(time);
  });
  dataMatrix.push(averageHeaders);

  sortedData.forEach(function(dataItem) {
    var data = Ember.A([]);
    const performanceDataContent = dataItem.performanceData;
    const student = dataItem.get('user');
    data.push(student);
    performanceDataContent.forEach(function(dataContentItem) {
      if (dataContentItem) {
        const score = dataContentItem.hideScore
          ? 'N/A'
          : dataContentItem.hasScore && dataContentItem.hasStarted
            ? `${dataContentItem.score}%`
            : '--%';
        const time = `${dataContentItem.get('timeSpent')}`;
        data.push(score);
        data.push(time);
      } else {
        //this is to fill the table with blanks when there isn't dataContentItem
        data.push('');
        data.push('');
      }
    });
    dataMatrix.push(data);
  });

  return {
    fields: dataHeaders,
    data: dataMatrix
  };
}

/**
 * prepares csv file data to download
 * @param {string []} performanceDataHeaders the metrics table headers
 * @param {string []} performanceDataMatrix the metrics table performance data
 * @param {string} filterBy (assessments/collections)
 * @param {boolean} lessonLevel indicates if it is in the lesson level
 */
export function prepareFileDataToDownload(
  performanceDataHeaders,
  performanceDataMatrix,
  filterBy,
  level
) {
  if (filterBy === 'collection') {
    if (level === 'lesson') {
      return lessonCollectionFileData(
        performanceDataHeaders,
        performanceDataMatrix
      );
    } else {
      return collectionFileData(
        performanceDataHeaders,
        performanceDataMatrix,
        level
      );
    }
  } else {
    return assessmentFileData(
      performanceDataHeaders,
      performanceDataMatrix,
      level
    );
  }
}

/**
 * Removes blanks and transforms to lower case the file name
 * @param {String} fileName
 */
export function createFileNameToDownload(fileName) {
  var newName;

  if (fileName) {
    newName = fileName.toLowerCase().replace(/ /g, '');
  }

  return newName;
}

/**
 * Returns true if url belongs to youtube or vimeo
 * @param {String} url
 */
export function isVideoURL(url) {
  var vimeoYoutubeRegularExpression = /^(https?:\/\/)?(www\.)?(?:(vimeo)\.com\/|(youtube)\.com\/|(youtu)\.be\/)/;
  var match = vimeoYoutubeRegularExpression.test(url);
  return match;
}

/**
 * Returns true if url belongs to youtube or vimeo
 * @param {String} url
 */
export function isYouTubeURL(url) {
  var vimeoYoutubeRegularExpression = /^(https?:\/\/)?(www\.)?(?:(youtube)\.com\/|(youtu)\.be\/)/;
  var match = vimeoYoutubeRegularExpression.test(url);
  return match;
}

/**
 * Gets and array and returns an array containing arrays of the specified size
 * @param {Array} array The aray do be divided
 * @param {Number} chunkSize the size of the chunks
 */
export function arrayChunks(array, chunkSize) {
  const chunkLength = Math.max(array.length / chunkSize, 1);
  let chunks = Ember.A([]);
  for (var i = 0; i < chunkSize; i++) {
    if (chunkLength * (i + 1) <= array.length) {
      chunks.push(array.slice(chunkLength * i, chunkLength * (i + 1)));
    }
  }
  return chunks;
}

/**
 * Determine the upload type object (@see gooru-web/config/config#UPLOAD_TYPES) based on a file name extension.
 * @param {String} filename -Complete file name (including the extension)
 * @param {Object[]} uploadTypes
 * @return {Object}
 */
export function inferUploadType(filename, uploadTypes) {
  var extension = filename.substr(filename.lastIndexOf('.'));
  var selectedType = null;

  for (let i = uploadTypes.length - 1; i >= 0; i--) {
    let type = uploadTypes[i];
    if (type.validExtensions.indexOf(extension) >= 0) {
      selectedType = type;
      break;
    }
  }
  return selectedType;
}

/**
 * Check both without [] and empty []
 * @param {String} text - Text to validate for square brackets
 * @return {Boolean}
 */
export function validateSquareBracket(text) {
  return !/\[\]/g.test(text) && /(\[[^\]]+\])/g.test(text);
}

/**
 * Get current page URL string after last /
 * @return {String}
 */
export function getCurrentPage() {
  let currentHref = window.location.href;
  return currentHref.substring(currentHref.lastIndexOf('/') + 1);
}

/**
 * Method to get Resource and Question count
 */
export function getContentCount(data) {
  let resourceCount = 0;
  let questionCount = 0;
  if (Ember.isArray(data)) {
    data.map(contentItem => {
      contentItem.content_format === 'resource'
        ? resourceCount++
        : questionCount++;
    });
  }
  return {
    resourceCount: resourceCount,
    questionCount: questionCount
  };
}

/**
 * It is used to read the params from browser url path
 * @param  {String} name Name of the parameter
 * @param  {String} url  URL String which needs to be parse and get value.
 */
export function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[[]]/g, '\\$&');
  var regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Find the route path first occurrence
 * @return {String}
 */
export function getRoutePathFirstOccurrence() {
  let currentLocationPath = window.location.pathname;
  return currentLocationPath.split('/')[2];
}

/**
 * Extract subject id by ignoring framework code, if available
 * @return {String}
 */
export function getSubjectIdFromSubjectBucket(subjectBucket) {
  let subjectBucketSize = subjectBucket.split('.');
  let taxonomySubject = subjectBucket;
  if (subjectBucketSize.length > 2) {
    //subject with framework
    taxonomySubject = subjectBucket.substring(subjectBucket.indexOf('.') + 1);
  }
  return taxonomySubject;
}

/**
 * Find number of months between two dates
 * @return {Number}
 */
export function diffMonthBtwTwoDates(date1, date2) {
  let diff = (date1.getTime() - date2.getTime()) / 1000;
  diff /= 60 * 60 * 24 * 7 * 4;
  let monthsDiff = Math.abs(Math.round(diff));
  return monthsDiff > 0 ? monthsDiff - 1 : monthsDiff;
}

/**
 * Validate percentage should be between 0 and 100 and decimals should not be more than two digits
 * @return {Boolean}
 */
export function validatePercentage(number) {
  let isValidPercentValue = false;
  let isNumber = !isNaN(number);
  if (isNumber) {
    let parsedNumber = parseFloat(number);
    let isValidPercent = parsedNumber >= 0 && parsedNumber <= 100;
    if (isValidPercent) {
      isValidPercentValue = true;
      let isDecimalNumberAvailable = number.indexOf('.');
      if (isDecimalNumberAvailable > 0) {
        let decimalNumbers = number.substring(isDecimalNumberAvailable + 1);
        isValidPercentValue =
          decimalNumbers.length > 0 && decimalNumbers.length < 3;
      }
    }
  }
  return isValidPercentValue;
}

/**
 * Validate time
 * hour should be between 0 and 24
 * min should be between 0 and 60
 * @return {Boolean}
 */
export function validateTimespent(hour, min) {
  let isValidTime = false;
  if (hour || min) {
    let parseHour = hour ? hour.toString().padStart(2, '0') : '00';
    let parseMin = min ? min.toString().padStart(2, '0') : '00';
    isValidTime = moment(`${parseHour}:${parseMin}`, 'HH:mm', true).isValid();
  }
  return isValidTime;
}

/**
 * Evaluate whether the current device is mobile version or not
 * @return {Boolean}
 */
export function isCompatibleVW(screenSize) {
  let currentVW = window.screen.width;
  return currentVW <= screenSize;
}

/**
 * Evaluate whether the value or key is exists in array or nit
 * @return {Boolean}
 */
export function isExistInArray(array, keyValue, keyFieldName) {
  return !!array.findBy(keyFieldName, keyValue);
}

/**
 * Returs OA SubType
 * @return {Ember.A[]}
 */
export function getOASubType() {
  return Ember.A([
    Ember.Object.create({
      display_name: 'image',
      code: '1',
      mimeType: 'image/*'
    }),
    Ember.Object.create({
      display_name: 'pdf',
      code: '2',
      mimeType: 'application/pdf'
    }),
    Ember.Object.create({
      display_name: 'presentation',
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }),
    Ember.Object.create({
      display_name: 'document',
      code: '4',
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }),
    Ember.Object.create({
      display_name: 'others',
      code: '5',
      mimeType: 'application/pdf,image/*'
    })
  ]);
}

/**
 * Returs OA Type
 * @return {Ember.A[]}
 */
export function getOAType() {
  return Ember.A([
    {
      display_name: 'remote',
      code: '0'
    },
    {
      display_name: 'uploaded',
      code: '1'
    }
  ]);
}

/**
 * Returs File Type
 * @return {Ember.A[]}
 */
export function getFileType() {
  return Ember.A([
    {
      display_name: 'remote',
      code: '0'
    },
    {
      display_name: 'uploaded',
      code: '1'
    }
  ]);
}
/**
 * @function getTimeInMillisec
 * @param {Number} hour
 * @param {Number} minute
 * @return {Number}
 * Method to convert given hour and minute into milliseconds
 */
export function getTimeInMillisec(hour = 0, minute = 0) {
  return (hour * 60 * 60 + minute * 60) * 1000;
}

/**
 * @function getWeekDaysByDate
 * @param {string} date
 * @return {Array}
 * Method to get week days for given date
 */
export function getWeekDaysByDate(date, formatDate = 'YYYY/MM/DD') {
  let dateformat = 'YYYY/MM/DD';
  let parsedDate = date ? moment(date, dateformat) : moment(),
    weeklength = 7,
    result = [];
  parsedDate = parsedDate.startOf('week');
  while (weeklength--) {
    result.push(moment(parsedDate.format(dateformat)).format(formatDate));
    parsedDate.add(1, 'day');
  }
  return result;
}
/**
 * @function isValidEmailId
 * @param {String} emailId
 * @return {Boolean}
 * Method to validate whether the given string is valid email id or not
 */
export function isValidEmailId(emailId = '') {
  let emailPattern = RegExp(
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i
  );
  return emailPattern.test(emailId);
}

/**
 * @function appLocales
 * Returns list of locales configured
 */
export function appLocales() {
  return Ember.A([
    {
      en: 'English',
      langCode: 'en',
      id: 'en',
      isActive: true
    },
    {
      sp: 'Español',
      langCode: 'es',
      id: 'sp',
      isActive: true
    },
    {
      ar: 'عربى',
      langCode: 'ar',
      id: 'ar',
      isActive: true
    },
    {
      mr: 'मराठी',
      langCode: 'mr',
      id: 'mr',
      isActive: true
    },
    {
      kn: 'ಕನ್ನಡ',
      langCode: 'kn',
      id: 'kn',
      isActive: true
    },
    {
      hi: 'हिंदी',
      langCode: 'hi',
      id: 'hi',
      isActive: true
    },
    {
      as: 'অসমীয়া',
      langCode: 'as',
      id: 'as',
      isActive: true
    },
    {
      bn: 'বাংলা',
      langCode: 'bn',
      id: 'bn',
      isActive: true
    },
    {
      gu: 'ગુજરાતી',
      langCode: 'gu',
      id: 'gu',
      isActive: true
    },
    {
      ml: 'മല്യാലം',
      langCode: 'ml',
      id: 'ml',
      isActive: true
    },
    {
      or: ' ଓଡ଼ିଆ',
      langCode: 'or',
      id: 'or',
      isActive: true
    },
    {
      pa: 'ਪੰਜਾਬੀ',
      langCode: 'pa',
      id: 'pa',
      isActive: true
    },
    {
      ta: 'தமிழ்',
      langCode: 'ta',
      id: 'ta',
      isActive: true
    },
    {
      te: 'తెలుగు',
      langCode: 'te',
      id: 'te',
      isActive: true
    },
    {
      ch: '中文',
      langCode: 'zh',
      id: 'ch',
      isActive: true
    },
    {
      af: 'Afrikaans',
      langCode: 'af',
      id: 'af',
      isActive: false
    }
  ]);
}

//TODO Need to improve this method to perform multiple levels of cloning
/**
 * @function getObjectCopy
 * @param {Object} originalObject
 * @return {Ember.Object} clonedObject
 * Method to perform object copy
 */
export function getObjectCopy(originalObject) {
  let clonedObject = Ember.Object.create();
  let objectKeys = Object.keys(originalObject);
  objectKeys.map(key => {
    clonedObject.set(`${key}`, originalObject[key]);
  });
  return clonedObject;
}

/**
 * @function getObjectsDeepCopy
 * @param {Array} objectElements
 * @return {Ember.Array} clonedObjectElements
 * Method to perform deep copy of list of objects
 */
export function getObjectsDeepCopy(objectElements) {
  let clonedObjectElements = Ember.A([]);
  if (Ember.isArray(objectElements)) {
    objectElements.map(originalObject => {
      clonedObjectElements.pushObject(getObjectCopy(originalObject));
    });
  }
  return clonedObjectElements;
}

/**
 * Different color range based on status
 * @type {Object}
 */
export var colorsBasedOnStatus = Ember.Object.create({
  '0': '#e7e8e9', // Not started
  '1': '#1aa9eb', //in-progress
  '2': '#1d7dc2', //Mastered
  '3': '#1d7dc2',
  '4': '#1d7dc2',
  '5': '#1d7dc2'
});

/**
 *  formatimeToDateTime
 * @type {String}
 */
export function formatimeToDateTime(date = null, time) {
  if (date) {
    return moment(`${date} ${time}`, 'YYYY-MM-DD hh:mm a')
      .utc()
      .format('YYYY-MM-DD[T]HH:mm:ssZ');
  }
  return moment(time, 'hh:mm a')
    .utc()
    .format('YYYY-MM-DD[T]HH:mm:ssZ');
}

/**
 *  formatimeToDateTime
 * @type {String}
 */
export function dateTimeToTime(value) {
  const endTime = moment
    .utc(value)
    .local()
    .format('hh:mm A');
  return endTime;
}
/**
 * Returs File SubType
 */
export function getFileSubType(value) {
  let subtype = '';
  if (
    value === 'image/jpeg' ||
    value === 'image/svg+xml' ||
    value === 'image/png'
  ) {
    subtype = 'image';
  } else if (value === 'application/pdf') {
    subtype = 'pdf';
  } else if (value === 'application/msword') {
    subtype = 'document';
  } else if (value === 'application/vnd.ms-powerpoint') {
    subtype = 'presentation';
  } else {
    subtype = 'others';
  }
  return subtype;
}
/**
 *validating URL path location
 */
export function validURL(location) {
  var isValidLocation = location.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g
  );
  return (
    (location.indexOf('https://') !== -1 ||
      location.indexOf('http://') !== -1) &&
    isValidLocation !== null
  );
}

/**
 * @function sec2time
 * @param {number} seconds
 * @return {Time} time
 * Method help to convert seconds to time format
 */
export function sec2time(timeInSeconds) {
  var pad = function(num, size) {
      return `000${num}`.slice(size * -1);
    },
    time = parseFloat(timeInSeconds).toFixed(3),
    hours = Math.floor(time / 60 / 60),
    minutes = Math.floor(time / 60) % 60,
    seconds = Math.floor(time - minutes * 60);

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`;
}
/**
 * @function etlfocusout()
 * @param {number} hours
 * @param {number} minutes
 * @return {Seconds} Seconds
 * Method help to focus event
 */
export function etlFocusOut(hrs, mins, data) {
  data.set('isErrorMessage', false);
  let hours = hrs.val();
  let minutes = mins.val();
  let etlSplHrs = hours.split(' ');
  let etlSplMins = minutes.split(' ');
  hours = etlSplHrs[0];
  minutes = etlSplMins[0];
  const etlHours = hours === 'hr' || hours === 'hrs' ? '' : hours;
  const etlMinutes = minutes === 'min' || minutes === 'mins' ? '' : minutes;
  const hoursTitle = etlHours > 1 ? 'hrs' : 'hr';
  const minuteTitle = etlMinutes > 1 ? 'mins' : 'min';
  if (etlHours.length || etlMinutes.length) {
    let estimatedHours =
      etlHours && etlHours.length ? `${etlHours} ${hoursTitle}` : '';
    let estimatedMinutes =
      etlMinutes && etlMinutes.length ? `${etlMinutes} ${minuteTitle}` : '';
    hrs.val(estimatedHours);
    mins.val(estimatedMinutes);
  }
  if (etlHours.length && etlHours <= 0 && etlMinutes <= 0) {
    data.set('isErrorMessage', true);
  }
}
/**
 * @function etlfocus()
 * @param {number} hours
 * @param {number} minutes
 * @return {Seconds} Seconds
 * Method help to focus event
 */
export function etlFocus(hrs, mins) {
  const hours = hrs.val();
  const minutes = mins.val();
  const etlHours = hours.split(' ');
  const etlMinutes = minutes.split(' ');
  hrs.val(etlHours[0]);
  mins.val(etlMinutes[0]);
}
/**
 * @function etlSecCalculation()
 * Method help to focus event
 */
export function etlSecCalculation(data, etlHrs, etlMins) {
  const hours =
    etlHrs && etlHrs.split('hr')
      ? etlHrs.split('hr')
      : etlHrs && etlHrs.split('hrs')
        ? etlMins && etlMins.split('hrs')
        : null;
  const minutes =
    etlMins && etlMins.split('min')
      ? etlMins.split('min')
      : etlMins && etlMins.split('mins')
        ? etlMins && etlMins.split('mins')
        : null;
  const etlHours = hours && hours[0] ? hours[0] : null;
  const etlMinutes = minutes && minutes[0] ? minutes[0] : null;
  const defSeconds = '00';
  const etlSeconds = +etlHours * 60 * 60 + +etlMinutes * 60 + +defSeconds;
  const estimatedTime = etlSeconds === 0 ? null : etlSeconds;
  data.set('author_etl_secs', estimatedTime);
}
/**
 * @function serializeEtlSec()
 * Method help to convert seconds to hours and minutes
 */
export function serializeEtlSec(etlSeconds) {
  const hours = Math.floor(etlSeconds / (60 * 60));
  const divisor_for_minutes = etlSeconds % (60 * 60);
  const minutes = Math.floor(divisor_for_minutes / 60);
  const hoursTitle = hours > 1 ? 'hrs' : 'hr';
  const minuteTitle = minutes > 1 ? 'mins' : 'min';
  const etlHours = Number.isNaN(hours) ? '' : `${hours} ${hoursTitle}`;
  const etlMinutes = Number.isNaN(minutes) ? '' : `${minutes} ${minuteTitle}`;
  return {
    etlHours: etlHours,
    etlMinutes: etlMinutes
  };
}

/**
 * @function getSelectionList()
 * Method help to get active text, start, end, position
 */
export function getSelectionList(nodesList) {
  let selectionItem = [];
  let count = 0;
  let spanPosition = 0;
  if (nodesList.length) {
    nodesList.forEach(item => {
      let currentAns = {};
      if (item.nodeName === '#text') {
        count += item.data.length;
      }
      if (item.tagName === 'SPAN') {
        let closeItem = $(item).clone();
        $(closeItem)
          .find('.material-icons')
          .remove();
        let macronPositions = Array.from(
          $(closeItem)
            .children('.selected')
            .filter(':not(.crossed)')
        ).map(item => {
          return $(item).index();
        });
        let crossedPositions = Array.from(
          $(closeItem).children('.selected.crossed')
        ).map(item => {
          return $(item).index();
        });
        currentAns.start = count;
        currentAns.text = closeItem.text();
        currentAns.position = spanPosition;
        currentAns.macronPositions = macronPositions;
        currentAns.crossPositions = crossedPositions;
        currentAns.end = count + closeItem.text().length;
        selectionItem.push(currentAns);
        spanPosition++;
        count = 0;
      }
    });
  }
  return selectionItem;
}

/**
 * @function inputField()
 * Method to validate hh:mm:ss
 */
export function validateHhMmSs(inputField) {
  var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(
    inputField
  );
  return isValid;
}
/**
 * @function getDiff()
 * Method help time difference between two event
 */
export function getDiff(e, Obj) {
  return (
    (e.type === 'touchend' && Obj.touchend - Obj.touchstart < 150) ||
    e.type === 'mouseup'
  );
}

/**
 * @function getNavigatorSwitchKey
 * Method help to generate name for the switch app
 */
export function getNavigatorSwitchKey(id) {
  return `switch_navigator_app_${id}`;
}

/**
 * @function isSwitchedLearner
 * Method help identify is learner or instructor
 */
export function isSwitchedLearner(id) {
  return (
    window.localStorage.getItem(getNavigatorSwitchKey(id)) &&
    window.localStorage.getItem(getNavigatorSwitchKey(id)) === 'true'
  );
}

/**
 * @function isEmptyValue
 * Method help identify is object or value is empty
 */
export function isEmptyValue(value) {
  if (
    value === '' ||
    value === undefined ||
    value === 0 ||
    value === null ||
    (typeof value === 'number' && isNaN(value))
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * @function setDownloadPathForReference()
 * Method help to check cdn url
 */
export function setDownloadPathForReference(reference) {
  if (reference) {
    reference.map(item => {
      if (item.location.indexOf('cdn.gooru.org') > -1) {
        item.set('isShowIcon', true);
      }
      const url = item.location
        .replace('https://cdn.gooru.org/', '/download/')
        .replace('http://cdn.gooru.org/', '/download/')
        .replace('//cdn.gooru.org/', '/download/');
      item.set('locationPath', url);
    });
  }
}
/**
 * @function setDownloadPathForUrl()
 * Method help to check cdn url
 */
export function setDownloadPathForUrl(url) {
  if (url) {
    const fileName = url
      .replace('https://cdn.gooru.org/', '/download/')
      .replace('http://cdn.gooru.org/', '/download/')
      .replace('//cdn.gooru.org/', '/download/');
    return fileName;
  }
}

/* eslint-disable */
/*eslint eqeqeq: "off"*/
/**
 * @function downloadAllSubmision()
 */
export function downloadAllSubmision(url, fileName, studName, isBulkUrl) {
  var zip = new JSZip();
  const urls = url;
  var zipFilename = `${fileName}.zip`;
  let urlPromise = urls.map(function(url) {
    return new Promise(resolve => {
      JSZipUtils.getBinaryContent(url.fileUrl, function(err, data) {
        const orginalFileName = url.orginalFileName
          ? url.orginalFileName.split('.')[0]
          : url.fileUrl
              .split('/')
              .pop()
              .split('.')[0];

        const type = url.orginalFileName
          ? url.orginalFileName.split('.')[1]
          : url.fileUrl
              .split('/')
              .pop()
              .split('.')[1];
        const userName = url && url.userName ? url.userName : studName;
        const questionSequenceCode = url.sequenceCode ? url.sequenceCode : '';
        if (err) {
          throw err; // or handle the error
        }
        if (isBulkUrl) {
          const filename = `${questionSequenceCode}_${orginalFileName}.${type}`;
          zip.folder(userName).file(filename, data, { binary: true });
        } else {
          const filename = `${userName}_${questionSequenceCode}_${orginalFileName}.${type}`;
          zip.file(filename, data, { binary: true });
        }
        resolve(zip);
      });
    });
  });
  Promise.all(urlPromise).then(() => {
    zip.generateAsync({ type: 'blob' }).then(function(blob) {
      saveAs(blob, zipFilename);
    });
  });
}

/**
 * Method to get taxonomy ids
 */
export function getTaxonomyIds(content, isInsideArray) {
  let taxonomyIds = [];
  let contentStandards = content.standards;
  let taxonomyId = contentStandards.map(data => data.taxonomyId);
  taxonomyIds = taxonomyIds.concat(taxonomyId);
  if (isInsideArray) {
    let resources = content.children;
    taxonomyIds = taxonomyIds.concat(taxonomyId);
    resources.map(resource => {
      taxonomyId = resource.standards.map(data => data.taxonomyId);
      taxonomyIds = taxonomyIds.concat(taxonomyId);
    });
  }
  return taxonomyIds;
}

/**
 * Method to get taxonomy ids
 */
export function getTaxonomyIdsBySearchContent(searchContents, isInsideArray) {
  let taxonomyIds = [];
  searchContents.map(searchData => {
    let standards = searchData.standards || searchData.taxonomy;
    let taxonomyId = standards.map(data => data.taxonomyId);
    taxonomyIds = taxonomyIds.concat(taxonomyId);
    if (isInsideArray) {
      taxonomyId = searchData.collection.standards.map(data => data.taxonomyId);
      taxonomyIds = taxonomyIds.concat(taxonomyId);
    }
  });
  return taxonomyIds;
}
