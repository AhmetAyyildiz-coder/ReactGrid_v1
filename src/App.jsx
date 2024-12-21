import { useState } from 'react'
import './App.css'
import {createTheme, CssBaseline, ThemeProvider, Box} from "@mui/material";
import CustomerGrid from "./components/CustomerGrid.jsx";
import OrderGrid from './components/OrderGrid.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';
import CustomerOrdersGrid from './components/CustomerOrdersGrid';



function App() {
  const [count, setCount] = useState(0)

    const theme = createTheme({
        palette: {
            mode: 'light', // Temayı light mode olarak ayarlar
        },
        components: {
            MuiContainer: {
                styleOverrides: {
                    root: {
                        maxWidth: 'none !important',
                        padding: '10px !important',
                        margin: '0 !important'
                    }
                }
            }
        }
    });

  return (
    <>
        <style>
            {`
                body {
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }
                #root {
                    width: 100vw;
                    margin: 0;
                    padding: 0;
                }
            `}
        </style>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ 
                    width: '100vw',
                    margin: 0,
                    padding: 20,
                    overflow: 'hidden'
                }}>
                    <CustomerOrdersGrid />
                </Box>
            </ThemeProvider>
        </LocalizationProvider>
    </>
  )
}

export default App
