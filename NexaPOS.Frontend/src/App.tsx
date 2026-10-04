import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import POS from "./pages/pos/POS";
import Products from "./pages/products/Products";
import Inventory from "./pages/inventory/Inventory";
import Purchases from "./pages/purchases/Purchases";
import Customers from "./pages/customers/Customers";
import Sales from "./pages/sales/Sales";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />}/>
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/customers" element={<Customers />}/>
          <Route path="/sales" element={<Sales />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;