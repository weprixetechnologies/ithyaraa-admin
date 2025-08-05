
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

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        <Route path='/' element={<AddUser />}></Route>

        {/* USER MANAGEMENT - ROUTES */}
        <Route path='/users/list' element={<ListUsers />} />
        <Route path='/users/add' element={<AddUser />} />

        {/* VENDOR MANAGEMENT - ROUTES */}
        <Route path='/vendors/add' element={<VendorDetails />} />

        {/* ORDER MANAGEMENT - ROUTES  */}
        <Route path='/orders/list' element={<ListOrders />} />
        <Route path='/orders/details' element={<OrderDetail />} />

        {/* PRODUCTS */}
        <Route path='/products/add' element={<AddProduct />}></Route>
        <Route path='/products/list' element={<ListProducts />}></Route>
        <Route path='/products/details/:productID' element={<EditProduct />}></Route>

        {/* AUTH */}
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
