import { createBrowserRouter } from "react-router-dom";
import ReportsPage from "./pages/ReportsPage";
import InventoryPage from "./pages/InventoryPage";
import PosPage from "./pages/PosPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import CreditPage from "./pages/CreditPage";
import CustomersPage from "./pages/CustomersPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ReportsPage />,
  },
  {
    path: "/inventory",
    element: <InventoryPage />,
  },
  {
    path: "/pos",
    element: <PosPage />,
  },
  {
    path: "/reconciliation",
    element: <ReconciliationPage />,
  },
  {
    path: "/credit",
    element: <CreditPage />,
  },
  {
    path: "/customer",
    element: <CustomersPage />,
  },
]);

export default router;