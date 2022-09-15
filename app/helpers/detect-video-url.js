import Ember from 'ember';
import { isVideoURL } from 'gooru-web/utils/utils';

/**
 * Returns true if url belongs to youtube or vimeo
 * @param {String} url
 */
export function detectVideoURL(url) {
  return isVideoURL(url);
}

export default Ember.Helper.helper(detectVideoURL);
