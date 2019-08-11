// @flow
import React from 'react';
import GoArrowIcon from '../icons/GoArrow';
import styles from './style.css';

type Props = {
  address: string,
  onChange: () => void,
};

type State = {
  userTypedAddress: string,
};

class AddressBar extends React.Component<Props> {
  props: Props;
  state: State;

  constructor(props) {
    super(props);
    this.state = {
      userTypedAddress: null,
    };
  }

  render() {
    return (
      <div className={styles.addressBarContainer}>
        <input
          type="text"
          id="name"
          name="name"
          className={styles.addressInput}
          placeholder="https://your-website.com"
          value={this.state.userTypedAddress || this.props.address}
          onChange={e => this.setState({userTypedAddress: e.target.value})}
        />
        <button className={styles.goButton} onClick={this._onChange}>
          <GoArrowIcon height={30} color="white" />
        </button>
      </div>
    );
  }

  _onChange = () => {
    console.log('in _onChange', this.props.onChange);
    this.props.onChange && this.props.onChange(this.state.userTypedAddress);
  };
}

export default AddressBar;
