// import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
// import Tree from "react-d3-tree";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Container, Card, Table, Button, Row, Col, Alert } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // ✅ Required for Pie Charts
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ Register all necessary Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // ✅ Register ArcElement for Pie Chart
  Title,
  Tooltip,
  Legend
);

interface Heir {
  heir: string;
  count: number;
  amount: number;
  percentage: number;
  explanation: string;
}
interface Facts {
  father: number;
  mother: number;
  brothers: number;
  sisters: number;
  husband: number;
  wife: number;
  sons: number;
  daughters: number;
  grandsons: number;
  granddaughters: number;
  paternal_grandfather: number;
  paternal_grandmother: number;
  maternal_grandfather: number;
  maternal_grandmother: number;
  will_amount: number;
  networth: number;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // const parsedResult = location.state?.result || {};
  console.log("Location state:", location.state);
  const systemName = location.state?.system_name ;
  const detailedResult = location.state?.details || {
    heirs: [],
    blocked_heirs: {},
  };
  const context_info = location.state?.context_info;
  console.log("Context: ", context_info);
  const [facts, setFacts] = useState<Facts | null>(null);



  // Fetch facts based on Facts_id
  useEffect(() => {
    // const factsId = location.state?.facts_id;
    const userInfo = localStorage.getItem("userInfo");
    const userin = JSON.parse(userInfo || "{}");
    const user_id = userin.user_id;
    if (!user_id) return;

    api
      .get(`/get_facts/${user_id}`)
      .then((response) => {
        if (response.data.success) {
          setFacts(response.data.user_facts);
        } else {
          console.error("No facts found.");
        }
      })
      .catch((error) => console.error("Error fetching facts:", error));
  }, [location.state?.facts_id]);


  // const [expandedIndex] = useState<number | null>(null);

  // Prepare Bar Chart Data
  const chartData = {
    labels: detailedResult.heirs.map((heir: Heir) => heir.heir),
    datasets: [
      {
        label: "Inheritance Distribution",
        data: detailedResult.heirs.map((heir: Heir) => heir.amount),
        backgroundColor: "rgba(64, 107, 107, 0.89)",
      },
    ],
  };

  // Prepare Pie Chart Data
  const pieChartData = {
    labels: detailedResult.heirs.map((heir: Heir) => heir.heir),
    datasets: [
      {
        label: "Inheritance Distribution",
        data: detailedResult.heirs.map((heir: Heir) => heir.amount),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9966FF",
          "#FF9F40",
          "#FFCD56",
          "#C9CBCF",
          "#36A2EB",
          "#FF6384",
        ],
        hoverOffset: 10,
      },
    ],
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">{systemName}</h2>

      <Card className="shadow-lg mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          About the System
        </Card.Header>
        <Card.Body>
          <p>{context_info}</p>
        </Card.Body>
      </Card>

      {/* ✅ Eligible Heirs */}
      <Card className="shadow-lg mb-4">
        <Card.Header as="h4" className="text-center bg-primary text-white">
          Eligible Heirs
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive className="table-dark">
            <thead>
              <tr>
                <th>Heir</th>
                <th>Count</th>
                <th>Amount</th>
                <th>Percentage</th>
                <th>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {detailedResult.heirs.map((heir: Heir, idx: number) => (
                <tr key={idx}>
                  <td>{heir.heir}</td>
                  <td>{heir.count}</td>
                  <td>${heir.amount.toFixed(2)}</td>
                  <td>{heir.percentage.toFixed(2)}%</td>
                  <td>{heir.explanation}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* ✅ Blocked Heirs */}
      {Object.keys(detailedResult.blocked_heirs).length > 0 && (
        <Card className="shadow-lg mb-4">
          <Card.Header as="h4" className="text-center bg-danger text-white">
            Blocked Heirs
          </Card.Header>
          <Card.Body>
            <ul className="list-group">
              {Object.entries(detailedResult.blocked_heirs).map(
                ([heir, reason], idx) => (
                  <li key={idx} className="list-group-item">
                    <strong>{heir.replace("_", " ")}:</strong> {reason as string}
                  </li>
                )
              )}
            </ul>
          </Card.Body>
        </Card>
      )}

      {/* ✅ Will Amount */}
      {detailedResult.will > 0 && (
        <Alert variant="info" className="text-center">
          <h4>Will Amount</h4>
          <p>
            <strong>Amount:</strong> ${detailedResult.will.toFixed(2)} (
            {((detailedResult.will / detailedResult.original_net_worth) * 100).toFixed(2)}%)
          </p>
          <p>
            Maximum allowed: ${(detailedResult.original_net_worth / 3).toFixed(2)}
          </p>
        </Alert>
      )}

      {/* ✅ Facts Table */}
      {facts && (
        <Card className="shadow-lg mb-4">
          <Card.Header as="h4" className="text-center bg-secondary text-white">
            User Facts
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(facts).map(([key, value], index) => (
                  <tr key={index}>
                    <td>{key.replace(/_/g, " ")}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* ✅ Charts Section */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-lg">
            <Card.Header as="h4" className="text-center bg-info text-white">
              Bar Chart
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
                <Bar data={chartData} options={{ responsive: true }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-lg">
            <Card.Header as="h4" className="text-center bg-warning text-white">
              Pie Chart
            </Card.Header>
            <Card.Body>
              <div style={{ height: "300px" }}>
<<<<<<< Updated upstream
                <Pie data={chartData} options={{ responsive: true }} />
=======
                <Pie data={pieChartData} options={{ responsive: true }} />
>>>>>>> Stashed changes
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ✅ Back to Home Button */}
      <div className="text-center mt-4">
        <Button onClick={() => navigate("/")} variant="secondary">
          Back to Home
        </Button>
      </div>
    </Container>
  );
};

export default ResultsPage;


// import { useLocation, useNavigate } from "react-router-dom";
// import { Bar, Pie } from "react-chartjs-2";
// // import Tree from "react-d3-tree";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement, // ✅ Required for Pie Charts
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // ✅ Register all necessary Chart.js elements
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement, // ✅ Register ArcElement for Pie Chart
//   Title,
//   Tooltip,
//   Legend
// );

// interface Heir {
//   heir: string;
//   count: number;
//   amount: number;
//   percentage: number;
//   explanation: string;
// }

// const ResultsPage: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const parsedResult = location.state?.result || {};
//   const detailedResult = location.state?.results_for_db || {}; // ✅ Extract detailed inheritance sharing rules

//   // const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

//   // Convert result data to JSON if it's a string
//   // let parsedResult: any = {};

//   // Prepare Bar Chart Data
//   const chartData = {
//     labels: Object.keys(parsedResult),
//     datasets: [
//       {
//         label: "Inheritance Distribution Bar Chart",
//         data: Object.values(parsedResult),
//         backgroundColor: "rgba(64, 107, 107, 0.89)",
//       },
//     ],
//   };

//   // Prepare Pie Chart Data
//   const pieChartData = {
//     labels: Object.keys(parsedResult),
//     datasets: [
//       {
//         label: "Inheritance Distribution Pie Chart",
//         data: Object.values(parsedResult),
//         backgroundColor: [
//           "#FF6384",
//           "#36A2EB",
//           "#FFCE56",
//           "#4CAF50",
//           "#9966FF",
//           "#FF9F40",
//           "#FFCD56",
//           "#C9CBCF",
//           "#36A2EB",
//           "#FF6384",
//         ],
//         hoverOffset: 10,
//       },
//     ],
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Inheritance Results</h2>
//       {/* ✅ Display Eligible Heirs Table */}
//       <h4>Eligible Heirs</h4>
//       <table className="table table-bordered">
//         <thead>
//           <tr>
//             <th>Heir</th>
//             <th>Count</th>
//             <th>Amount</th>
//             <th>Percentage</th>
//             <th>Explanation</th>
//           </tr>
//         </thead>
//         <tbody>
//           {detailedResult.heirs.map((heir: Heir, idx: number) => (
//             <tr key={idx}>
//               <td>{heir.heir}</td>
//               <td>{heir.count}</td>
//               <td>${heir.amount.toFixed(2)}</td>
//               <td>{heir.percentage.toFixed(2)}%</td>
//               <td>{heir.explanation}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* ✅ Display Blocked Heirs if any exist */}
//       {Object.keys(detailedResult.blocked_heirs).length > 0 && (
//         <div className="blocked-heirs">
//           <h4>Blocked Heirs</h4>
//           <ul>
//             {Object.entries(detailedResult.blocked_heirs).map(([heir, reason], idx) => (
//               <li key={idx}>
//                 <strong>{heir.replace("_", " ")}:</strong> {reason}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Display Bar Chart */}
//       <div style={{ width: "500px", margin: "auto" }}>
//         <h4>Bar Chart</h4>
//         <Bar data={chartData} options={{ responsive: true }} />
//       </div>

//       {/* Display Pie Chart */}
//       <div style={{ width: "500px", margin: "auto" }}>
//         <h4>Pie Chart</h4>
//         <Pie data={pieChartData} options={{ responsive: true }} />
//       </div>

//       <button onClick={() => navigate("/")} className="btn btn-secondary mt-3">
//         Back to Home
//       </button>
//     </div>
//   );
// };

// export default ResultsPage;
// // import React from "react";
// // import { useLocation, useNavigate } from "react-router-dom";
// // import { Bar, Pie } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   Title,
// //   Tooltip,
// //   Legend
// // );

// // const ResultsPage: React.FC = () => {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const result = location.state?.result || "No results available.";

// //   // Convert result data to JSON if it's a string
// //   let parsedResult: any = {};
// //   if (typeof result === "string") {
// //     try {
// //       parsedResult = JSON.parse(result);
// //     } catch (error) {
// //       parsedResult = {};
// //     }
// //   } else {
// //     parsedResult = result;
// //   }

// //   // Prepare chart data
// //   const chartData = {
// //     labels: Object.keys(parsedResult),
// //     datasets: [
// //       {
// //         label: "Inheritance Distribution Bar Chart",
// //         data: Object.values(parsedResult),
// //         backgroundColor: "rgba(64, 107, 107, 0.89)",
// //       },
// //     ],
// //   };

// //   const pieChartData = {
// //     labels: Object.keys(parsedResult),
// //     datasets: [
// //       {
// //         label: "Inheritance Distribution Pie Chart",
// //         data: Object.values(parsedResult),
// //         backgroundColor: [
// //           "#FF6384",
// //           "#36A2EB",
// //           "#FFCE56",
// //           "#4CAF50",
// //           "#9966FF",
// //           "#FF9F40",
// //           "#FFCD56",
// //           "#C9CBCF",
// //           "#36A2EB",
// //           "#FF6384",
// //         ],
// //         hoverOffset: 10,
// //       },
// //     ],
// //   };

// //   return (
// //     <div className="container mt-4">
// //       <h2>Inheritance Results</h2>
// //       <pre>{JSON.stringify(parsedResult, null, 2)}</pre>

// //       {/* Display Chart */}
// //       <div style={{ width: "500px", margin: "auto" }}>
// //         <h4>Bar Chart</h4>
// //         <Bar data={chartData} options={{ responsive: true }} />
// //       </div>

// //       <div style={{ width: "500px", margin: "auto" }}>
// //         <h4>Pie Chart</h4>
// //         <Pie data={pieChartData} options={{ responsive: true }} />
// //       </div>
// //       <button onClick={() => navigate("/")} className="btn btn-secondary mt-3">
// //         Back to Home
// //       </button>
// //     </div>
// //   );
// // };

// // export default ResultsPage;
