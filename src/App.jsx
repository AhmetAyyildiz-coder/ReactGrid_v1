import { useState } from 'react'
import './App.css'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import CustomerGrid from "./components/CustomerGrid.jsx";
import OrderGrid from './components/OrderGrid.jsx';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';



function App() {
  const [count, setCount] = useState(0)

    const theme = createTheme({
        palette: {
            mode: 'light', // Temayı light mode olarak ayarlar
        },
    });

  return (
    <>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
            <ThemeProvider theme={theme}>
                <CssBaseline />
              <OrderGrid />

            </ThemeProvider>
        </LocalizationProvider>
    </>
  )
}

export default App
