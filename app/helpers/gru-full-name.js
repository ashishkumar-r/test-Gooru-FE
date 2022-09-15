import Ember from 'ember';

/**
 * Data aware helper
 * Returns full name of user having following rules
 * @param {object} user user object
 * @param {int} len number of chars to keep, rest of them are truncated and a dot '.' char is shown
 */
export function gruFullName(user, maxLength = 19) {
  let userName = '';
  maxLength = isNaN(maxLength) ? 19 : maxLength;
  if (user) {
    user = Array.isArray(user) ? user[0] : user;
  } else {
    return userName;
  }
  if (user.firstName || user.lastName) {
    userName = `${user.lastName}, ${user.firstName}`;
  } else if (user.email) {
    userName = user.email;
  } else {
    userName = user.id;
  }
  if (userName.length > maxLength) {
    userName = userName.substr(0, maxLength);
    userName = `${userName}..`;
  }
  return userName;
}

export default Ember.Helper.helper(gruFullName);
