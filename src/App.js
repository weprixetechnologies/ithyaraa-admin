import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './auth/login';

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />}></Route>
    </Routes>
  );
}

export default App;
