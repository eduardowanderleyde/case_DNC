import '@testing-library/jest-dom';

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => ({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#d32f2f' },
    },
  }),
})); 