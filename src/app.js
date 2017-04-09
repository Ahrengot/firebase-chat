import './css/main.css';

import _ from 'underscore'
import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import Chat from './chat';
import ChatInputForm from './chat-input'
import ChatHeads from './chat-heads'
import Loader from './loader';


import firebase, { auth, fbAuthProvider, database } from './firebase-config'


/**
 * iOS is a little buggy in some areas. Throw a class on <html>
 * so we can work around those quirks...
 */
if ( navigator.userAgent.match(/i(Pad|Pod|Phone)/) ) {
  document.querySelector("html").classList.add('is-ios');
}

/**
 * Check for initial user
 */
const wasUserPreviouslySignedIn = _.any(_.keys(localStorage), key => {
 return key.match(/firebase:authUser/);
})

auth.onAuthStateChanged(user => {
   if (user) {
     const newUser = {
       id: user.providerData[0].uid,
       name: user.displayName.split(" ")[0],
       avatar: user.photoURL
     };

     update({
       currentUser: newUser,
       isLoadingUser: false
     })

     // If this is the first time our user logged in,
     // go ahead and add him to the users list
     if ( !window.state.isLoadingUsers ) {
       if ( !_.contains(_.pluck(window.state.users, 'id'), newUser.id ) ) {
         usersRef.push(newUser);
       }
     }
   } else {
     update({
       currentUser: null,
       isLoadingUser: false
     })
   }
});

/**
 * State management & updates
 */
const initialState = {
  title: "Chit / Chat",
  repoLink: "https://github.com/Ahrengot/firebase-chat",
  isLoadingMessages: true,
  isLoadingUser: wasUserPreviouslySignedIn,
  isLoadingUsers: true,
  inputText: "",
  currentTime: _.now(),
  currentUser: null,
  users: [],
  usersCurrentlyTyping: [],
  messages: []
}

// Attach to window for easier debugging
window.state = initialState;

// Handle updates from Firebase
const msgsRef = database.ref('/messages');
const usersRef = database.ref('/users');
const usersTypingRef = database.ref('/usersCurrentlyTyping');

[
  { ref: msgsRef, key: 'messages', fallback: [] },
  { ref: usersRef, key: 'users', fallback: [] },
  { ref: usersTypingRef, key: 'usersCurrentlyTyping', fallback: [] }
].forEach(obj => {
  obj.ref.on('value', snapshot => {
    const val = (snapshot.val() === null) ? obj.fallback : snapshot.val();
    if (_.isArray(obj.fallback)) {

      let newStateObj = {}
      if (snapshot.val() === null) {
        newStateObj[obj.key] = obj.fallback;
      } else {
        // firebase doesn't allow arrays. This let's us use them anyway.
        newStateObj[obj.key] = _.map(snapshot.val(), (value, key) => {
          if ( _.isObject(value) && typeof value.id === 'undefined' ) {
            value.id = key;
          }
          return value;
        });
      }

      if ( obj.key === 'messages' ) {
        newStateObj.isLoadingMessages = false;
      }

      if ( obj.key === 'users' ) {
        newStateObj.isLoadingUsers = false;
      }


      update(newStateObj);
    }

  });
})

setInterval(() => {
  update({
    currentTime: _.now()
  })
}, 1000);

const update = (newState, oldState = window.state) => {
  render(Object.assign({}, oldState, newState));

  // Scroll window to the bottom if messages update
  if (newState.messages && oldState.messages && oldState.messages.length !== newState.messages.length) {
    setTimeout(() => {
      scrollToBottom();
    }, 1);
  }
};

const container = document.querySelector("#app");
const render = state => {
  window.state = state;
  ReactDOM.render (<App {...state} />, container );
};

/**
 * App components
 */
class LoginView extends PureComponent {
  render() {
    const btnText = this.props.isLoadingUser ? "Logger ind..." : "Log ind for at være med";
    return (
      <div className="centered-container" style={{maxWidth: '25rem', marginTop: '3rem'}}>
        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          disabled={this.props.isLoadingUser}
          onClick={() => {
            update({isLoadingUser: true});
            auth.signInWithPopup(fbAuthProvider).catch(error => {
              update({isLoadingUser: false});
              alert(error.message);
            });
          }}
        >
          {btnText}
        </button>
      </div>
    );
  }
}

class ChatView extends PureComponent {
  render() {
    let usersTyping = [];
    if ( this.props.users.length && this.props.currentUser ) {
      const usersTypingWithoutSelf = _.reject(this.props.usersCurrentlyTyping, user => {
        return user.fbId === this.props.currentUser.id;
      })

      usersTyping = _.compact(usersTypingWithoutSelf.map(user => {
        return _.findWhere(this.props.users, {id: user.fbId})
      }));
    }
    return (
      <div>
        <Chat
          users={this.props.users}
          self={this.props.currentUser}
          messages={this.props.users.length ? this.props.messages : []}
          usersCurrentlyTyping={usersTyping}
          loading={this.props.isLoadingMessages || this.props.isLoadingUser}
        />
        <ChatInputForm
          onSubmit={e => {
            e.preventDefault();

            if ( this.props.inputText.length === 0 ) {
              return;
            }

            update({inputText: ''});

            msgsRef.push({
              author: this.props.currentUser.id,
              content: this.props.inputText,
              createdAt: _.now()
            })

            const instancesOfMe = _.each(_.where(this.props.usersCurrentlyTyping, {
              fbId: this.props.currentUser.id
            }), userTyping => {
              usersTypingRef.child(userTyping.id).remove();
            });
          }}
          text={this.props.inputText}
          onChange={e => {
            update({ inputText: e.target.value });

            if ( e.target.value.length === 0 ) {
              const instancesOfMe = _.each(_.where(this.props.usersCurrentlyTyping, {
                fbId: this.props.currentUser.id
              }), userTyping => {
                usersTypingRef.child(userTyping.id).remove();
              });
            } else {
              if ( !_.contains(_.pluck(this.props.usersCurrentlyTyping, 'fbId'), props.currentUser.id) ) {
                usersTypingRef.push({fbId: props.currentUser.id});
              }
            }
          }}
          onFocus={() => {
            scrollToBottom()
          }}
          placeholder="Jeg synes, at du skal skrive noget her ..."
        />
      </div>
    );
  }
}

const App = props => {
  return (
    <div className="app-container">
      <div style={{ width: '100%', paddingTop: '2.4rem' }}>
        <header className="header">
          <h1>{ props.title }</h1>
          <ChatHeads users={props.users} />
        </header>
        {!props.isLoadingUser && !props.currentUser && (
          <LoginView {...props} />
        )}
        {(props.currentUser && _.contains(_.pluck(props.users, 'id'), props.currentUser.id)) && (
          <ChatView {...props} />
        )}
        <Loader loading={props.isLoadingMessages || props.isLoadingUsers} />
      </div>
    </div>
  )
}

const scrollToBottom = () => {
  const { top, bottom } = container.getBoundingClientRect();
  const y = Math.abs(top) + bottom;

  window.scrollTo(0, y);
}

render(state);

/**
 * Secret logout
 */
window.logout = () => {
  auth.signOut();
}

/**
 * Secret method for forcing refresh on all connected clients
 */
const appVersionRef = database.ref('/version');
let appVersion = null;
let isFirstRun = true;
appVersionRef.on('value', snapshot => {
  appVersion = _.last(_.map(snapshot.val(), (val, key) => {
    return val;
  }));

  if ( isFirstRun ) {
    isFirstRun = false;
  } else {
    alert(`Hooray! New features! App just updated to v${appVersion}`);
    location.href = location.href;
  }
})

window.incrementAppVersion = () => {
  appVersionRef.push((appVersion || 0) + 1);
}
