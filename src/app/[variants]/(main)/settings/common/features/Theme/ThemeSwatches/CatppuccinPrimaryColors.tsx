import { Swatches } from '@lobehub/ui';
import { memo, useMemo } from 'react';

import {
  catppuccinFrappe,
  catppuccinLatte,
  catppuccinMacchiato,
  catppuccinMocha,
} from '@/const/theme/catppuccin';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

// 定义 Catppuccin 颜色属性
const colorKeys = [
  'rosewater',
  'flamingo',
  'pink',
  'mauve',
  'red',
  'maroon',
  'peach',
  'yellow',
  'green',
  'teal',
  'sky',
  'sapphire',
  'blue',
  'lavender',
];

const CatppuccinPrimaryColors = memo(() => {
  const [updateGeneralConfig, neutralColor, themeMode] = useUserStore((s) => [
    s.updateGeneralConfig,
    userGeneralSettingsSelectors.neutralColor(s),
    userGeneralSettingsSelectors.currentThemeMode(s),
  ]);

  // 根据当前主题模式和中性色选择确定使用哪个 Catppuccin 变体的颜色
  const currentPalette = useMemo(() => {
    // 浅色模式固定使用 Latte 变体
    if (themeMode !== 'dark') {
      return catppuccinLatte;
    }

    // 深色模式根据选择的中性色应用不同的 Catppuccin 变体
    const neutralColorValue = neutralColor as string;

    if (neutralColorValue === 'frappe') {
      return catppuccinFrappe;
    }

    if (neutralColorValue === 'macchiato') {
      return catppuccinMacchiato;
    }

    if (neutralColorValue === 'mocha') {
      return catppuccinMocha;
    }

    // 默认使用 Mocha 变体
    return catppuccinMocha;
  }, [themeMode, neutralColor]);

  // 根据当前选择的 Catppuccin 变体生成颜色样本
  const catppuccinColorSwatches = useMemo(() => {
    return colorKeys.map((key) => currentPalette[key as keyof typeof currentPalette]);
  }, [currentPalette]);

  const handleSelect = (c?: string) => {
    if (!c) return;

    // 直接使用颜色值
    const validColor = c.startsWith('#') ? c : `#${c}`;
    updateGeneralConfig({ primaryColor: validColor as any });
  };

  return <Swatches colors={catppuccinColorSwatches} onSelect={handleSelect} />;
});

export default CatppuccinPrimaryColors;
