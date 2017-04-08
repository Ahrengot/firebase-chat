import _ from 'underscore';
import React from 'react';
import moment from 'moment'
import Loader from './loader';

moment.locale('da');

const Avatar = props => {
  return (
    <div className="msg-avatar" style={{
      backgroundImage: `url(${props.src})`
    }}/>
  )
}

const Message = props => {
  const hasTextOrNumbers = typeof props.content === 'string' && props.content.match(/[a-zA-Z]|[0-9]/);
  let className = 'chat-msg';
  if ( !hasTextOrNumbers ) {
    className += ' large-type-msg';
  }
  if (props.isFromSelf) {
    className += ' author-is-self';
  }
  if (props.isNew) {
    className += ' is-new';
  }
  if (props.isLoaderMsg) {
    className += ' loader-msg';
  }

  return (
    <li className={ className }>
      <Avatar src={props.author.avatar} name={props.author.name} />
      <div className="msg-body">
        <div className="msg-content">
          {props.content}
        </div>
        <footer className="msg-meta">
          { moment(props.createdAt).fromNow() }
        </footer>
      </div>
    </li>
  );
};

const Chat = props => {
  const now = _.now();
  return (
    <div className="chat centered-container">
      <ul className="msg-list" style={{display: props.messages.length ? '' : 'none'}}>
        {props.messages.map(msg => {
          return (
            <Message
              key={'msg_' + msg.id}
              {...msg}
              isNew={msg.createdAt && (now - msg.createdAt) < 2000}
              author={ _.findWhere(props.users, {id: msg.author}) }
              isFromSelf={props.self && msg.author === props.self.id}
            />
          );
        })}
        {props.usersCurrentlyTyping.map(user => {
          return (
            <Message
              key={'user_' + user.id}
              content={<Loader loading={true} />}
              isLoaderMsg={true}
              isNew={true}
              author={user}
              isFromSelf={false}
            />
          )
        })}
      </ul>
      <Loader loading={props.loading} />
    </div>
  );
};

export default Chat;
