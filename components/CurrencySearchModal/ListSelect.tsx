import React, { memo, useCallback, useMemo, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import { event } from 'nextjs-google-analytics';
import { Box, Button, Popover, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ExpandMore, Close } from '@mui/icons-material';
import { useFetchListCallback } from 'hooks/useFetchListCallback';

import { AppDispatch, AppState } from 'state';
import { acceptListUpdate, removeList, selectList } from 'state/lists/actions';
import { useSelectedListUrl } from 'state/lists/hooks';
import listVersionLabel from 'utils/listVersionLabel';
import { parseENSAddress } from 'utils/parseENSAddress';
import uriToHttp from 'utils/uriToHttp';
import { QuestionHelper, ListLogo } from 'components';
import { useTranslation } from 'next-i18next';

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
  const { t } = useTranslation();
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
    event('Select List', {
      category: 'Lists',
      label: listUrl,
    });

    dispatch(selectList(listUrl));
    onBack();
  }, [dispatch, isSelected, listUrl, onBack]);

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return;
    event('Update List from List Select', {
      category: 'Lists',
      label: listUrl,
    });
    dispatch(acceptListUpdate(listUrl));
  }, [dispatch, listUrl, pending]);

  const handleRemoveList = useCallback(() => {
    event('Start Remove List', {
      category: 'Lists',
      label: listUrl,
    });
    if (
      window.prompt(t('confirmRemoveList') ?? undefined) ===
      t('REMOVE').toUpperCase()
    ) {
      event('Confirm Remove List', {
        category: 'Lists',
        label: listUrl,
      });
      dispatch(removeList(listUrl));
    }
  }, [dispatch, listUrl, t]);

  if (!list) return null;

  return (
    <Box className='listRow' key={listUrl} id={listUrlRowHTMLId(listUrl)}>
      {list.logoURI ? (
        <ListLogo logoURI={list.logoURI} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Box className='listname'>
        <p>{list.name}</p>
        <Box className='styledListUrlText' title={listUrl}>
          <ListOrigin listUrl={listUrl} />
        </Box>
      </Box>
      <div className='styledMenu'>
        <Box
          onClick={(evt) => {
            setAnchorEl(evt.currentTarget);
          }}
        >
          <ExpandMore />
        </Box>

        <Popover
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Box className='popoverWrapper'>
            <p>{list && listVersionLabel(list.version)}</p>
            <Divider />
            <Box>
              <a
                href={`https://tokenlists.org/token-list?url=${listUrl}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('viewList')}
              </a>
              <Button
                onClick={handleRemoveList}
                disabled={Object.keys(listsByUrl).length === 1}
              >
                {t('removeList')}
              </Button>
              {pending && (
                <Button onClick={handleAcceptListUpdate}>
                  {t('updateList')}
                </Button>
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
          {t('selected')}
        </Button>
      ) : (
        <Button onClick={selectThisList}>{t('select')}</Button>
      )}
    </Box>
  );
});

interface ListSelectProps {
  onDismiss: () => void;
  onBack: () => void;
}

const ListSelect: React.FC<ListSelectProps> = ({ onDismiss, onBack }) => {
  const { t } = useTranslation();
  const [listUrlInput, setListUrlInput] = useState<string>('');

  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  const adding = Boolean(lists[listUrlInput]?.loadingRequestId);
  const [addError, setAddError] = useState<string | null>(null);

  const handleInput = useCallback((e: any) => {
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
        event('Add List', {
          category: 'Lists',
          label: listUrlInput,
        });
      })
      .catch((error) => {
        event('Add List Failed', {
          category: 'Lists',
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
    (e: any) => {
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
    <Box className='manageList'>
      <Box className='header'>
        <ArrowLeft onClick={onBack} />
        <p>{t('manageLists')}</p>
        <Close onClick={onDismiss} />
      </Box>

      <Divider />

      <Box className='content'>
        <Box>
          <p>{t('addList')}</p>
          <QuestionHelper text={t('addListHelper')} />
        </Box>
        <Box>
          <input
            type='text'
            id='list-add-input'
            placeholder={t('listPlaceholder') ?? undefined}
            value={listUrlInput}
            onChange={handleInput}
            onKeyDown={handleEnterKey}
            style={{ height: '2.75rem', borderRadius: 12, padding: '12px' }}
          />
          <Button onClick={handleAddList} disabled={!validUrl}>
            {t('add')}
          </Button>
        </Box>
        {addError ? (
          <p style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {addError}
          </p>
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
