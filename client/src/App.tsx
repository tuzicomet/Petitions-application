import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./components/Login";
import User from "./components/User";
import NotFound from "./components/NotFound";

function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/users/:id" element={<User/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
