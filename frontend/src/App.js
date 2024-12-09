// Author: Anik Tahabilder
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Importing routing components from react-router-dom
import HomePage from './HomePage';  // Importing the HomePage component
import Login from './Login';  // Importing the Login component
import Register from './Register';  // Importing the Register component
import Quote from "./Quote";  // Importing the Quote component
import Profile from './Profile';  // Importing the Profile component
import Requote from './Requote';  // Importing the Requote component
import PrivateRoute from './PrivateRoute';  // Importing the PrivateRoute component for protected routes

function App() {
  return (
    <Router>
      {" "}
      {/* BrowserRouter provides the routing context to the application */}
      <Routes>
        {" "}
        {/* Defines the routing paths for the application */}
        {/* Public routes */}
        {/* Route for HomePage (accessible to everyone) */}
        <Route path="/" element={<HomePage />} />
        {/* Route for Login (accessible to everyone) */}
        <Route path="/login" element={<Login />} />
        {/* Route for Register (accessible to everyone) */}
        <Route path="/register" element={<Register />} />
        {/* Private routes */}
        {/* Dashboard route, protected by PrivateRoute (only accessible if authenticated) */}
        <Route path="/quote" element={<Quote />} />
        {/* Profile route, protected by PrivateRoute (only accessible if authenticated) */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/requote"
          element={
            <PrivateRoute>
              <Requote />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
