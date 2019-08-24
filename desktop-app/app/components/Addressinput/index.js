// @flow
import React from 'react';
import GoArrowIcon from '../icons/GoArrow';
import styles from './style.css';

type Props = {
  address: string,
  onChange: () => void,
};

type State = {
  address: string,
};

class AddressBar extends React.Component<Props> {
  props: Props;
  state: State;

  constructor(props) {
    super(props);
    this.state = {
      userTypedAddress: props.address,
      previousAddress: props.address,
    };
    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.address != state.previousAddress) {
      return {userTypedAddress: props.address, previousAddress: props.address};
    }
    return null;
  }

  render() {
    return (
      <div className={styles.addressBarContainer}>
        <input
          ref={this.inputRef}
          type="text"
          id="adress"
          name="address"
          className={styles.addressInput}
          placeholder="https://your-website.com"
          value={this.state.userTypedAddress}
          onKeyDown={this._handleKeyDown}
          onChange={e => this.setState({userTypedAddress: e.target.value})}
        />
        {/*
          <button className={styles.goButton} onClick={this._onChange}>
            <GoArrowIcon height={20} color="white" />
          </button>
        */}
      </div>
    );
  }

  _handleKeyDown = e => {
    if (e.key === 'Enter') {
      this.inputRef.current.blur();
      this._onChange();
    }
  };

  _onChange = () => {
    if (!this.state.userTypedAddress) {
      return;
    }
    this.props.onChange &&
      this.props.onChange(this._normalize(this.state.userTypedAddress));
  };

  _normalize = address => {
    if (!address.startsWith('http')) {
      address = 'https://' + address;
    }
    return address;
  };
}

export default AddressBar;
