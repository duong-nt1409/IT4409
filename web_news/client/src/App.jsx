import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

// Import các trang vừa tạo
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Single from "./pages/Single";
import Write from "./pages/Write";
import "./style.scss";
import Navbar from "./components/Navbar";

// 1. Tạo Layout chung (Có Navbar + Footer)
const Layout = () => {
  return (
    <>
      <Navbar />  {/* Thay thế dòng text cũ */}
      <Outlet />
      <div className="footer">FOOTER (Chân trang)</div>
    </>
  );
};

// 2. Định nghĩa các đường dẫn
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/post/:id",
        element: <Single />,
      },
      {
        path: "/write",
        element: <Write />,
      },
    ],
  },
  // Login và Register nằm NGOÀI Layout (không cần Navbar/Footer)
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

// 3. Render ứng dụng
function App() {
  return (
    <div className="app">
       <RouterProvider router={router} />
    </div>
  );
}

export default App;