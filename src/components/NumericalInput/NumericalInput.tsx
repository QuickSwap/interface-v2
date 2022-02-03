import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { escapeRegExp } from 'utils';

const useStyles = makeStyles(({ palette }) => ({
  styledInput: {
    width: '100%',
    position: 'relative',
    outline: 'none',
    border: 'none',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitAppearance: 'textfield',
    background: 'transparent',
    boxShadow: 'none',
    textAlign: (props: any) => props.align ?? 'left',
    color: (props: any) => props.color ?? palette.text.primary,
    fontSize: (props: any) => props.fontSize ?? 18,
    fontWeight: (props: any) => props.fontWeight ?? 600,

    '&::placeholder': {
      color: (props: any) => props.placeholderColor ?? palette.text.secondary,
    },

    '&::-webkit-search-decoration': {
      WebkitAppearance: 'none',
    },

    '& [type="number"]': {
      MozAppearance: 'textfield',
    },

    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      WebkitAppearance: 'none',
    },
  },
}));

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  fontSize,
  color,
  fontWeight,
  placeholderColor,
  align,
  ...rest
}: {
  value: string | number;
  onUserInput: (input: string) => void;
  error?: boolean;
  fontSize?: number;
  fontWeight?: string | number;
  placeholderColor?: string;
  align?: 'right' | 'left';
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const classes = useStyles({
    fontSize,
    color,
    fontWeight,
    placeholderColor,
    align,
  });
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput);
    }
  };

  return (
    <input
      {...rest}
      className={classes.styledInput}
      value={value}
      onChange={(event) => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        enforcer(event.target.value.replace(/,/g, '.'));
      }}
      // universal input options
      inputMode='decimal'
      autoComplete='off'
      autoCorrect='off'
      // text-specific options
      type='text'
      pattern='^[0-9]*[.,]?[0-9]*$'
      placeholder={placeholder || '0.0'}
      minLength={1}
      maxLength={79}
      spellCheck='false'
    />
  );
});

export default Input;
