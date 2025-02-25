import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import HomePage from "./components/HomePage";
import ResultsPage from "./components/ResultsPage";
import EditableForm from "./components/EditableForm";
import InheritanceResults from "./components/InheritanceResults";

const App: React.FC = () => {
  const userUUID = localStorage.getItem("userUUID");
  console.log("User UUID:", userUUID);

  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/result" element={<ResultsPage />} />
        <Route path="/form" element={<EditableForm />} />
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
  );
};

export default App;
