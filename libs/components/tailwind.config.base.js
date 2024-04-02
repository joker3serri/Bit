/* eslint-disable */
const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

function rgba(color) {
  return "rgb(var(" + color + ") / <alpha-value>)";
}

module.exports = {
  prefix: "tw-",
  content: [
    "./src/**/*.{html,ts}",
    "../../libs/components/src/**/*.{html,ts}",
    "../../libs/auth/src/**/*.{html,ts}",
  ],
  safelist: [],
  corePlugins: { preflight: false },
  theme: {
    colors: {
      transparent: {
        DEFAULT: colors.transparent,
        hover: "var(--color-transparent-hover)",
      },
      current: colors.current,
      black: colors.black,
      info: {
        50: rgba("--color-info-50"),
        100: rgba("--color-info-100"),
        200: rgba("--color-info-200"),
        300: rgba("--color-info-300"),
        400: rgba("--color-info-400"),
        500: rgba("--color-info-500"),
        600: rgba("--color-info-600"),
        700: rgba("--color-info-700"),
        800: rgba("--color-info-800"),
        900: rgba("--color-info-900"),
      },
      primary: {
        50: rgba("--color-primary-50"),
        100: rgba("--color-primary-100"),
        200: rgba("--color-primary-200"),
        300: rgba("--color-primary-300"),
        400: rgba("--color-primary-400"),
        500: rgba("--color-primary-500"),
        600: rgba("--color-primary-600"),
        700: rgba("--color-primary-700"),
        800: rgba("--color-primary-800"),
        900: rgba("--color-primary-900"),
      },
      secondary: {
        50: rgba("--color-secondary-50"),
        100: rgba("--color-secondary-100"),
        200: rgba("--color-secondary-200"),
        300: rgba("--color-secondary-300"),
        400: rgba("--color-secondary-400"),
        500: rgba("--color-secondary-500"),
        600: rgba("--color-secondary-600"),
        700: rgba("--color-secondary-700"),
        800: rgba("--color-secondary-800"),
        900: rgba("--color-secondary-900"),
      },
      success: {
        50: rgba("--color-success-50"),
        100: rgba("--color-success-100"),
        200: rgba("--color-success-200"),
        300: rgba("--color-success-300"),
        400: rgba("--color-success-400"),
        500: rgba("--color-success-500"),
        600: rgba("--color-success-600"),
        700: rgba("--color-success-700"),
        800: rgba("--color-success-800"),
        900: rgba("--color-success-900"),
      },
      danger: {
        50: rgba("--color-danger-50"),
        100: rgba("--color-danger-100"),
        200: rgba("--color-danger-200"),
        300: rgba("--color-danger-300"),
        400: rgba("--color-danger-400"),
        500: rgba("--color-danger-500"),
        600: rgba("--color-danger-600"),
        700: rgba("--color-danger-700"),
        800: rgba("--color-danger-800"),
        900: rgba("--color-danger-900"),
      },
      warning: {
        50: rgba("--color-warning-50"),
        100: rgba("--color-warning-100"),
        200: rgba("--color-warning-200"),
        300: rgba("--color-warning-300"),
        400: rgba("--color-warning-400"),
        500: rgba("--color-warning-500"),
        600: rgba("--color-warning-600"),
        700: rgba("--color-warning-700"),
        800: rgba("--color-warning-800"),
        900: rgba("--color-warning-900"),
      },
      text: {
        main: rgba("--color-text-main"),
        muted: rgba("--color-text-muted"),
        contrast: rgba("--color-text-contrast"),
        alt2: rgba("--color-text-alt2"),
        code: rgba("--color-text-code"),
      },
      background: {
        DEFAULT: rgba("--color-background"),
        alt: rgba("--color-background-alt"),
        alt2: rgba("--color-background-alt2"),
        alt3: rgba("--color-background-alt3"),
        alt4: rgba("--color-background-alt4"),
      },
    },
    textColor: {
      main: rgba("--color-text-main"),
      muted: rgba("--color-text-muted"),
      contrast: rgba("--color-text-contrast"),
      alt2: rgba("--color-text-alt2"),
      code: rgba("--color-text-code"),
      success: rgba("--color-success-500"),
      danger: rgba("--color-danger-500"),
      warning: rgba("--color-warning-500"),
      info: rgba("--color-info-500"),
      primary: {
        300: rgba("--color-primary-300"),
        500: rgba("--color-primary-500"),
        700: rgba("--color-primary-700"),
      },
    },
    ringOffsetColor: ({ theme }) => ({
      DEFAULT: theme("colors.background"),
      ...theme("colors"),
    }),
    extend: {
      width: {
        "50vw": "50vw",
        "75vw": "75vw",
      },
      minWidth: {
        52: "13rem",
      },
      maxWidth: ({ theme }) => ({
        ...theme("width"),
        "90vw": "90vw",
      }),
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme, addUtilities, addComponents, e, config }) {
      matchUtilities(
        {
          "mask-image": (value) => ({
            "-webkit-mask-image": value,
            "mask-image": value,
          }),
          "mask-position": (value) => ({
            "-webkit-mask-position": value,
            "mask-position": value,
          }),
          "mask-repeat": (value) => ({
            "-webkit-mask-repeat": value,
            "mask-repeat": value,
          }),
        },
        {},
      );
    }),
  ],
};
