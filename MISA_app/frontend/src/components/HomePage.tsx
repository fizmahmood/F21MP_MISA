import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { Button, Form } from "react-bootstrap";
//import FormFacts from "./FormFacts";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ uuid: string; idUser: number } | null>(
    null
  );

  useEffect(() => {
    const userUUID = localStorage.getItem("userUUID");
    if (!userUUID) {
      navigate("/welcome"); // Redirect to welcome page if no UUID
      return;
    }

    // Fetch user data
    axios
      .get(`http://localhost:5001/get_user/${userUUID}`)
      .then((response) => {
        if (response.data.success) {
          const userData = response.data.user_data;
          console.log("User data loaded:", userData);

          // ✅ Fix incorrect key name
          setUser({
            uuid: userData.uuid,
            idUser: userData.idUser || 0, // Ensure correct key is used
          });
          console.log(user);
        } else {
          console.warn("User not found");
          navigate("/welcome");
        }
      })
      .catch((error) => {
        console.error("Error retrieving user:", error);
        navigate("/welcome");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Navbar
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Pricing
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" aria-disabled="true">
                  Disabled
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="row">
        <div className="col-sm-6 mb-3 mb-sm-0">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Special title treatment</h5>
              <p className="card-text">
                With supporting text below as a natural lead-in to additional
                content.
              </p>
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            </div>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Special title treatment</h5>
              <p className="card-text">
                With supporting text below as a natural lead-in to additional
                content.
              </p>
              <a href="#" className="btn btn-primary">
                Go somewhere
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
