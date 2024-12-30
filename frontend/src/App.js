import { BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import Login from './Login/Login';
import Register from './Register/Register';
import Booking from './Booking/Booking';
import ProtectedRoute from './ProtectedRoute';


function App() {
  return (
    <div>
      <Router>
      <Routes>
          <Route exact path="/" element={<Login/>}/>
          <Route exact path="/login" element={<Login/>}/>
          <Route exact path="/register" element={<Register/>}/>
          <Route exact path="/booking" element={<ProtectedRoute element={<Booking/>}/>}/>
     </Routes>
     </Router>
    </div>
  );
}

export default App;