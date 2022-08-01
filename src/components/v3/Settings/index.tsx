import React, { useRef, useState } from 'react';
import { Text } from 'rebass';
import { useOnClickOutside } from 'hooks/v3/useOnClickOutside';
import { TYPE } from 'theme/index';
import { ButtonError } from '../Button';
import { AutoColumn } from '../Column';
import { RowBetween, RowFixed } from '../Row';
import TransactionSettings from '../TransactionSettings';
import { Percent } from '@uniswap/sdk-core';
import {
  Break,
  EmojiWrapper,
  MenuFlyout,
  ModalContentWrapper,
  StyledCloseIcon,
  StyledMenu,
  StyledMenuButton,
  StyledMenuIcon,
} from './styled';
import QuestionHelper from 'components/QuestionHelper';
import Modal from 'components/Modal';
import {
  useExpertModeManager,
  useUserSingleHopOnly,
} from 'state/user/v3/hooks';
import Toggle from 'components/Toggle';
import { ApplicationModal } from 'state/application/actions';
import { useModalOpen, useToggleV3SettingsMenu } from 'state/application/hooks';

export default function SettingsTab({
  placeholderSlippage,
}: {
  placeholderSlippage: Percent;
}) {
  const node = useRef<HTMLDivElement>();
  const open = useModalOpen(ApplicationModal.SETTINGSV3);
  const toggle = useToggleV3SettingsMenu();

  const [expertMode, toggleExpertMode] = useExpertModeManager();
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly();

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false);

  useOnClickOutside(node, open ? toggle : undefined);

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal
        isOpen={showConfirmation}
        onDismiss={() => setShowConfirmation(false)}
        maxHeight={100}
      >
        <div>
          <AutoColumn gap='lg'>
            <RowBetween style={{ padding: '0 2rem' }}>
              <div />
              <Text fontWeight={500} fontSize={20}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap='lg' style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={20}>
                Expert mode turns off the confirm transaction prompt and allows
                high slippage trades that often result in bad rates and lost
                funds.
              </Text>
              <Text fontWeight={600} fontSize={20}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING
              </Text>
              <ButtonError
                error={true}
                padding={'12px'}
                onClick={() => {
                  const confirmWord = `confirm`;
                  if (
                    window.prompt(
                      `Please type the word "${confirmWord}" to enable expert mode.`,
                    ) === confirmWord
                  ) {
                    toggleExpertMode();
                    setShowConfirmation(false);
                  }
                }}
              >
                <Text fontSize={20} fontWeight={500} id='confirm-expert-mode'>
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </div>
      </Modal>
      <StyledMenuButton onClick={toggle} id='open-settings-dialog-button'>
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role='img' aria-label='wizard-icon'>
              😎
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap='md' style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              Transaction Settings
            </Text>
            <TransactionSettings placeholderSlippage={placeholderSlippage} />
            <Text fontWeight={600} fontSize={14}>
              Interface Settings
            </Text>
            <RowBetween>
              <RowFixed>
                <TYPE.black
                  fontWeight={400}
                  fontSize={14}
                  color={'var(--white)'}
                >
                  Expert Mode
                </TYPE.black>
                <QuestionHelper
                  text={`Allow high price impact trades and skip the confirm screen. Use at your own risk.`}
                />
              </RowFixed>
              <Toggle
                id='toggle-expert-mode-button'
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggleExpertMode();
                        setShowConfirmation(false);
                      }
                    : () => {
                        toggle();
                        setShowConfirmation(true);
                      }
                }
              />
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.black
                  fontWeight={400}
                  fontSize={14}
                  color={'var(--white)'}
                >
                  Multihops
                </TYPE.black>
                <QuestionHelper text={`Allows swap between multiple pools.`} />
              </RowFixed>
              <Toggle
                id='toggle-disable-multihop-button'
                isActive={!singleHopOnly}
                toggle={() => {
                  setSingleHopOnly(!singleHopOnly);
                }}
              />
            </RowBetween>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  );
}
