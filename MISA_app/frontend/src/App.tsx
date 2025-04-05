import React, {useEffect, useState} from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import HomePage from "./components/HomePagev2";
import ResultsPage from "./components/ResultsPage";
import EditableForm from "./components/EditableForm";
import InheritanceResults from "./components/InheritanceResults";
import Navigation from "./components/NavBar";
import ScrollToTop from "./components/ScrollToTop";
// import FactsLoader from "./components/FactsLoader";
import "./App.css";

const App: React.FC = () => {
  const userUUID = localStorage.getItem("userUUID");
  console.log("User UUID:", userUUID);

  const [darkMode, setDarkMode] = useState(true); // ✅ Default to dark mode

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      setDarkMode(true); // ✅ Set dark mode as default
    }
  }, []);



  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
    <Router>
      <ScrollToTop />
      {/* Navigation Bar Component */}
      <Navigation /> 
      
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/result" element={<ResultsPage />} />
        <Route path="/info" element={<EditableForm />} />
        <Route path="/results" element={<InheritanceResults/>}/>
        

        <Route
          path="/"
          element={
            userUUID ? <Navigate to="/home" /> : <Navigate to="/welcome" />
          }
        />
        <Route path="*" element={<Navigate to={userUUID ? "/home" : "/welcome"} />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;
