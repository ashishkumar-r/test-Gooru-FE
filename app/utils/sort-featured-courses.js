import Ember from 'ember';

/**
 * Utility methods to handle course ordering for Featured Courses
 */

/**
  * Ordered and unique subjects for an array of Courses
  * @param {Course[]} featured courses
  * @prop {Course[]} ordered featured course subjects
  */
export function getSubjects(courses) {
  var subjects = Ember.A([]);
  courses
    .map(course =>
      Ember.Object.create({
        subject: course.subject,
        subjectSequence: course.subjectSequence,
        taxonomySubject: course.subjectName
      })
    )
    .filter(course => !!course.get('taxonomySubject'))
    .forEach(function(course) {
      if (!subjects.findBy('taxonomySubject', course.get('taxonomySubject'))) {
        subjects.push(course);
      }
    });
  subjects = subjects.sortBy('subjectSequence');
  // Create an additional bucket for courses that don't have taxonomy data
  subjects.unshift(
    Ember.Object.create({
      subject: '',
      subjectSequence: 0,
      taxonomySubject: null
    })
  );
  return subjects;
}

/**
 * @param {Course[]} featured courses
 * @return {Course[]} featured courses ordered by subjects
 */
export function sortFeaturedCourses(courses) {
  let result = getSubjects(courses).map(subjectBucket =>
    courses.filter(
      course => course.subjectName === subjectBucket.taxonomySubject
    )
  );
  return result.map(arrayOfCourses =>
    arrayOfCourses.sort((a, b) => a.sequence - b.sequence)
  );
}

/**
 * @param {Course[]} list of courses
 * @return {Course[]} list of courses ordered by subjects
 */
export function sortCoursesBySubject(courses) {
  /**
   * Ordered and unique subjects for an array of Courses
   * @param {Course[]} featured courses
   * @prop {Course[]} ordered featured course subjects
   */
  function getSubjectBuckets(courses) {
    let result = courses
      .map(course =>
        Ember.Object.create({
          subject: course.subject,
          subjectSequence: course.subjectSequence
        })
      )
      .filter(
        (elem, pos, list) =>
          list.reduce(
            (result, e, i) =>
              result < 0 && e.subject === elem.subject ? i : result,
            -1
          ) === pos
      );
    return result.sort((a, b) => a.subjectSequence - b.subjectSequence);
  }

  let result = getSubjectBuckets(courses).map(subjectBucket =>
    courses.filter(course => course.subject === subjectBucket.subject)
  );
  return result.map(arrayOfCourses =>
    arrayOfCourses.sort((a, b) => a.sequence - b.sequence)
  );
}
