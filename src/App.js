
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

        <Route path='/categories/list' element={<ListCategory />}></Route>
        <Route path='/categories/add' element={<AddCategory />}></Route>
        <Route path='/categories/details/:categoryID' element={<EditCategory />}></Route>

        <Route path='/offer/add' element={<AddOffer />}></Route>
        <Route path='/offer/list' element={<ListOffers />}></Route>
        <Route path='/offer/details/:offerID' element={<EditOffer />}></Route>

        <Route path='/coupons/add' element={<AddCoupon />} />
        <Route path='/coupons/list' element={<ListCoupons />} />
        <Route path="/coupons/edit/:couponID" element={<EditCoupon />} />

        <Route path='/make-combo/add' element={<AddMakeCombo />} />
        <Route path='/make-combo/list' element={<ListMakeCombo />} />
        <Route path='/make-combo/detail/:comboID' element={<EditMakeCombo />} />
        {/* AUTH */}
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
