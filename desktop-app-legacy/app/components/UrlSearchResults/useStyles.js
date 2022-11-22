import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  searchBarSuggestionsContainer: {
    width: 'calc(100% + 2px)',
    maxHeight: '20em',
    position: 'absolute',
    overflow: 'hidden',
    left: '-1px',
    top: '1.8em',
    background: theme.palette.background.l1,
    borderRadius: '0 0 14px 14px',
    borderRight: 'solid 1px #7587ec',
    borderBottom: 'solid 1px #7587ec',
    borderLeft: 'solid 1px #7587ec',
  },
  searchBarSuggestionsListUl: {
    padding: '0',
    margin: '0',
    listStyle: 'none',
  },
  searchBarSuggestionsListItems: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '22px',
    color: theme.palette.text.normal,
    padding: '0.4em 1em',
    cursor: 'default',
    '&:hover': {
      background: 'gray',
      color: 'white',
    },
  },
  searchBarSuggestionsActiveListItems: {
    background: theme.palette.primary.main,
    color: 'white',
  },

  pageFavIconWrapper: {
    width: '16px',
    height: '16px',
  },

  pageFavIcon: {
    display: 'block',
    width: '16px',
    height: '16px',
  },
  pageDefaultFavIconWrapper: {
    fontSize: '16px',
    height: '16px',
  },
  pageTitleAndUrlContainer: {
    marginLeft: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pageTitle: {
    '&::after': {
      content: '"-"',
      margin: '0 8px',
    },
  },
  pageUrl: {
    fontWeight: 500,
  },
}));

export default useStyles;
