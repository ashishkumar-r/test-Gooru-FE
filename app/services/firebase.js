import Ember from 'ember';
import { jwt_decode } from 'ember-cli-jwt-decode';
/*global firebase:true*/
/**
 * @typedef {Object} FirebaseService
 */
export default Ember.Service.extend({
  session: Ember.inject.service('session'),

  firebaseApp: Ember.inject.service(),

  init: function() {
    this._super(...arguments);
  },

  /**
   * Submit a new message
   *
   * @param current user data, list of channels, and message to be sent
   *
   * @returns void
   */
  submitMessage: function(currentUser, channels, message) {
    if (message === null || message === '') {
      return;
    }
    const db = this.get('firebaseApp').database();
    const channelId = channels[0].uuid;
    let role = null;
    if (currentUser.role === 'teacher') {
      role = 'teacher';
    } else {
      role = 'student';
    }
    var user = this.get('firebaseApp').auth().currentUser;
    if (user) {
      var fullname = `${currentUser.firstName} ${currentUser.lastName}`;
      var photo = currentUser.avatarUrl;
      var messageRef = db.ref().child(`messages/${channelId}`);
      var newKey = messageRef.push().key;
      db.ref(`messages/${channelId}/${newKey}`).set({
        message: message,
        username: this.get('session.userData.username'),
        userId: this.get('session.userData.gooruUId'),
        fullname: fullname,
        photo: photo,
        createdTime: firebase.database.ServerValue.TIMESTAMP,
        messageId: newKey,
        role: role === 'teacher' ? role : null,
        editing: false
      });
      //Move the location in message pane to the bottom
      Ember.run.later(function() {
        $('.message-row-container').scrollTop(
          $('.message-row-container-inner').height()
        );
      }, 100);
      this.set('message', '');
    }
  },

  //submit a file to firebase storage
  submitFile: function(currentUser, channels, fileToSend) {
    if (fileToSend === null || fileToSend === undefined) {
      return;
    }
    const db = this.get('firebaseApp').database();
    const storage = this.get('firebaseApp').storage();
    const channelId = channels[0].uuid;
    let role = null;
    if (currentUser.role === 'teacher') {
      role = 'teacher';
    } else {
      role = 'student';
    }
    var user = this.get('firebaseApp').auth().currentUser;
    //Only allow this functionality if the user is signed into firebase
    if (user) {
      //Gather document information
      let image = fileToSend;
      let file = image.files[0];
      var fullname = `${currentUser.firstName} ${currentUser.lastName}`;
      var photo = currentUser.avatarUrl;
      //var currentUser = user;
      //Create a reference to the messages table for this particular channel
      var messageRef = db.ref().child(`messages/${channelId}`);
      var newKey = messageRef.push().key;
      //store the file onto firebase storage based on the current user's id
      storage
        .ref(`${currentUser.uid}/${Date.now()}/${file.name}`)
        .put(file, { contentType: file.type })
        .then(
          function(snapshot) {
            var filePath = snapshot.metadata.fullPath;

            db.ref().child(`messages/${channelId}/${newKey}`).set({
              username: this.get('session.userData.username'),
              userId: this.get('session.userData.gooruUId'),
              fullname: fullname,
              message: storage.ref(filePath).toString(),
              photoUrl: file,
              photo: photo,
              fileType: file.type,
              fileSize: file.size,
              fileName: file.name,
              messageId: newKey,
              createdTime: firebase.database.ServerValue.TIMESTAMP,
              role: role === 'teacher' ? role : null
            });
          }.bind(this)
        );
    }
  },
  //remove a message from firebase
  removeMessage: function(message, channels) {
    if (message === null || message === undefined) {
      return;
    }
    const auth = this.get('firebaseApp').auth();
    const db = this.get('firebaseApp').database();
    const channelId = channels[0].uuid;
    //Check user id against authenticated firebase id - if it's the same then we can remove the message
    if (message.userId === auth.currentUser.uid) {
      db.ref().child(`messages/${channelId}/${message.messageId}`).remove();
      //return from this method since we are done
      return;
    }
    //Decode the JWT provided to firebase - need to look into the users role
    auth.currentUser.getToken().then(function(val) {
      var decodedVal = jwt_decode(val);
      //if the user is a teacher, then we allow them to remove anyones message
      if (decodedVal.user_category === 'teacher') {
        db.ref().child(`messages/${channelId}/${message.messageId}`).remove();
      }
    });
  },

  //generate the JWT needed by firebase
  generateJWT: function() {
    //create objects for the authentication, and database services
    const auth = this.get('firebaseApp').auth();
    const db = this.get('firebaseApp').database();
    var token = {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
    const options = {
      type: 'GET',
      headers: token
    };
    //Validating user and generating JWT
    Ember.$.ajax('/api/nucleus/v1/firebase/jwt', options).then(function(val) {
      const jwt = val.jwt;
      /*
      * If the user is not logged in, then we log them into Firebase. First we setup the listener so that after
      * the user is logged into firebase, we then create a representation for the user in the user
      * table in the firebase database.
      */
      auth.onAuthStateChanged(function(user) {
        if (user) {
          //create user in database if not present
          var userRef = db.ref().child('users/');
          userRef.once('value').then(function(snapshot) {
            var userID = user.uid;
            auth.currentUser.getToken().then(function(val) {
              var decodedVal = jwt_decode(val);
              if (!snapshot.hasChild(userID)) {
                var postData = {
                  uuid: user.uid,
                  fullname: `${decodedVal.firstname} ${decodedVal.lastname}`,
                  user_category: decodedVal.user_category
                };
                db.ref(`users/${user.uid}`).set(postData);
              }
            });
          });
        } else {
          // User needs to be signed in using custom authentication - uses the uid set in the JWT
          auth.signInWithCustomToken(jwt);
        }
      });
    });
  },

  //perform checks to create appropriate representations for a class in firebase DB
  createClassRepresentation: function(classId, aClass, userInfo) {
    const db = this.get('firebaseApp').database();
    const auth = this.get('firebaseApp').auth();
    //Create a reference to the channel table in firebase for this particular class
    var channelRef = db.ref().child('channels/');
    //We will grab all existing channels once to perform a simple check
    channelRef.once('value').then(function(snapshot) {
      //Check to see if a representation for the class exist in the channel table - if not, we create a new channel (default)
      if (!snapshot.hasChild(classId)) {
        var creator = aClass.creatorId;
        const classId = aClass.id;
        var newKey = db.ref(`channels/${classId}`).push().key;
        var fullName = `${userInfo.firstName} ${userInfo.lastName}`;
        var postData = {
          creatorId: creator,
          channelName: aClass.title,
          owners: {
            [creator]: {
              fullname: fullName
            }
          },
          uuid: newKey
        };
        //Creating the new channel in firebase DB
        db.ref().child(`channels/${classId}/${newKey}`).set(postData);
        for (var i = 0; i < aClass.members.length; i++) {
          db
            .ref()
            .child(`channels/${classId}`)
            .once('value')
            .then(function(snapshot) {
              snapshot.forEach(function(channelSnapshot) {
                db
                  .ref()
                  .child(
                    `channels/${classId}/${channelSnapshot.val()
                      .uuid}/participants/${aClass.members[i].id}`
                  )
                  .set({
                    user: 'newuser'
                  });
              });
            });
        }
        //Add new channel to user's list of enrolled channels in users table
        db.ref().child(`users/${auth.currentUser.uid}/channels/${newKey}`).set({
          channelId: newKey
        });
        //Add members of class to the channel
        for (var q = 0; q < aClass.members.length; i++) {
          db
            .ref()
            .child(
              `channels/${classId}/${newKey}/participants/${aClass.members[q]
                .id}`
            )
            .set({
              user: 'newuser'
            });
          //Add the channel to the class member's enrolled channels in users table
          db
            .ref()
            .child(`users/${aClass.members[q].id}/channels/${newKey}`)
            .set({
              channelId: newKey
            });
        }
      }
    });
  },

  generateClassListeners: function(classId, messages, channels) {
    const db = this.get('firebaseApp').database();
    const storage = this.get('firebaseApp').storage();
    var channelRef = db.ref().child('channels/');
    var dbChannelRef = channelRef.child(classId);
    dbChannelRef.on('value', function(snapshot) {
      //Iterating through each channel in the class channel table (currently only the default exist).
      snapshot.forEach(function(channelSnapshot) {
        var channelId = channelSnapshot.child('uuid').val();
        var messageRef = db.ref().child(`messages/${channelId}`);
        /*
          * Create a reference to the messages table for a particular channel (currently only one default channel)
          * We then, only once, retrieve all messages for the particular channel and display them on the UI.
          */
        messageRef.once('value').then(function(snapshot) {
          messages.clear();
          snapshot.forEach(function(messageSnapshot) {
            var mes = messageSnapshot.val().message;
            var tmp = messageSnapshot.val();
            //If the message pertains to a file, then we need to generate the downloadable URL for the file.
            if (mes.startsWith('gs://')) {
              messages.pushObject(tmp);
              storage.refFromURL(mes).getMetadata().then(function(metadata) {
                mes = metadata.downloadURLs[0];
                Ember.set(tmp, 'imageURL', mes);
                Ember.set(tmp, 'message', mes);
              });
            } else {
              messages.pushObject(messageSnapshot.val());
            }
          });
        });
        //Generate a listener that will add a new message to the existing messages array
        messageRef.on('child_added', function(snapshot) {
          var mes = snapshot.val().message;
          var tmp = snapshot.val();
          if (mes.startsWith('gs://')) {
            messages.pushObject(tmp);
            storage.refFromURL(mes).getMetadata().then(function(metadata) {
              mes = metadata.downloadURLs[0];
              Ember.set(tmp, 'imageURL', mes);
              Ember.set(tmp, 'message', mes);
            });
          } else {
            messages.pushObject(snapshot.val());
          }
          Ember.run.later(function() {
            $('.message-row-container').scrollTop(
              $('.message-row-container-inner').height()
            );
          }, 100);
        });

        //Generate a listener to update messages as and when they are updated in the database
        messageRef.on('child_changed', function(snapshot) {
          var mes = snapshot.val().message;
          for (var i = 0; i < messages.length; i++) {
            if (messages[i].messageId === snapshot.key) {
              Ember.set(messages[i], 'message', mes);
            }
          }
          Ember.run.later(function() {
            $('.message-row-container').scrollTop(
              $('.message-row-container-inner').height()
            );
          }, 100);
        });

        //Generate a listener that will listen for removed messages in the database and remove them from the message array
        messageRef.on('child_removed', function(snapshot) {
          for (var i = 0; i < messages.length; i++) {
            if (messages[i].messageId === snapshot.key) {
              messages.removeAt(i);
            }
          }
        });
        channels.pushObject(channelSnapshot.val());
        return true;
      });
    });
  },

  //return current firebase authenticated user
  getUser: function() {
    const auth = this.get('firebaseApp').auth();
    return auth.currentUser;
  },

  //return firebase database object
  getDatabase: function() {
    const db = this.get('firebaseApp').database();
    return db;
  },

  signOut: function() {
    const auth = this.get('firebaseApp').auth();
    auth.signOut();
  },
  editMessage: function(message, currentUser) {
    if (message.userId === currentUser.id) {
      if (message.editing === false) {
        Ember.set(message, 'editing', true);
      } else {
        Ember.set(message, 'editing', false);
      }
    }
  },
  submitEditedMessage: function(message, currentUser, messageOld, channels) {
    const db = this.get('firebaseApp').database();
    Ember.set(messageOld, 'editing', false);
    const channelId = channels[0].uuid;
    db.ref(`messages/${channelId}/${messageOld.messageId}`).set({
      message: message,
      username: messageOld.username,
      userId: messageOld.userId,
      fullname: messageOld.fullname,
      photo: messageOld.photo,
      createdTime: messageOld.createdTime,
      messageId: messageOld.messageId,
      editing: false,
      modifitedTime: firebase.database.ServerValue.TIMESTAMP,
      role: currentUser.role === 'teacher' ? messageOld.role : null
    });
  }
});
