import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { ArrowLeft } from 'react-feather'
import ReactGA from 'react-ga'
import { Box, Typography, Button, Popover, Divider } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import { useFetchListCallback } from 'hooks/useFetchListCallback'
import { ReactComponent as CloseIcon } from 'assets/images/x.svg';

import { AppDispatch, AppState } from 'state'
import { acceptListUpdate, removeList, selectList } from 'state/lists/actions'
import { useSelectedListUrl } from 'state/lists/hooks'
import listVersionLabel from 'utils/listVersionLabel'
import { parseENSAddress } from 'utils/parseENSAddress'
import uriToHttp from 'utils/uriToHttp'
import { QuestionHelper, Logo } from 'components'

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  popoverContainer: {
    zIndex: 100,
    background: palette.background.default,
    border: `1px solid ${palette.divider}`,
    boxShadow: '0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01)',
    color: 'black',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'grid',
  },
  styledMenu: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: 'none'
  },
  styledListUrlText: {
    maxWidth: 160,
    opacity: 0.6,
    marginRight: '0.5rem',
    fontSize: 14,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}));

function ListOrigin({ listUrl }: { listUrl: string }) {
  const ensName = useMemo(() => parseENSAddress(listUrl)?.ensName, [listUrl])
  const host = useMemo(() => {
    if (ensName) return undefined
    const lowerListUrl = listUrl.toLowerCase()
    if (lowerListUrl.startsWith('ipfs://') || lowerListUrl.startsWith('ipns://')) {
      return listUrl
    }
    try {
      const url = new URL(listUrl)
      return url.host
    } catch (error) {
      return undefined
    }
  }, [listUrl, ensName])
  return <>{ensName ?? host}</>
}

function listUrlRowHTMLId(listUrl: string) {
  return `list-row-${listUrl.replace(/\./g, '-')}`
}

const ListRow = memo(function ListRow({ listUrl, onBack }: { listUrl: string; onBack: () => void }) {
  const classes = useStyles();
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const selectedListUrl = useSelectedListUrl()
  const dispatch = useDispatch<AppDispatch>()
  const { current: list, pendingUpdate: pending } = listsByUrl[listUrl]

  const isSelected = listUrl === selectedListUrl

  // const [open, toggle] = useToggle(false)
  const [ open, toggle ] = useState(false)
  const node = useRef<HTMLDivElement>()
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement>()
  const [popperElement, setPopperElement] = useState<HTMLDivElement>()

  // const { styles, attributes } = usePopper(referenceElement, popperElement, {
  //   placement: 'auto',
  //   strategy: 'fixed',
  //   modifiers: [{ name: 'offset', options: { offset: [8, 8] } }]
  // })

  // useOnClickOutside(node, open ? toggle : undefined)

  const selectThisList = useCallback(() => {
    if (isSelected) return
    ReactGA.event({
      category: 'Lists',
      action: 'Select List',
      label: listUrl
    })

    dispatch(selectList(listUrl))
    onBack()
  }, [dispatch, isSelected, listUrl, onBack])

  const handleAcceptListUpdate = useCallback(() => {
    if (!pending) return
    ReactGA.event({
      category: 'Lists',
      action: 'Update List from List Select',
      label: listUrl
    })
    dispatch(acceptListUpdate(listUrl))
  }, [dispatch, listUrl, pending])

  const handleRemoveList = useCallback(() => {
    ReactGA.event({
      category: 'Lists',
      action: 'Start Remove List',
      label: listUrl
    })
    if (window.prompt(`Please confirm you would like to remove this list by typing REMOVE`) === `REMOVE`) {
      ReactGA.event({
        category: 'Lists',
        action: 'Confirm Remove List',
        label: listUrl
      })
      dispatch(removeList(listUrl))
    }
  }, [dispatch, listUrl])

  if (!list) return null

  return (
    <Box key={listUrl} padding="16px" id={listUrlRowHTMLId(listUrl)}>
      {list.logoURI ? (
        <Logo srcs={[list.logoURI]} alt={`${list.name} list logo`} />
      ) : (
        <div style={{ width: '24px', height: '24px', marginRight: '1rem' }} />
      )}
      <Box style={{ flex: '1' }}>
        <Box>
          <Typography style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {list.name}
          </Typography>
        </Box>
        <Box style={{ marginTop: '4px' }}>
          <Box className={classes.styledListUrlText} title={listUrl}>
            <ListOrigin listUrl={listUrl} />
          </Box>
        </Box>
      </Box>
      <div className={classes.styledMenu} ref={node as any}>
        <Button onClick={() => toggle(true)}>
          <DropDown />
        </Button>

        {open && (
          <Popover open={open} ref={setPopperElement as any}>
            <div>{list && listVersionLabel(list.version)}</div>
            <Divider />
            <a href={`https://tokenlists.org/token-list?url=${listUrl}`} target='_blank' rel='noreferrer'>View list</a>
            <Button onClick={handleRemoveList} disabled={Object.keys(listsByUrl).length === 1}>
              Remove list
            </Button>
            {pending && (
              <Button onClick={handleAcceptListUpdate}>Update list</Button>
            )}
          </Popover>
        )}
      </div>
      {isSelected ? (
        <Button
          disabled={true}
          className="select-button"
          style={{ width: '5rem', minWidth: '5rem', padding: '0.5rem .35rem', borderRadius: '12px', fontSize: '14px' }}
        >
          Selected
        </Button>
      ) : (
        <>
          <Button
            className="select-button"
            style={{
              width: '5rem',
              minWidth: '4.5rem',
              padding: '0.5rem .35rem',
              borderRadius: '12px',
              fontSize: '14px'
            }}
            onClick={selectThisList}
          >
            Select
          </Button>
        </>
      )}
    </Box>
  )
})

interface ListSelectProps {
  onDismiss: () => void;
  onBack: () => void
}

const ListSelect: React.FC<ListSelectProps> = ({ onDismiss, onBack }) => {
  const classes = useStyles();
  const [listUrlInput, setListUrlInput] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const adding = Boolean(lists[listUrlInput]?.loadingRequestId)
  const [addError, setAddError] = useState<string | null>(null)

  const handleInput = useCallback(e => {
    setListUrlInput(e.target.value)
    setAddError(null)
  }, [])
  const fetchList = useFetchListCallback()

  const handleAddList = useCallback(() => {
    if (adding) return
    setAddError(null)
    fetchList(listUrlInput)
      .then(() => {
        setListUrlInput('')
        ReactGA.event({
          category: 'Lists',
          action: 'Add List',
          label: listUrlInput
        })
      })
      .catch(error => {
        ReactGA.event({
          category: 'Lists',
          action: 'Add List Failed',
          label: listUrlInput
        })
        setAddError(error.message)
        dispatch(removeList(listUrlInput))
      })
  }, [adding, dispatch, fetchList, listUrlInput])

  const validUrl: boolean = useMemo(() => {
    return uriToHttp(listUrlInput).length > 0 || Boolean(parseENSAddress(listUrlInput))
  }, [listUrlInput])

  const handleEnterKey = useCallback(
    e => {
      if (validUrl && e.key === 'Enter') {
        handleAddList()
      }
    },
    [handleAddList, validUrl]
  )

  const sortedLists = useMemo(() => {
    const listUrls = Object.keys(lists)
    return listUrls
      .filter(listUrl => {
        return Boolean(lists[listUrl].current)
      })
      .sort((u1, u2) => {
        const { current: l1 } = lists[u1]
        const { current: l2 } = lists[u2]
        if (l1 && l2) {
          return l1.name.toLowerCase() < l2.name.toLowerCase()
            ? -1
            : l1.name.toLowerCase() === l2.name.toLowerCase()
            ? 0
            : 1
        }
        if (l1) return -1
        if (l2) return 1
        return 0
      })
  }, [lists])

  return (
    <Box style={{ width: '100%', flex: '1 1' }}>
      <Box>
        <Box>
          <div>
            <ArrowLeft style={{ cursor: 'pointer' }} onClick={onBack} />
          </div>
          <Typography>
            Manage Lists
          </Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
      </Box>

      <Divider />

      <Box>
        <Typography>
          Add a list{' '}
          <QuestionHelper text="Token lists are an open specification for lists of ERC20 tokens. You can use any token list by entering its URL below. Beware that third party token lists can contain fake or malicious ERC20 tokens." />
        </Typography>
        <Box>
          <input
            type="text"
            id="list-add-input"
            placeholder="https:// or ipfs:// or ENS name"
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
        {sortedLists.map(listUrl => (
          <ListRow key={listUrl} listUrl={listUrl} onBack={onBack} />
        ))}
      </Box>
      <Divider />
    </Box>
  )
}

export default ListSelect;
