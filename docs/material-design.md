# Material Design 3

[Material Design 3](https://m3.material.io/) (Material You) is Google's latest design system. It focuses on personalisation, accessibility and design tokens that scale across platforms.

## Core principles

- **Dynamic color** – themes derive from user-selected colors to create expressive palettes.
- **Typography** – an updated type scale and guidance for legible, accessible text.
- **Shape and layout** – large corner radii, responsive grids and adaptive patterns.
- **Motion** – stateful transitions that reinforce hierarchy and meaning.
- **Design tokens** – component values are defined as tokens for consistent theming.

## MUI resources

[MUI](https://mui.com/) provides React components that implement Material Design. Useful links include:

- [Material UI overview](https://mui.com/material-ui/getting-started/overview/)
- [Theming guide](https://mui.com/material-ui/customization/theming/)
- [Component documentation](https://mui.com/material-ui/react-button/) (replace `button` with any component name)

These resources show how to build interfaces that align with Material Design 3.

## Avatar

The Avatar component follows the Material Design 3 guidelines for representing users.

- [M3 avatar spec](https://m3.material.io/components/avatar/overview)
- [MUI Avatar docs](https://mui.com/material-ui/react-avatar/)

## Bottom sheet

Bottom sheets slide up from the bottom of the screen to reveal contextual actions or content. Our implementation uses MUI's
`SwipeableDrawer` configured for mobile.

- [M3 bottom sheet spec](https://m3.material.io/components/bottom-sheets/overview)
- [MUI SwipeableDrawer docs](https://mui.com/material-ui/react-drawer/#swipeable)

## Card

Cards group related information and actions. The profile view uses a Material 3 card via MUI's `Card`, `CardHeader`, and `CardContent` components.

- [M3 card spec](https://m3.material.io/components/cards/overview)
- [MUI Card docs](https://mui.com/material-ui/react-card/)

