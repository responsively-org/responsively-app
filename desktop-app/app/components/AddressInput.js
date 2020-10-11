import React from 'react';
import cx from 'classnames';
import FavIconOff from '@material-ui/icons/StarBorder';
import FavIconOn from '@material-ui/icons/Star';
import {Tooltip} from '@material-ui/core';
import {withTheme, withStyles, styled} from '@material-ui/core/styles';
import fs from 'fs';
import debounce from 'lodash/debounce';
import HomePlusIcon from './icons/HomePlus';
import DeleteCookieIcon from './icons/DeleteCookie';
import DeleteStorageIcon from './icons/DeleteStorage';
import StartIcon from './icons/Start';
import {
  getExistingSearchResults,
  updateExistingUrl,
  searchUrlUtils,
} from '../services/searchUrlSuggestions';
import UrlSearchResults from './UrlSearchResults';
import {styles as commonStyles} from './useCommonStyles';
import {notifyPermissionToHandleReloadOrNewAddress} from '../utils/permissionUtils';

class AddressBar extends React.Component {
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
    const {theme, classes, address, homepage} = this.props;
    const addressBarSameAsHomepage = address === homepage;
    const showSuggestions =
      canShowSuggestions && !this._isSuggestionListEmpty();

    return (
      <div
        className={cx(classes.addressBarContainer, {
          [classes.showSuggestions]: showSuggestions,
        })}
      >
        <input
          ref={this.inputRef}
          type="text"
          id="adress"
          name="address"
          className={classes.addressInput}
          placeholder="https://your-website.com"
          value={userTypedAddress}
          onKeyDown={this._handleKeyDown}
          onChange={this._handleInputChange}
        />
        <div className={classes.optionsContainer}>
          <div className={cx(classes.icon, classes.iconRound)}>
            <Tooltip
              title={
                this.props.isBookmarked
                  ? 'Remove from Bookmarks'
                  : 'Add to Bookmarks'
              }
            >
              <div
                className={classes.flexAlignVerticalMiddle}
                onClick={() => this.props.toggleBookmark(userTypedAddress)}
              >
                <StartIcon
                  width={22}
                  height={22}
                  padding={5}
                  strokeColor="currentColor"
                  fillColor={this.props.isBookmarked ? 'currentColor' : 'none'}
                />
              </div>
            </Tooltip>
          </div>
          <div className={cx(classes.icon, classes.iconRound)}>
            <Tooltip title="Delete Storage">
              <div
                className={classes.flexAlignVerticalMiddle}
                onClick={this.props.deleteStorage}
              >
                <DeleteStorageIcon
                  height={22}
                  width={22}
                  color="currentColor"
                  padding={5}
                />
              </div>
            </Tooltip>
          </div>
          <div className={cx(classes.icon, classes.iconRound)}>
            <Tooltip title="Delete Cookies">
              <div
                className={classes.flexAlignVerticalMiddle}
                onClick={this.props.deleteCookies}
              >
                <DeleteCookieIcon
                  height={22}
                  width={22}
                  color="currentColor"
                  padding={5}
                />
              </div>
            </Tooltip>
          </div>
          <div
            className={cx(classes.icon, classes.iconRound, {
              [classes.iconHoverDisabled]: addressBarSameAsHomepage,
              [classes.iconDisabled]: addressBarSameAsHomepage,
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
                  color={
                    addressBarSameAsHomepage
                      ? theme.palette.text.primary
                      : 'currentColor'
                  }
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

  _hostnameCharHints = [':', '/', '#', '?'];
  _inferHostname = (address: string) =>
    this._hostnameCharHints.reduce(
      (curr, char) => curr.split(char)[0],
      address
    );

  _normalize = (address: string) => {
    if (address.indexOf('://') === -1) {
      let protocol = 'https://';
      if (
        address.startsWith('localhost') ||
        address.startsWith('127.0.0.1') ||
        this._inferHostname(address).indexOf('.localhost') !== -1
      ) {
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

const styles = theme => {
  const {mode} = theme.palette;
  return {
    ...commonStyles(theme),
    addressBarContainer: {
      display: 'flex',
      position: 'relative',
      alignItems: 'center',
      height: '20px',
      width: '100%',
      padding: '14px 10px',
      borderRadius: '20px',
      backgroundColor: theme.palette.background.l0,
      color: theme.palette.text.normal,
      border: `1px solid ${theme.palette.lightIcon.main}`,
      outline: 'none',
      transition: 'border 500ms ease-out',
      '&:focus-within': {
        color: theme.palette.text.active,
        border: `1px solid ${theme.palette.primary.main}`,
      },
    },
    showSuggestions: {
      borderRadius: '14px 14px 0 0',
    },
    addressInput: {
      height: '20px',
      background: 'unset',
      fontSize: '16px',
      color: 'inherit',
      border: 'none',
      width: '92%',
      margin: '0',
      outline: 'none',
      textOverflow: 'ellipsis',
    },
    optionsContainer: {
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      right: 5,
      color: theme.palette.text.primary,
    },
  };
};

export default withStyles(styles)(withTheme(AddressBar));
