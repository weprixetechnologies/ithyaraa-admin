import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Dashboard from './screens/dashboard';
import AddProduct from './screens/products/addProduct';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />}></Route>

      {/* PRODUCTS */}
      <Route path='/add-product' element={<AddProduct />}></Route>


      {/* AUTH PAGE */}
      <Route path='/login' element={<Login />}></Route>
    </Routes>
  );
}

export default App;
