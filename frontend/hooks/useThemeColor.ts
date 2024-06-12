import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeContext';
import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeColor must be used within a ThemeProvider');
  }

  const { theme } = context;
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
