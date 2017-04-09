import _ from 'underscore';
import React, { PureComponent } from 'react';
import moment from 'moment'

moment.locale('da');

class Avatar extends PureComponent {
  render() {
    return (
      <div
        className="msg-avatar"
        style={{
          backgroundImage: `url(${this.props.src})`
        }}
      />
    )
  }
}

class Message extends PureComponent {
  render() {
    const hasTextOrNumbers = typeof this.props.content === 'string' && this.props.content.match(/[a-zA-Z]|[0-9]/);
    let className = 'chat-msg';
    if ( !hasTextOrNumbers ) {
      className += ' large-type-msg';
    }
    if (this.props.isFromSelf) {
      className += ' author-is-self';
    }
    if (this.props.isNew) {
      className += ' is-new';
    }
    if (this.props.isLoaderMsg) {
      className += ' loader-msg';
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let extraProps = {};
    if ( typeof this.props.content === 'string' && this.props.content.match(urlRegex) ) {
      extraProps.dangerouslySetInnerHTML = {
        __html: this.props.content.replace(urlRegex, url => {
          return `<a href='${url}' target='_blank'>${url}</a>`;
        })
      }
    } else {
      extraProps.children = this.props.content;
    }

    return (
      <li className={ className }>
        <Avatar src={this.props.author.avatar} name={this.props.author.name} />
        <div className="msg-body">
          <div
            className="msg-content"
            {...extraProps}
          />
          <footer
            className="msg-meta"
            style={{
              display: this.props.isLoaderMsg ? 'none' : ''
            }}
          >
            { moment(this.props.createdAt).fromNow() }
          </footer>
        </div>
      </li>
    );
  }
};

class Chat extends PureComponent {
  render() {
    const now = _.now();
    return (
      <div className="chat centered-container">
        <ul className="msg-list" style={{display: this.props.messages.length ? '' : 'none'}}>
          {this.props.messages.map(msg => {
            return (
              <Message
                key={'msg_' + msg.id}
                {...msg}
                isNew={msg.createdAt && (now - msg.createdAt) < 2000}
                author={ _.findWhere(this.props.users, {id: msg.author}) }
                isFromSelf={this.props.self && msg.author === this.props.self.id}
              />
            );
          })}
          {this.props.usersCurrentlyTyping.map(user => {
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
      </div>
    );
  }
};

export default Chat;
