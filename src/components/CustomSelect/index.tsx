/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { Box } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface MiniSelectProps {
  onChange?: any;
  sm?: boolean;
  bg?: any;
  width?: any;
  after?: any;
  before?: any;
  border?: any;
  [index: string]: any;
}

export const CustomSelect: React.FC<MiniSelectProps> = ({
  after,
  before,
  onChange,
  bg,
  width,
  border,
  sm,
  children,
  ...props
}) => {
  const [currentOption, setCurrentOption] = useState<any>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [optionList, setOptionList] = useState<any>(null);
  const dropBox = useRef<any>(null);
  const dropPannel = useRef<any>(null);
  useEffect(() => {
    const handle = (event: any) => {
      if (dropBox?.current && !dropBox.current.contains(event.target)) {
        setIsOpened(false);
      }
    };
    window.addEventListener('click', handle);
    return () => {
      window.removeEventListener('click', handle);
    };
  }, []);
  useEffect(() => {
    const list: any = [];
    if (!Array.isArray(children)) {
      setOptionList(list);
      return;
    }
    children?.map((each, index) => {
      if (each.props.customTagType !== '--411customisedOption--') {
        return null;
      }
      const value = each.props.value;
      const text = each.props.children;
      const selected = each.props.selected;
      list.push({
        value: value,
        text: text,
        selected: selected,
      });
      return {
        value: value,
        text: text,
        selected: selected,
      };
    });
    list.map((each: any, index: any) => {
      if (each.selected || index === 0) {
        setCurrentOption(each);
      }
    });
    setOptionList(list);
  }, [children]);
  return (
    <DropBox
      width={width || 'reverse'}
      position={'relative'}
      display={'inline-block'}
      ref={dropBox}
      {...props}
    >
      {sm ? (
        <Box
          bgcolor={bg || 'transparent'}
          height={'24px'}
          px={'16px'}
          border={border || 'none'}
          borderRadius={'6px'}
          fontWeight={['500']}
          fontSize={['14px']}
          lineHeight={['16px']}
          display={'flex'}
          alignItems={'center'}
          flexWrap={'nowrap'}
          whiteSpace={'nowrap'}
          boxShadow={'0px 4px 8px rgba(0, 0, 0, 0.25)'}
          gridGap={'4px'}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setIsOpened(!isOpened);
          }}
        >
          {before}
          {currentOption?.text}
          <Box ml={'auto'} display={'flex'} alignItems={'center'}>
            <NarrowIcon dir={isOpened ? 'up' : 'down'} />
          </Box>
          {after}
        </Box>
      ) : (
        <Box
          bgcolor={bg || 'transparent'}
          height={'40px'}
          px={'16px'}
          borderRadius={'10px'}
          whiteSpace={'nowrap'}
          border={border || '1px solid #282d3d'}
          fontWeight={['500']}
          fontSize={['14px']}
          lineHeight={['16px']}
          display={'flex'}
          alignItems={'center'}
          flexWrap={'nowrap'}
          gridGap={'8px'}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setIsOpened(!isOpened);
          }}
        >
          {before}
          {currentOption?.text}
          <Box ml={'auto'} display={'flex'} alignItems={'center'}>
            <NarrowIcon dir={isOpened ? 'up' : 'down'} />
          </Box>
          {after}
        </Box>
      )}
      <DropPannel
        bgcolor={'#1b1e29'}
        position={'absolute'}
        top={'110%'}
        right={'0px'}
        border={'1px solid #282d3d'}
        borderRadius={'8px'}
        ref={dropPannel}
        display={'flex'}
        flexDirection={'column'}
        zIndex={3}
        style={{
          visibility: isOpened ? 'visible' : 'hidden',
          opacity: isOpened ? '1' : '0',
        }}
      >
        {optionList
          ? optionList.map((each: any, index: any) => {
              return (
                <SmOption
                  key={index}
                  onClick={() => {
                    setIsOpened(false);
                    if (currentOption.value === each.value) return;
                    setCurrentOption(each);
                    onChange && onChange(each.value);
                  }}
                >
                  {each.text}
                </SmOption>
              );
            })
          : 'Here is not any options.'}
      </DropPannel>
    </DropBox>
  );
};

interface RefProps {
  ref: any;
}
const DropPannel = styled(Box)<RefProps>`
  transition: var(--transition);
`;
const DropBox = styled(Box)<RefProps>``;

interface SmOptionProps {
  value: any;
  [index: string]: any;
}
export const SmOption = styled.div<SmOptionProps>`
  padding: 8px 16px;
  white-space: nowrap;
  color: #626680;
  cursor: pointer;
  border-bottom: 1px solid #282d3d;
  &:last-child {
    border: none;
  }
  &:hover {
    background: #8888;
  }
`;
SmOption.defaultProps = {
  customTagType: '--411customisedOption--',
};

interface IconProps {
  size?: any;
  color?: any;
}
interface NarrowIconProps extends IconProps {
  dir?: any;
}
const NarrowIcon: React.FC<NarrowIconProps> = ({
  size = '1em',
  color = 'currentColor',
  dir,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={{
        transform: `scale(${
          dir === 'up' || dir === 'right' ? '-1' : '1'
        }) rotate(${dir === 'right' || dir === 'left' ? '90' : '0'}deg)`,
      }}
    >
      <path
        d='M4 6L8 10L12 6'
        stroke={color}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
const DropdownItem = styled(Box)`
  & > * {
    padding: 5px;
  }
  & > *:hover {
    background: #8888;
  }
`;
