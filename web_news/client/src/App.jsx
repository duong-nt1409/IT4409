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
import ErrorPage from "./pages/Error";
import LoginEditor from "./pages/Login-Editor";
import RegisterEditor from "./pages/Register-Editor";
import EditorPage from "./pages/Page-Editor";
import Profile from "./pages/Profile";
import SavedPosts from "./pages/SavedPosts"; 
import ViewedPosts from "./pages/ViewedPosts"
import AdminDashboard from "./pages/AdminDashboard"; // Import Admin Dashboard
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
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "post/:id", element: <Single /> },
      { path: "write", element: <Write /> },
      { path: "editor", element: <EditorPage /> },
    ],
  },
  { path: "/register", element: <Register />, errorElement: <ErrorPage /> },
  { path: "/login", element: <Login />, errorElement: <ErrorPage /> },
  { path: "/editor-login", element: <LoginEditor />, errorElement: <ErrorPage /> },
  { path: "/register-editor", element: <RegisterEditor />, errorElement: <ErrorPage /> },
  { path: "/admin", element: <AdminDashboard />, errorElement: <ErrorPage /> }, // Route Admin riêng biệt (không dùng Layout chung)
  { path: "*", element: <ErrorPage /> },
  { path: "/profile", element: <Profile /> },
  { path: "/saved-posts", element: <SavedPosts /> }, 
      { path: "/viewed-posts", element: <ViewedPosts /> },
]);

function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;