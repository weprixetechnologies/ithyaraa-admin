import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Dashboard from './screens/dashboard';
import AddProduct from './screens/products/addProduct';
import AllProducts from './screens/products/allProducts';
import EditProduct from './screens/products/editProduct';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />}></Route>

      {/* PRODUCTS */}
      <Route path='/add-product' element={<AddProduct />}></Route>
      <Route path='/all-products' element={<AllProducts />}></Route>
      <Route path='/all-products/:id' element={<EditProduct />}></Route>


      {/* AUTH PAGE */}
      <Route path='/login' element={<Login />}></Route>
    </Routes>
  );
}

export default App;
