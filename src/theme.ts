'use client';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const theme = createTheme({
    colorSchemes: {
        dark: true
    },
    typography: {
        fontFamily: [
            'Open Sans Variable',
            'Roboto',
            'sans-serif'
        ].join(','),
    }
});

export default theme;
