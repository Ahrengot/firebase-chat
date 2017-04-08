import React from 'react'

const ChatHeads = props => {
  return (
    <ul className="chat-heads">
      {props.users.map(user => {
        return (
          <li
            key={user.id}
          >
            <div
              className="chat-head-img"
              style={{
                backgroundImage: `url(${user.avatar})`
              }}
            />
            <div className="chat-head-name">
              {user.name}
            </div>
          </li>
        );
      })}
    </ul>
  )
}

export default ChatHeads;
