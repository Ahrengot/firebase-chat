import React from 'react';

const ChatInputForm = props => {
  return (
    <form onSubmit={props.onSubmit} className="chat-input-form">
      <input
        type="text"
        value={props.text}
        onChange={props.onChange}
        onFocus={props.onFocus}
        autoComplete="off"
        placeholder={props.placeholder}
      />
    </form>
  )
}

export default ChatInputForm;
