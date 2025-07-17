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
import AddOffer from './screens/offers/addOffers';
import AllOffer from './screens/offers/allOffer';
import EditOffers from './screens/offers/editOffers';
import Coupons from './screens/marketing/coupons';
import PrivateRoute from './auth/ProtectedRoute';
import Signup from './auth/signup';
import Giftcard from './screens/giftcard/giftcard';
// import AllGiftCards from './screens/giftcard/allGiftcard';

function App() {
  return (
    <Routes>
      {/* AUTH */}
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/login-phone' element={<PhoneLogin />} />

      {/* PROTECTED ROUTES */}
      <Route path='/' element={<PrivateRoute>   <Dashboard /> </PrivateRoute>}
      />
      <Route path='/add-product' element={<PrivateRoute>   <AddProduct /> </PrivateRoute>}
      />
      <Route path='/all-products' element={<PrivateRoute>   <AllProducts /> </PrivateRoute>}
      />
      <Route path='/all-products/:id' element={<PrivateRoute>   <EditProduct /> </PrivateRoute>}
      />
      <Route path='/all-users' element={<PrivateRoute>   <AllUsers /> </PrivateRoute>
      }
      />
      <Route path='/add-user' element={<PrivateRoute>   <AddUser /> </PrivateRoute>}
      />
      <Route path='/add-category' element={<PrivateRoute>   <AddCategory /> </PrivateRoute>}
      />
      <Route path='/combo' element={<PrivateRoute>   <AddCombo /> </PrivateRoute>}
      />
      <Route path='/add-combo' element={<PrivateRoute>   <AddCombo /> </PrivateRoute>}
      />
      <Route path='/make-combo' element={<PrivateRoute>   <MakeCombo /> </PrivateRoute>}
      />
      <Route path='/offers/add' element={<PrivateRoute>   <AddOffer /> </PrivateRoute>}
      />
      <Route path='/offers/all' element={<PrivateRoute>   <AllOffer /> </PrivateRoute>}
      />
      <Route path='/offers/all/edit/:id' element={<PrivateRoute>   <EditOffers /> </PrivateRoute>}
      />
      <Route path='/marketing/coupons' element={<PrivateRoute>   <Coupons /> </PrivateRoute>}
      />
      <Route path='/giftcard/' element={<PrivateRoute>   <Giftcard /> </PrivateRoute>} />
      {/* <Route path='/giftcards/all' element={<PrivateRoute>   <AllGiftCards /> </PrivateRoute>}
      /> */}
    </Routes>
  );
}

export default App;
