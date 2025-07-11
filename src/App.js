import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Dashboard from './screens/dashboard';
import AddProduct from './screens/products/addProduct';
import AllProducts from './screens/products/allProducts';
import EditProduct from './screens/products/editProduct';
import AllUsers from './screens/users/allUsers';
import AddUser from './screens/users/addUser';
import AddCategory from './screens/categories/addCategory';
import AddCombo from './screens/combo/addCombo';
import PhoneLogin from './auth/loginphone';
import MakeCombo from './screens/combo/makeCombo';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />}></Route>

      {/* PRODUCTS */}
      <Route path='/add-product' element={<AddProduct />}></Route>
      <Route path='/all-products' element={<AllProducts />}></Route>
      <Route path='/all-products/:id' element={<EditProduct />}></Route>

      {/* USER */}
      <Route path='/all-users' element={<AllUsers />}></Route>
      <Route path='/add-user' element={<AddUser />}></Route>

      {/* CATEGORY */}
      <Route path='/add-category' element={<AddCategory />}></Route>

      {/* COMBO */}
      <Route path='/combo' element={<AddCombo />} />
      <Route path='/add-combo' element={<AddCombo />} />
      <Route path='/make-combo' element={<MakeCombo />} />

      {/* AUTH PAGE */}
      <Route path='/login' element={<Login />}></Route>
      <Route path='/login-phone' element={<PhoneLogin />}></Route>
    </Routes>
  );
}

export default App;
