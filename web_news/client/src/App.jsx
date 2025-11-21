import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Single from "./pages/Single";
import Write from "./pages/Write";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./style.scss";

const Layout = () => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      
      {/* CHỈ CÓ NỘI DUNG CHÍNH LÀ BỊ GIỚI HẠN CHIỀU RỘNG */}
      <div className="main-content">
        <Outlet />
      </div>

      {/* FOOTER NẰM NGOÀI CÙNG -> TỰ ĐỘNG TRÀN VIỀN */}
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/post/:id", element: <Single /> },
      { path: "/write", element: <Write /> },
    ],
  },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
]);

function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;