import React from "react";
import FormFacts from "./FormFacts";
import UserDataLoader from "./UserDataLoader";
import { Container, Card } from "react-bootstrap";

const WelcomePage: React.FC = () => {
  return (
    <div className="welcome-container d-flex align-items-center justify-content-center vh-100">
      <UserDataLoader />
      <Container className="d-flex justify-content-center">
        <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75%" }}>
          {/* Bootstrap Carousel */}
          <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
            {/* Indicators */}
            <div className="carousel-indicators">
              <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
              <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
              <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
            </div>

            {/* Carousel Items */}
            <div className="carousel-inner">
              {/* Slide 1 - App Name */}
              <div className="carousel-item active">
                <div className="text-center p-5">
                  <h1 className="display-4 fw-bold">MISA</h1>
                  <p className="lead text-muted">
                    Multi-Cultural Inheritance Sharing Application
                  </p>
                </div>
              </div>

              {/* Slide 2 - Welcome Message */}
              <div className="carousel-item">
                <div className="text-center p-5">
                  <h2>Welcome to MISA</h2>
                  <p>
                    Explore inheritance laws and customs across different cultures, religions, and legal frameworks.
                    <br />
                    Start by entering details about your family members to receive accurate inheritance distributions.
                  </p>
                </div>
              </div>

              {/* Slide 3 - FormFacts */}
              <div className="carousel-item">
                <div className="text-center p-4">
                  <h3>Enter Your Details</h3>
                  <p>Fill in the form below to generate an inheritance report.</p>
                  <FormFacts />
                </div>
              </div>
            </div>

            {/* Side Navigation Arrows */}
            <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default WelcomePage;

// import React from "react";
// // import { useNavigate } from "react-router-dom";
// import FormFacts from "./FormFacts";
// import UserDataLoader from "./UserDataLoader";
// import { Card, Container } from "react-bootstrap";

// const WelcomePage: React.FC = () => {
//   // const navigate = useNavigate();


//   // const handleContinue = () => {
//   //   navigate("/home"); // Redirect to the main application
//   // };

//   return (
//     <div className="welcome-container d-flex align-items-center justify-content-center vh-100">
//       <UserDataLoader />
//       <Container className="d-flex justify-content-center">
//         <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75%" }}>
//           {/* Bootstrap Carousel */}
//           <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel">
//             {/* Indicators at the bottom */}
//             <div className="carousel-indicators">
//               <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
//               <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
//               <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
//             </div>

//             {/* Carousel Items */}
//             <div className="carousel-inner">
//               {/* Slide 1 - App Name */}
//               <div className="carousel-item active">
//                 <div className="text-center p-5">
//                   <h1 className="display-4 fw-bold">MISA</h1>
//                   <p className="lead text-muted">
//                     Multi-Cultural Inheritance Sharing Application
//                   </p>
//                 </div>
//               </div>

//               {/* Slide 2 - Welcome Message */}
//               <div className="carousel-item">
//                 <div className="text-center p-5">
//                   <h2>Welcome to MISA</h2>
//                   <p>
//                     Explore inheritance laws and customs across different cultures, religions, and legal frameworks.
//                     <br />
//                     Start by entering details about your family members to receive accurate inheritance distributions.
//                   </p>
//                 </div>
//               </div>

//               {/* Slide 3 - FormFacts */}
//               <div className="carousel-item">
//                 <div className="text-center p-4">
//                   <h3>Enter Your Details</h3>
//                   <p>Fill in the form below to generate an inheritance report.</p>
//                   <FormFacts />
//                 </div>
//               </div>
//             </div>

//             {/* Side Navigation Arrows */}
//             <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
//               <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//               <span className="visually-hidden">Previous</span>
//             </button>
//             <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
//               <span className="carousel-control-next-icon" aria-hidden="true"></span>
//               <span className="visually-hidden">Next</span>
//             </button>
//           </div>
//         </Card>
//       </Container>
//     </div>
//     // <div className="welcome-container d-flex align-items-center justify-content-center vh-100">
//     //   <UserDataLoader />
//     //   <Container className="d-flex justify-content-center">
//     //     <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75%" }}>
//     //       <Carousel indicators={true} interval={5000} className="p-3">
//     //         {/* Slide 1 - Application Name */}
//     //         <Carousel.Item>
//     //           <div className="text-center">
//     //             <h1 className="display-4 fw-bold">MISA</h1>
//     //             <p className="lead text-muted">
//     //               Multi-Cultural Inheritance Sharing Application
//     //             </p>
//     //           </div>
//     //         </Carousel.Item>

//     //         {/* Slide 2 - Welcome Message */}
//     //         <Carousel.Item>
//     //           <div className="text-center">
//     //             <h2>Welcome to MISA</h2>
//     //             <p>
//     //               Explore inheritance laws and customs across different cultures, religions, and legal frameworks.
//     //               <br />
//     //               Start by entering details about your family members to receive accurate inheritance distributions.
//     //             </p>
//     //           </div>
//     //         </Carousel.Item>

//     //         {/* Slide 3 - FormFacts */}
//     //         <Carousel.Item>
//     //           <div className="text-center">
//     //             <h3>Enter Your Details</h3>
//     //             <p>Fill in the form below to generate an inheritance report.</p>
//     //             <FormFacts />
//     //           </div>
//     //         </Carousel.Item>
//     //       </Carousel>
//     //     </Card>
//     //   </Container>
//     // </div>
//   );
// };

// export default WelcomePage;