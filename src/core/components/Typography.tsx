import React from 'react';
import { Text, TextProps } from 'react-native';
import theme from '../utils/styles/styles';

type TypographyTypes = keyof typeof theme.typography
type TypographyColorTypes = keyof typeof theme.colors.text

type Props = {
    variant?: TypographyTypes;
    color?: TypographyColorTypes;
} & TextProps;

const Typography = ({ 
    variant = 'text01Regular',
    color = 'textPrimary',
    style,
    children = '',
    ...rest
}: Props) => {
  
    return <Text 
        allowFontScaling={false}
        style={[
            { color: theme.colors.text[color] },
            theme.typography[variant],
            style
        ]}
        {...rest}
    >
        {children}
    </Text>
};

export { Typography };
