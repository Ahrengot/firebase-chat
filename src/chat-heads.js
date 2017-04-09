import React, { PureComponent } from 'react'

class ChatHeads extends PureComponent {
  render() {
    return (
      <ul className="chat-heads">
        {this.props.users.map(user => {
          return (
            <li key={user.id}>
              <div
                className="chat-head-img"
                style={{
                  backgroundImage: `url(${user.avatar})`
                }}
              />
              <div className="chat-head-name">{user.name}</div>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default ChatHeads;
