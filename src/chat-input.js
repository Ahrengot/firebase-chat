import React, { PureComponent } from 'react';

class ChatInputForm extends PureComponent {
  render() {
    return (
      <form onSubmit={this.props.onSubmit} className="chat-input-form">
        <input
          type="text"
          value={this.props.text}
          onChange={this.props.onChange}
          onFocus={this.props.onFocus}
          autoComplete="off"
          placeholder={this.props.placeholder}
        />
      </form>
    );
  }
}

export default ChatInputForm;
