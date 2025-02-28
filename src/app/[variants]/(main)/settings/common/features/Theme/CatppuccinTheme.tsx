'use client';

import { Swatches } from '@lobehub/ui';
import { memo } from 'react';

import { catppuccinFrappe, catppuccinMacchiato, catppuccinMocha } from '@/const/theme/catppuccin';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

// 创建 Catppuccin 风格的颜色样本和标签
const catppuccinOptions = [
  { color: catppuccinFrappe.base, label: 'Frappé', value: 'frappe' },
  { color: catppuccinMacchiato.base, label: 'Macchiato', value: 'macchiato' },
  { color: catppuccinMocha.base, label: 'Mocha', value: 'mocha' },
];

// 提取颜色样本数组
const catppuccinSwatches = catppuccinOptions.map((option) => option.color);

// 创建 Catppuccin 风格的颜色映射
const catppuccinColors: Record<string, string> = Object.fromEntries(
  catppuccinOptions.map((option) => [option.value, option.color]),
);

const CatppuccinTheme = memo(() => {
  const [neutralColor, updateGeneralConfig, themeMode] = useUserStore((s) => [
    userGeneralSettingsSelectors.neutralColor(s),
    s.updateGeneralConfig,
    userGeneralSettingsSelectors.currentThemeMode(s),
  ]);

  // 只有在深色模式下才显示 Catppuccin 的中性色选项
  const isDarkMode = themeMode === 'dark';
  if (!isDarkMode) return null;

  const handleSelect = (c?: string) => {
    if (!c) return;

    // 根据选择的颜色找到对应的 Catppuccin 风格
    const option = catppuccinOptions.find((opt) => opt.color === c);
    if (option) {
      updateGeneralConfig({ neutralColor: option.value as any });
    }
  };

  return (
    <Swatches
      activeColor={
        neutralColor && catppuccinColors[neutralColor] ? catppuccinColors[neutralColor] : undefined
      }
      colors={catppuccinSwatches}
      onSelect={handleSelect}
    />
  );
});

export default CatppuccinTheme;
