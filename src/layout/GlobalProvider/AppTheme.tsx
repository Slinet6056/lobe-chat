'use client';

import {
  ConfigProvider,
  FontLoader,
  NeutralColors,
  PrimaryColors,
  ThemeProvider,
} from '@lobehub/ui';
import { ThemeAppearance, createStyles } from 'antd-style';
import 'antd/dist/reset.css';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, memo, useEffect, useMemo } from 'react';

import AntdStaticMethods from '@/components/AntdStaticMethods';
import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import {
  catppuccinFrappe,
  catppuccinLatte,
  catppuccinMacchiato,
  catppuccinMocha,
  convertCatppuccinToThemeToken,
} from '@/const/theme/catppuccin';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';
import { GlobalStyle } from '@/styles';
import { setCookie } from '@/utils/client/cookie';

const useStyles = createStyles(({ css, token }) => ({
  app: css`
    position: relative;

    overscroll-behavior: none;
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;
    min-height: 100dvh;
    max-height: 100dvh;

    @media (min-device-width: 576px) {
      overflow: hidden;
    }
  `,
  // scrollbar-width and scrollbar-color are supported from Chrome 121
  // https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
  scrollbar: css`
    scrollbar-color: ${token.colorFill} transparent;
    scrollbar-width: thin;

    #lobe-mobile-scroll-container {
      scrollbar-width: none;

      ::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
  `,

  // so this is a polyfill for older browsers
  scrollbarPolyfill: css`
    ::-webkit-scrollbar {
      width: 0.75em;
      height: 0.75em;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
    }

    :hover::-webkit-scrollbar-thumb {
      border: 3px solid transparent;
      background-color: ${token.colorText};
      background-clip: content-box;
    }

    ::-webkit-scrollbar-track {
      background-color: transparent;
    }
  `,
}));

export interface AppThemeProps {
  children?: ReactNode;
  customFontFamily?: string;
  customFontURL?: string;
  defaultAppearance?: ThemeAppearance;
  defaultNeutralColor?: NeutralColors;
  defaultPrimaryColor?: PrimaryColors;
  globalCDN?: boolean;
}

const AppTheme = memo<AppThemeProps>(
  ({
    children,
    defaultAppearance,
    defaultPrimaryColor,
    defaultNeutralColor,
    globalCDN,
    customFontURL,
    customFontFamily,
  }) => {
    // console.debug('server:appearance', defaultAppearance);
    // console.debug('server:primaryColor', defaultPrimaryColor);
    // console.debug('server:neutralColor', defaultNeutralColor);
    const themeMode = useUserStore(userGeneralSettingsSelectors.currentThemeMode);
    const { styles, cx, theme } = useStyles();
    const [primaryColor, neutralColor] = useUserStore((s) => [
      userGeneralSettingsSelectors.primaryColor(s),
      userGeneralSettingsSelectors.neutralColor(s),
    ]);

    // 根据主题模式和中性色选择应用 Catppuccin 风格
    const catppuccinTokens = useMemo(() => {
      // 浅色模式固定使用 Latte 变体
      if (themeMode !== 'dark') {
        return convertCatppuccinToThemeToken(catppuccinLatte);
      }

      // 深色模式根据选择的中性色应用不同的 Catppuccin 变体
      const neutralColorValue = neutralColor as string;

      if (neutralColorValue === 'frappe') {
        return convertCatppuccinToThemeToken(catppuccinFrappe);
      }

      if (neutralColorValue === 'macchiato') {
        return convertCatppuccinToThemeToken(catppuccinMacchiato);
      }

      if (neutralColorValue === 'mocha') {
        return convertCatppuccinToThemeToken(catppuccinMocha);
      }

      // 如果没有选择 Catppuccin 风格，则使用默认的中性色
      return {};
    }, [themeMode, neutralColor]);

    // 根据主题色选择应用 Catppuccin 的主题色
    const catppuccinPrimaryTokens = useMemo(() => {
      // 如果主题色是 Catppuccin 的颜色，则应用对应的主题色
      const primaryColorValue = primaryColor as string;

      // 检查是否是 Catppuccin 的颜色
      const isCatppuccinColor =
        Object.values(catppuccinLatte).includes(primaryColorValue) ||
        Object.values(catppuccinFrappe).includes(primaryColorValue) ||
        Object.values(catppuccinMacchiato).includes(primaryColorValue) ||
        Object.values(catppuccinMocha).includes(primaryColorValue);

      if (isCatppuccinColor) {
        return {
          colorPrimary: primaryColorValue,
          colorPrimaryActive: primaryColorValue,
          colorPrimaryBg: primaryColorValue,
          colorPrimaryBgHover: primaryColorValue,
          colorPrimaryBorder: primaryColorValue,
          colorPrimaryBorderHover: primaryColorValue,
          colorPrimaryHover: primaryColorValue,
          colorPrimaryText: primaryColorValue,
          colorPrimaryTextActive: primaryColorValue,
          colorPrimaryTextHover: primaryColorValue,
        };
      }

      return {};
    }, [primaryColor]);

    useEffect(() => {
      setCookie(LOBE_THEME_PRIMARY_COLOR, primaryColor);
    }, [primaryColor]);

    useEffect(() => {
      setCookie(LOBE_THEME_NEUTRAL_COLOR, neutralColor);
    }, [neutralColor]);

    return (
      <ThemeProvider
        className={cx(styles.app, styles.scrollbar, styles.scrollbarPolyfill)}
        customTheme={{
          neutralColor: neutralColor ?? defaultNeutralColor,
          primaryColor: primaryColor ?? defaultPrimaryColor,
        }}
        defaultAppearance={defaultAppearance}
        onAppearanceChange={(appearance) => {
          setCookie(LOBE_THEME_APPEARANCE, appearance);
        }}
        theme={{
          cssVar: true,
          token: {
            fontFamily: customFontFamily ? `${customFontFamily},${theme.fontFamily}` : undefined,
            // 应用 Catppuccin 风格的主题变量
            ...catppuccinTokens,
            // 应用 Catppuccin 主题色
            ...catppuccinPrimaryTokens,
          },
        }}
        themeMode={themeMode}
      >
        {!!customFontURL && <FontLoader url={customFontURL} />}
        <GlobalStyle />
        <AntdStaticMethods />
        <ConfigProvider
          config={{
            aAs: Link,
            imgAs: Image,
            imgUnoptimized: true,
            proxy: globalCDN ? 'unpkg' : undefined,
          }}
        >
          {children}
        </ConfigProvider>
      </ThemeProvider>
    );
  },
);

export default AppTheme;
