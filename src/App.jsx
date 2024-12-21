import { useState } from 'react'
import './App.css'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import CustomerGrid from "./components/CustomerGrid.jsx";



function App() {
  const [count, setCount] = useState(0)

    const theme = createTheme({
        palette: {
            mode: 'light', // Temayı light mode olarak ayarlar
        },
    });

  return (
    <>
        <ThemeProvider theme={theme}>
            <CssBaseline />
           <CustomerGrid />

        </ThemeProvider>
    </>
  )
}

export default App
