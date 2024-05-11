import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import User from "./components/User";
import NotFound from "./components/NotFound";
import Petitions from "./components/Petitions";
import Petition from "./components/Petition";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/users/:id" element={<User/>}/>
                <Route path="/petitions" element={<Petitions/>}/>
                <Route path="/petitions/:id" element={<Petition/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
