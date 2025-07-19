import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Dashboard from './screens/dashboard';
import PhoneLogin from './auth/loginphone';
import PrivateRoute from './auth/ProtectedRoute';
import Signup from './auth/signup';

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

    </Routes>
  );
}

export default App;
