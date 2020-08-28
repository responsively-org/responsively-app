import React from 'react';
import cx from 'classnames';
import FavIconOff from '@material-ui/icons/StarBorder';
import FavIconOn from '@material-ui/icons/Star';
import {Tooltip} from '@material-ui/core';
import {Icon} from 'flwww';
import fs from 'fs';
import HomePlusIcon from '../icons/HomePlus';
import DeleteCookieIcon from '../icons/DeleteCookie';
import DeleteStorageIcon from '../icons/DeleteStorage';
import {iconsColor, lightIconsColor} from '../../constants/colors';
import {
  getExistingSearchResults,
  updateExistingUrl,
  searchUrlUtils,
} from '../../services/searchUrlSuggestions';
import UrlSearchResults from '../UrlSearchResults';

import commonStyles from '../common.styles.css';
import styles from './style.css';
import debounce from 'lodash/debounce';
import {notifyPermissionToHandleReloadOrNewAddress} from '../../utils/permissionUtils.js';

type Props = {
  address: string,
  onChange: () => void,
};

type State = {
  address: string,
};

class AddressBar extends React.Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    this.state = {
      userTypedAddress: props.address,
      previousAddress: props.address,
      suggestionList: [],
      canShowSuggestions: false,
      cursor: null,
    };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener('click', this._handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._handleClickOutside);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.address !== state.previousAddress) {
      return {
        userTypedAddress: props.address,
        previousAddress: props.address,
      };
    }
    return null;
  }

  render() {
    const {
      suggestionList,
      canShowSuggestions,
      cursor,
      userTypedAddress,
    } = this.state;
    const showSuggestions =
      canShowSuggestions && !this._isSuggestionListEmpty();
    return (
      <div
        className={`${styles.addressBarContainer} ${
          showSuggestions ? styles.active : ''
        }`}
      >
        <input
          ref={this.inputRef}
          type="text"
          id="adress"
          name="address"
          className={styles.addressInput}
          placeholder="https://your-website.com"
          value={userTypedAddress}
          onKeyDown={this._handleKeyDown}
          onChange={this._handleInputChange}
        />
        <div className={cx(styles.floatingOptionsContainer)}>
          <div
            className={cx(commonStyles.icons, commonStyles.roundIcon, {
              [commonStyles.enabled]: true,
            })}
          >
            <Tooltip
              title={
                this.props.isBookmarked
                  ? 'Remove from Bookmarks'
                  : 'Add to Bookmarks'
              }
            >
              <div
                className={cx(commonStyles.flexAlignVerticalMiddle)}
                onClick={() => this.props.toggleBookmark(userTypedAddress)}
              >
                <Icon
                  type={this.props.isBookmarked ? 'starFull' : 'star'}
                  color={lightIconsColor}
                />
              </div>
            </Tooltip>
          </div>
          <div
            className={cx(commonStyles.icons, commonStyles.roundIcon, {
              [commonStyles.enabled]: true,
            })}
          >
            <Tooltip title="Delete Storage">
              <div
                className={cx(commonStyles.flexAlignVerticalMiddle)}
                onClick={this.props.deleteStorage}
              >
                <DeleteStorageIcon
                  height={22}
                  width={22}
                  color={iconsColor}
                  padding={5}
                />
              </div>
            </Tooltip>
          </div>
          <div
            className={cx(commonStyles.icons, commonStyles.roundIcon, {
              [commonStyles.enabled]: true,
            })}
          >
            <Tooltip title="Delete Cookies">
              <div
                className={cx(commonStyles.flexAlignVerticalMiddle)}
                onClick={this.props.deleteCookies}
              >
                <DeleteCookieIcon
                  height={22}
                  width={22}
                  color={iconsColor}
                  padding={5}
                />
              </div>
            </Tooltip>
          </div>
          <div
            className={cx(commonStyles.icons, commonStyles.roundIcon, {
              [commonStyles.enabled]:
                this.props.address !== this.props.homepage,
              [commonStyles.disabled]:
                this.props.address === this.props.homepage,
            })}
          >
            <Tooltip title="Set as Homepage">
              <div
                className={cx(commonStyles.flexAlignVerticalMiddle)}
                onClick={this.props.setHomepage}
              >
                <HomePlusIcon
                  height={22}
                  width={22}
                  color={iconsColor}
                  padding={5}
                />
              </div>
            </Tooltip>
          </div>
        </div>
        {showSuggestions ? (
          <UrlSearchResults
            filteredSearchResults={suggestionList}
            cursorIndex={cursor}
            handleUrlChange={this._onSearchedUrlClick}
          />
        ) : null}
      </div>
    );
  }

  _handleInputChange = e => {
    const {value} = e.target;
    if (value) {
      this.setState({userTypedAddress: value, canShowSuggestions: true}, () => {
        this._filterExistingUrl();
      });
    } else {
      this.setState({userTypedAddress: value, suggestionList: []}, () => {
        this._hideSuggestions();
      });
    }
  };

  _handleKeyDown = e => {
    const {cursor, suggestionList} = this.state;
    if (e.key === 'Enter') {
      this.inputRef.current.blur();
      this.setState(
        {
          suggestionList: [],
          canShowSuggestions: false,
          cursor: null,
        },
        () => {
          this._onChange();
        }
      );
    } else if (e.key === 'ArrowUp' && !this._isSuggestionListEmpty()) {
      // if the suggestion list just opened or the first suggestion is selected set the cursor to the last suggestion
      if (cursor === null || cursor === 0) {
        this._openSuggestionListAndSetCursorAt(suggestionList.length - 1);
        // if cursor is down move it up by subtracting 1
      } else if (cursor > 0) {
        this._handleSuggestionSelection(-1);
      }
    } else if (e.key === 'ArrowDown' && !this._isSuggestionListEmpty()) {
      // if the suggestion list just opened or the last suggestion is selected set the cursor to the first suggestion
      if (cursor === null || cursor === suggestionList.length - 1) {
        this._openSuggestionListAndSetCursorAt(0);
        // if cursor is up move it down by adding 1
      } else if (cursor < suggestionList.length - 1) {
        this._handleSuggestionSelection(1);
      }
    } else if (e.key === 'Escape') {
      this._hideSuggestions();
    }
  };

  _hideSuggestions = () => {
    this.setState({
      canShowSuggestions: false,
      cursor: null,
    });
  };

  /**
   * Open suggestion list and set current selection at cursor position.
   * @param {number} cursor Cursor position.
   */
  _openSuggestionListAndSetCursorAt = cursor => {
    this.setState(prevState => ({
      cursor,
      userTypedAddress: this.state.suggestionList[cursor].url,
      canShowSuggestions: true,
    }));
  };
  /**
   * Handles the suggestion selection on arrow key up and down.
   * @param {number} direction Indicates the direction. 1 for down, -1 for up.
   */
  _handleSuggestionSelection = direction => {
    const modifier = 1 * direction;
    this.setState(prevState => ({
      cursor: prevState.cursor + modifier,
      userTypedAddress: this.state.suggestionList[prevState.cursor + modifier]
        .url,
      canShowSuggestions: true,
    }));
  };

  _isSuggestionListEmpty = () => this.state.suggestionList.length === 0;

  _handleClickOutside = () => {
    this._hideSuggestions();
  };

  _onChange = () => {
    if (!this.state.userTypedAddress || !this.props.onChange) {
      return;
    }

    notifyPermissionToHandleReloadOrNewAddress();
    this.props.onChange(this._normalize(this.state.userTypedAddress), true);
  };

  _onSearchedUrlClick = (url, index) => {
    if (url !== this.state.previousAddress) {
      this.props.onChange(this._normalize(url), true);
    }

    this.setState({
      userTypedAddress: url,
      suggestionList: [],
    });
  };

  _normalize = (address: string) => {
    if (address.indexOf('://') === -1) {
      let protocol = 'https://';
      if (address.startsWith('localhost') || address.startsWith('127.0.0.1')) {
        protocol = 'http://';
      } else if (fs.existsSync(address)) {
        protocol = 'file://';
      }
      address = `${protocol}${address}`;
    }
    return address;
  };

  _filterExistingUrl = debounce(() => {
    const finalResult = searchUrlUtils(this.state.userTypedAddress);
    this.setState({suggestionList: finalResult.slice(0, MAX_SUGGESTIONS)});
  }, 300);
}

const MAX_SUGGESTIONS = 8;

export default AddressBar;
