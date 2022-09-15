import Ember from 'ember';
import { getReactionIcon } from 'gooru-web/utils/utils';

/**
 * Get an icon depending on a emotion value (@see /app/config/config.js#L33)
 *
 * @param {[]} params
 * @returns {String} - html string
 */
export function reactionIcon(params) {
  const reactionValue = params[0];
  const basePath = params.length > 1 ? params[1] : undefined;
  return Ember.String.htmlSafe(getReactionIcon(reactionValue, basePath));
}

export default Ember.Helper.helper(reactionIcon);
