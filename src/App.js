import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/login';
import Home from './screens/home';
import Contact from './screens/contact';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />}></Route>
      <Route path='/contact' element={<Contact />}></Route>
      <Route path='/login' element={<Login />}></Route>
    </Routes>
  );
}

export default App;
