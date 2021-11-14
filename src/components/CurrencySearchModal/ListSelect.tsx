import React, { memo, useCallback, useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import ReactGA from 'react-ga';
import { Box, Typography, Button, Popover, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg';
import { useFetchListCallback } from 'hooks/useFetchListCallback';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';

import { AppDispatch, AppState } from 'state';
import { acceptListUpdate, removeList, selectList } from 'state/lists/actions';
import { useSelectedListUrl } from 'state/lists/hooks';
import listVersionLabel from 'utils/listVersionLabel';
import { parseENSAddress } from 'utils/parseENSAddress';
import uriToHttp from 'utils/uriToHttp';
import { QuestionHelper, ListLogo } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  popoverWrapper: {
    zIndex: 100,
    boxShadow:
      '0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01)',
    color: 'black',
    borderRadius: 12,
    padding: 16,
    '& p': {
      fontSize: 18,
      marginBottom: 4,
    },
    '& > div': {
      display: 'flex',
      flexDirection: 'column',
      marginTop: 8,
      '& a, & button': {
        fontSize: 16,
        fontWeight: 400,
      },
      '& a': {
        textDecoration: 'none',
        color: palette.primary.main,
      },
      '& button': {
        background: 'transparent',
        color: 'black',
        padding: 0,
        marginTop: 6,
      },
    },
  },
  styledMenu: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: 'none',
    '& > div:first-child': {
      cursor: 'pointer',
      width: 32,
      height: 32,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${palette.divider}`,
      marginRight: 8,
    },
  },
  styledListUrlText: {
    maxWidth: 160,
    opacity: 0.6,
    marginRight: '0.5rem',
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  manageList: {
    '& p': {
      color: 'black',
    },
    '& .header': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      '& svg': {
        stroke: 'black',
        width: 24,
        height: 24,
      },
      '& p': {
        fontSize: 18,
      },
    },
    '& .content': {
      padding: '12px 16px',
      '& > div': {
        display: 'flex',
        '&:first-child': {
          alignItems: 'center',
          '& p': {
            marginRight: 8,
          },
        },
        '&:nth-child(2)': {
          marginTop: 8,
          '& input': {
            flex: 1,
            marginRight: 8,
            border: `1px solid ${palette.divider}`,
            fontSize: 16,
            outline: 'none',
          },
        },
        '& > div': {
          background: 'transparent',
        },
        '& svg': {
          fill: 'white',
          stroke: 'black',
        },
      },
    },
  },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    '& .listname': {
      flex: 1,
      marginLeft: 8,
      '& div': {
        color: '#999',
      },
    },
  },
}));

function ListOrigin({ listUrl }: { listUrl: string }) {
  const ensName = useMemo(() => parseENSAddress(listUrl)?.ensName, [listUrl]);
  const host = useMemo(() => {
    if (ensName) return undefined;
    const lowerListUrl = listUrl.toLowerCase();
    if (
      lowerListUrl.startsWith('ipfs://') ||
      lowerListUrl.startsWith('ipns://')
    ) {
      return listUrl;
    }
    try {
      const url = new URL(listUrl);
      return url.host;
    } catch (error) {
      return undefined;
    }
  }, [listUrl, ensName]);
  return <>{ensName ?? host}</>;
}

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, '-')}`;
}

const ListRow = memo(function ListRow({
  listUrl,
  onBack,
}: {
  listUrl: string;
  onBack: () => void;
}) {
  const classes = useStyles();
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  const selectedListUrl = useSelectedListUrl();
  const dispatch = useDispatch<AppDispatch>();
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl];
  const [anchorEl, setAnchorEl] = useState<any>(null);

  const isSelected = listUrl === selectedListUrl;

  const selectThisList = useCallback(() => {
    if (isSelected) return;
    ReactGA.event({
      category: 'Lists',
      action: 'Select List',
      label: listUrl,
    });

    dispatch(selectList(listUrl));
    onBack();
  }, [dispatch, isSelected, listUrl, onBack]);

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return;
    ReactGA.event({
      category: 'Lists',
      action: 'Update List from List Select',
      label: listUrl,
    });
    dispatch(acceptListUpdate(listUrl));
  }, [dispatch, listUrl, pending]);

  const handleRemoveList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Start Remove List',
      label: listUrl,
    });
    if (
      window.prompt(
        `Please confirm you would like to remove this list by typing REMOVE`,
      ) === `REMOVE`
    ) {
      ReactGA.event({
        category: 'Lists',
        action: 'Confirm Remove List',
        label: listUrl,
      });
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl]);

  if (!list) return null;

  return (
    <Box
      className={classes.listRow}
      key={listUrl}
      id={listUrlRowHTMLId(listUrl)}
    >
      {list.logoURI ? (
        <ListLogo logoURI={list.logoURI} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Box className='listname'>
        <Typography>{list.name}</Typography>
        <Box className={classes.styledListUrlText} title={listUrl}>
          <ListOrigin listUrl={listUrl} />
        </Box>
      </Box>
      <div className={classes.styledMenu}>
        <Box
          onClick={(evt) => {
            setAnchorEl(evt.currentTarget);
          }}
        >
          <DropDown />
        </Box>

        <Popover
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Box className={classes.popoverWrapper}>
            <Typography>{list && listVersionLabel(list.version)}</Typography>
            <Divider />
            <Box>
              <a
                href={`https://tokenlists.org/token-list?url=${listUrl}`}
                target='_blank'
                rel='noreferrer'
              >
                View list
              </a>
              <Button
                onClick={handleRemoveList}
                disabled={Object.keys(listsByUrl).length === 1}
              >
                Remove list
              </Button>
              {pending && (
                <Button onClick={handleAcceptListUpdate}>Update list</Button>
              )}
            </Box>
          </Box>
        </Popover>
      </div>
      {isSelected ? (
        <Button
          disabled={true}
          className='select-button'
          style={{
            width: '5rem',
            minWidth: '5rem',
            padding: '0.5rem .35rem',
            borderRadius: '12px',
            fontSize: '14px',
          }}
        >
          Selected
        </Button>
      ) : (
        <Button onClick={selectThisList}>Select</Button>
      )}
    </Box>
  );
});

interface ListSelectProps {
  onDismiss: () => void;
  onBack: () => void;
}

const ListSelect: React.FC<ListSelectProps> = ({ onDismiss, onBack }) => {
  const classes = useStyles();
  const [listUrlInput, setListUrlInput] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const handleInput = useCallback((e) => {
    setListUrlInput(e.target.value);
    setAddError(null);
  }, []);
  const fetchList = useFetchListCallback();

  const handleAddList = useCallback(() => {
    if (adding) return;
    setAddError(null);
    fetchList(listUrlInput)
      .then(() => {
        setListUrlInput('');
        ReactGA.event({
          category: 'Lists',
          action: 'Add List',
          label: listUrlInput,
        });
      })
      .catch((error) => {
        ReactGA.event({
          category: 'Lists',
          action: 'Add List Failed',
          label: listUrlInput,
        });
        setAddError(error.message);
        dispatch(removeList(listUrlInput));
      });
  }, [adding, dispatch, fetchList, listUrlInput]);

  const validUrl: boolean = useMemo(() => {
    return (
      uriToHttp(listUrlInput).length > 0 ||
      Boolean(parseENSAddress(listUrlInput))
    );
  }, [listUrlInput]);

  const handleEnterKey = useCallback(
    (e) => {
      if (validUrl && e.key === 'Enter') {
        handleAddList();
      }
    },
    [handleAddList, validUrl],
  );

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists);
    return listUrls
      .filter((listUrl) => {
        return Boolean(lists[listUrl].current);
      })
      .sort((u1, u2) => {
        const { current: l1 } = lists[u1];
        const { current: l2 } = lists[u2];
        if (l1 && l2) {
          return l1.name.toLowerCase() < l2.name.toLowerCase()
            ? -1
            : l1.name.toLowerCase() === l2.name.toLowerCase()
            ? 0
            : 1;
        }
        if (l1) return -1;
        if (l2) return 1;
        return 0;
      });
  }, [lists]);

  return (
    <Box className={classes.manageList}>
      <Box className='header'>
        <ArrowLeft onClick={onBack} />
        <Typography>Manage Lists</Typography>
        <CloseIcon onClick={onDismiss} />
      </Box>

      <Divider />

      <Box className='content'>
        <Box>
          <Typography>Add a list</Typography>
          <QuestionHelper text='Token lists are an open specification for lists of ERC20 tokens. You can use any token list by entering its URL below. Beware that third party token lists can contain fake or malicious ERC20 tokens.' />
        </Box>
        <Box>
          <input
            type='text'
            id='list-add-input'
            placeholder='https:// or ipfs:// or ENS name'
            value={listUrlInput}
            onChange={handleInput}
            onKeyDown={handleEnterKey}
            style={{ height: '2.75rem', borderRadius: 12, padding: '12px' }}
          />
          <Button onClick={handleAddList} disabled={!validUrl}>
            Add
          </Button>
        </Box>
        {addError ? (
          <Typography style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {addError}
          </Typography>
        ) : null}
      </Box>

      <Divider />

      <Box>
        {sortedLists.map((listUrl) => (
          <ListRow key={listUrl} listUrl={listUrl} onBack={onBack} />
        ))}
      </Box>
    </Box>
  );
};

export default ListSelect;
