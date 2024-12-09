// Author: Anik Tahabilder
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Importing routing components from react-router-dom
import HomePage from './HomePage';  // Importing the HomePage component
import Login from './Login';  // Importing the Login component
import Register from './Register';  // Importing the Register component
import Quote from "./Quote";  // Importing the Quote component
import Profile from './Profile';  // Importing the Profile component
import Requote from './Requote';  // Importing the Requote component
import Bills from './Bills';  // Importing the Requote component
import PrivateRoute from './PrivateRoute';  // Importing the PrivateRoute component for protected routes

function App() {
  return (
    <Router>
      {" "}
      {/* BrowserRouter provides the routing context to the application */}
      <Routes>
        {" "}
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route
          path="/quote"
          element={
            <PrivateRoute>
              <Quote />
            </PrivateRoute>
          }
        />
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
        <Route
          path="/bills"
          element={
            <PrivateRoute>
              <Bills />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
