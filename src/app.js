import './css/main.css';

import _ from 'underscore'
import React from 'react'
import ReactDOM from 'react-dom'
import Chat from './chat';
import ChatInputForm from './chat-input'
import ChatHeads from './chat-heads'

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
     update({
       currentUser: {
         id: user.providerData[0].uid,
         name: user.displayName.split(" ")[0],
         avatar: user.photoURL
       },
       isLoadingUser: false
     })
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
  isLoadingMessages: true,
  isLoadingUser: wasUserPreviouslySignedIn,
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

      update(newStateObj);
    }

  });
})

setInterval(() => {
  update({
    currentTime: _.now()
  })
}, 1000);

const update = (newState, oldState = state) => {
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
const LoginView = props => {
  const btnText = props.isLoadingUser ? "Logger ind..." : "Log ind for at være med";
  return (
    <div className="centered-container" style={{maxWidth: '25rem', marginTop: '3rem'}}>
      <button
        type="button"
        className="btn btn-primary btn-block btn-lg"
        disabled={props.isLoadingUser}
        onClick={() => {
          update({isLoadingUser: true});
          auth.signInWithPopup(fbAuthProvider).then(result => {
            // If this is the first time our user logged in,
            // go ahead and add him to the users list
            if ( !_.contains(_.pluck(window.state.users, 'id'), result.user.providerData[0].uid ) ) {
              usersRef.push(window.state.currentUser);
            }
          }).catch(error => {
            update({isLoadingUser: false});
            alert(error.message);
          });
        }}
      >
        {btnText}
      </button>
    </div>
  )
}

const ChatView = props => {
  let usersTyping = [];
  if ( props.users.length && props.currentUser ) {
    const usersTypingWithoutSelf = _.reject(props.usersCurrentlyTyping, user => {
      return user.fbId === props.currentUser.id;
    })

    usersTyping = _.compact(usersTypingWithoutSelf.map(user => {
      return _.findWhere(props.users, {id: user.fbId})
    }));
  }
  return (
    <div>
      <Chat
        users={props.users}
        self={props.currentUser}
        messages={props.users.length ? props.messages : []}
        usersCurrentlyTyping={usersTyping}
        loading={props.isLoadingMessages || props.isLoadingUser}
      />
      <ChatInputForm
        onSubmit={e => {
          e.preventDefault();

          update({inputText: ''});

          msgsRef.push({
            author: props.currentUser.id,
            content: props.inputText,
            createdAt: _.now()
          })

          const instancesOfMe = _.each(_.where(props.usersCurrentlyTyping, {
            fbId: props.currentUser.id
          }), userTyping => {
            usersTypingRef.child(userTyping.id).remove();
          });
        }}
        text={props.inputText}
        onChange={e => {
          update({ inputText: e.target.value });

          if ( !_.contains(_.pluck(props.usersCurrentlyTyping, 'fbId'), props.currentUser.id) ) {
            usersTypingRef.push({fbId: props.currentUser.id});
          }
        }}
        onFocus={() => {
          scrollToBottom()
        }}
        placeholder="Jeg synes, at du skal skrive noget her ..."
      />
    </div>
  )
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
        {(props.currentUser) && (
          <ChatView {...props} />
        )}
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
