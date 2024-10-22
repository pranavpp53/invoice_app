import { Navigate, createBrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./Layout/Layout.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import UserRole from "./Pages/UserRole.jsx";
import DashBoard from "./Pages/DashBoard.jsx";
import SubUser from "./Pages/SubUser.jsx";
import Profile from "./Pages/Profile.jsx";
import PrivateRoute from "./utils/PrivateRoute.jsx";
import Settings from "./Pages/Settings.jsx";
import Customers from "./Pages/Customers.jsx";
import Invoices from "./Pages/Invoices.jsx";
import Documents from "./Pages/Documents.jsx";
import InvoiceForm from "./Form/InvoiceForm.jsx";
import ViewFile from "./Component/ViewFile.jsx";
import Ledger from "./Pages/Ledger.jsx";
import ExportInvoices from "./Pages/ExportInvoices.jsx";

const LoginRoute = () => {
  const isAuth = useSelector((state) => state.auth.token);
  return isAuth ? <Navigate to="/dashboard" /> : <LoginPage />;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />,
  },
  {
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <DashBoard />,
      },
      {
        path: "/dashboard",
        element: <DashBoard />,
      },
      {
        path: "/subuser",
        element: <SubUser />,
      },
      {
        path: "/user_roles",
        element: <UserRole />,
      },

      {
        path: "/profile",
        element: <Profile />,
      },

      {
        path: "settings",
        element: <Settings />,
      },

      {
        path: "/customers",
        element: <Customers />,
      },

      {
        path: "/documents",
        element: <Documents />,
      },

      {
        path: "/documents/:documentId",
        element: <Invoices />,
      },

      {
        path: "/documents/:documentId/:invoiceId",
        element: <ViewFile />,
      },

      {
        path: "/documents/add_document",
        element: <InvoiceForm />,
      },

      {
        path: "/documents/edit_document/:docId",
        element: <InvoiceForm />,
      },

      {
        path: "/ledger",
        element: <Ledger />,
      },

      {
        path: "/documents/exportinvoices",
        element: <ExportInvoices />,
      },
    ],
  },
]);

export default router;
