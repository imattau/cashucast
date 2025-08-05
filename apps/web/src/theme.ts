/*
 * Licensed under GPL-3.0-or-later
 * Material UI theme configuration.
 */
import { experimental_extendTheme as extendTheme } from "@mui/material/styles";

// See https://m3.material.io/styles/color/the-color-system for Material 3 color and theming guidelines.
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#6750A4",
        },
        secondary: {
          main: "#625B71",
        },
      },
    },
  },
});

export default theme;

