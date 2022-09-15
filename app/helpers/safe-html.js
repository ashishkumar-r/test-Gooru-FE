import Ember from 'ember';

/**
 * Convert text to html safe text
 */
export function safeHtml(value) {
  return Ember.String.htmlSafe(value);
}

export default Ember.Helper.helper(safeHtml);
