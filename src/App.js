import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import AddUser from './views/users/addUser';
import ListUsers from './views/users/listUsers';
import VendorDetails from './views/users/vendorDetails';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ListOrders from './views/orders/listOrders';
import OrderDetail from './views/orders/orderDetail';
import Login from './views/auth/login';
import AddProduct from './views/products/addProduct';
import ListProducts from './views/products/listProducts';
import EditProduct from './views/products/editProduct';
import ListCategory from './views/categories/listCategory';
import AddCategory from './views/categories/addCategory';
import EditCategory from './views/categories/editCategory';
import AddOffer from './views/offer/addOffer';
import ListOffers from './views/offer/listOffer';
import EditOffer from './views/offer/editOffer';
import ListCoupons from './views/coupons/listCoupons';
import AddCoupon from './views/coupons/addCoupon';
import EditCoupon from './views/coupons/editCoupon';
import AddMakeCombo from './views/makeCombo/addMakeCombo';
import ListMakeCombo from './views/makeCombo/listMakeCombo';
import EditMakeCombo from './views/makeCombo/editMakeCombo';
import AddCombo from './views/combo/addCombo';
import ListCombo from './views/combo/listCombo';
import EditCombo from './views/combo/editCombo';
import ProtectedRoute from './views/protectedRoute';
import AddCustomProduct from './views/custom-product/addcustomProduct';
import CustomProductList from './views/custom-product/listCustomProducts';
import Dashboard from './views/dashboard/dashboard';
import ListPayouts from './views/payout/listPayouts';

// Simple 404 component
export const NotFound = () => (
  <div className="flex-center h-[100vh] text-white bg-[#0a0a0a]">
    <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
  </div>
);

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        {/* Unprotected login */}
        <Route path="/login" element={<Login />} />

        {/* All other routes protected */}
        <Route path="/" element={<ProtectedRoute>     <Dashboard />   </ProtectedRoute>} />
        <Route path="/users/list" element={<ProtectedRoute>     <ListUsers />   </ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute>     <AddUser />   </ProtectedRoute>} />
        <Route path="/vendors/add" element={<ProtectedRoute>     <VendorDetails />   </ProtectedRoute>} />
        <Route path="/orders/list" element={<ProtectedRoute>     <ListOrders />   </ProtectedRoute>} />
        <Route path="/orders/details/:orderId" element={<ProtectedRoute>     <OrderDetail />   </ProtectedRoute>} />

        <Route path="/products/add" element={<ProtectedRoute>     <AddProduct />   </ProtectedRoute>} />
        <Route path="/products/list" element={<ProtectedRoute>     <ListProducts />   </ProtectedRoute>} />
        <Route path="/products/details/:productID" element={<ProtectedRoute>     <EditProduct />   </ProtectedRoute>} />

        <Route path="/categories/list" element={<ProtectedRoute>     <ListCategory />   </ProtectedRoute>} />
        <Route path="/categories/add" element={<ProtectedRoute>     <AddCategory />   </ProtectedRoute>} />
        <Route path="/categories/details/:categoryID" element={<ProtectedRoute>     <EditCategory />   </ProtectedRoute>} />

        <Route path="/offer/add" element={<ProtectedRoute>     <AddOffer />   </ProtectedRoute>} />
        <Route path="/offer/list" element={<ProtectedRoute>     <ListOffers />   </ProtectedRoute>} />
        <Route path="/offer/details/:offerID" element={<ProtectedRoute>     <EditOffer />   </ProtectedRoute>} />

        <Route path="/coupons/add" element={<ProtectedRoute>     <AddCoupon />   </ProtectedRoute>} />
        <Route path="/coupons/list" element={<ProtectedRoute>     <ListCoupons />   </ProtectedRoute>} />
        <Route path="/coupons/edit/:couponID" element={<ProtectedRoute>     <EditCoupon />   </ProtectedRoute>} />

        <Route path="/make-combo/add" element={<ProtectedRoute>     <AddMakeCombo />   </ProtectedRoute>} />
        <Route path="/make-combo/list" element={<ProtectedRoute>     <ListMakeCombo />   </ProtectedRoute>} />
        <Route path="/make-combo/detail/:comboID" element={<ProtectedRoute>     <EditMakeCombo />   </ProtectedRoute>} />

        <Route path="/combo/add" element={<ProtectedRoute>     <AddCombo />   </ProtectedRoute>} />
        <Route path="/combo/list" element={<ProtectedRoute>     <ListCombo />   </ProtectedRoute>} />
        <Route path="/combo/detail/:comboID" element={<ProtectedRoute>     <EditCombo />   </ProtectedRoute>} />

        <Route path='/custom-product/add' element={<AddCustomProduct />} />
        <Route path='/custom-product/list' element={<CustomProductList />} />

        <Route path="/payout/list" element={<ProtectedRoute>     <ListPayouts />   </ProtectedRoute>} />

        {/* 404 - catch all other routes */}
        <Route path="*" element={<ProtectedRoute>     <NotFound />   </ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
