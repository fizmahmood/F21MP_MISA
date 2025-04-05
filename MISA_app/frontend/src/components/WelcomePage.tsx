import React,{useEffect} from "react";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import FormFacts from "./FormFacts";
import UserDataLoader from "./UserDataLoader";
import { useNavigate } from "react-router-dom";

// import backgroundImage from "../assets/images/dark_gradient_bg.jpg";

const WelcomePage: React.FC = () => {
  
  const navigate = useNavigate();
  useEffect(() => {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {navigate("/home")}})
  return (
    <div className="dark-mode">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} className="w-100">
            <Card className="shadow-lg p-4">
              {/* ✅ User Data Loader */}
              <UserDataLoader />

              {/* ✅ Bootstrap Carousel */}
              <Carousel>
                {/* Slide 1 - App Name */}
                <Carousel.Item>
                  <div className="text-center p-5 bg-dark text-white">
                    <h2 className="fw-bold">Welcome to MISA</h2>
                    <p>Multi-Cultural Inheritance Sharing Application</p>
                  </div>
                </Carousel.Item>

                <Carousel.Item>
                  <div className="text-center p-5 bg-secondary text-white">
                    <h2>About the system</h2>
                    <p>
                      Our system simplifies and automates the inheritance
                      distribution process based on a range of cultural,
                      religious, and legal traditions. Whether you are looking to
                      understand your own background or explore how others
                      approach inheritance, we provide clear, personalized
                      guidance and insights to help you learn and plan with
                      confidence.
                    </p>
                  </div>
                </Carousel.Item>

                {/* Slide 2 - How It Works */}
                <Carousel.Item>
                  <div className="text-center p-5 bg-secondary text-white">
                    <h2>How it Works</h2>
                    <p>
                      Provide your details, and the system will calculate
                      inheritance based on selected laws.
                    </p>
                  </div>
                </Carousel.Item>

                {/* Slide 3 - Form Entry */}
                <Carousel.Item>
                  <div className="text-center p-5 bg-secondary text-white">
                    <h2>How it Works</h2>
                    <p>
                      Navigate to Details to make changes to your information.
                      <br />
                      Navigate to Results to see your previous calculations.
                    </p>
                  </div>
                </Carousel.Item>
              </Carousel>
            </Card>
          </Col>
        </Row>
        <Row className="justify-content-center w-100">
          <Col md={10} className="w-100">
            <div className="text-center p-4">
              <h3>Enter Your Details</h3>
              <p>Fill in the form below to generate an inheritance report.</p>
              <FormFacts />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WelcomePage;
