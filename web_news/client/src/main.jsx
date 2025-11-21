import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from "./context/authContext"; // <--- Import cái này

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider> {/* <--- Bọc App lại */}
      <App />
    </AuthContextProvider>
  </React.StrictMode>,
)