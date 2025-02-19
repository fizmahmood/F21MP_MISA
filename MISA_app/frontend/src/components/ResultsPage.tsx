import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
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

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result || "No results available.";

  // Convert result data to JSON if it's a string
  let parsedResult: any = {};
  if (typeof result === "string") {
    try {
      parsedResult = JSON.parse(result);
    } catch (error) {
      parsedResult = {};
    }
  } else {
    parsedResult = result;
  }

  // Prepare Bar Chart Data
  const chartData = {
    labels: Object.keys(parsedResult),
    datasets: [
      {
        label: "Inheritance Distribution Bar Chart",
        data: Object.values(parsedResult),
        backgroundColor: "rgba(64, 107, 107, 0.89)",
      },
    ],
  };

  // Prepare Pie Chart Data
  const pieChartData = {
    labels: Object.keys(parsedResult),
    datasets: [
      {
        label: "Inheritance Distribution Pie Chart",
        data: Object.values(parsedResult),
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
    <div className="container mt-4">
      <h2>Inheritance Results</h2>
      <pre>{JSON.stringify(parsedResult, null, 2)}</pre>

      {/* Display Bar Chart */}
      <div style={{ width: "500px", margin: "auto" }}>
        <h4>Bar Chart</h4>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>

      {/* Display Pie Chart */}
      <div style={{ width: "500px", margin: "auto" }}>
        <h4>Pie Chart</h4>
        <Pie data={pieChartData} options={{ responsive: true }} />
      </div>

      <button onClick={() => navigate("/")} className="btn btn-secondary mt-3">
        Back to Home
      </button>
    </div>
  );
};

export default ResultsPage;
// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Bar, Pie } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const ResultsPage: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const result = location.state?.result || "No results available.";

//   // Convert result data to JSON if it's a string
//   let parsedResult: any = {};
//   if (typeof result === "string") {
//     try {
//       parsedResult = JSON.parse(result);
//     } catch (error) {
//       parsedResult = {};
//     }
//   } else {
//     parsedResult = result;
//   }

//   // Prepare chart data
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
//       <pre>{JSON.stringify(parsedResult, null, 2)}</pre>

//       {/* Display Chart */}
//       <div style={{ width: "500px", margin: "auto" }}>
//         <h4>Bar Chart</h4>
//         <Bar data={chartData} options={{ responsive: true }} />
//       </div>

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
