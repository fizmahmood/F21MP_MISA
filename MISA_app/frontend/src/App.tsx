// import Message from "./Message";
// import FormFacts from "./components/FormFacts";
//import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from "react";
import axios from "axios";
import InputGroup from "./components/InputGroup";



const App: React.FC = () => {
  const [formData, setFormData] = useState({
    //
    father: 0,
    mother: 0,
    sons: 0,
    daughters: 0,
    brothers: 0,
    sisters: 0,
    grandsons: 0,
    granddaughters: 0,
    grandfather: 0,
    grandmother: 0,
    husband: 0,
    wife: 0,
    net_worth: 0,
    will: 0,
  });

  const [result, setResult] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/run_inheritance", formData);
      setResult(response.data.result);
    } catch (error) {
      console.error("Error:", error);
      setResult("Error calculating inheritance.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Islamic Inheritance System</h2>
      <form onSubmit={handleSubmit}>
        <InputGroup label="Father Alive (1/0)" name="father" value={formData.father} onChange={handleChange} />
        <InputGroup label="Mother Alive (1/0)" name="mother" value={formData.mother} onChange={handleChange} />
        <InputGroup label="Number of Sons" name="sons" value={formData.sons} onChange={handleChange} />
        <InputGroup label="Number of Daughters" name="daughters" value={formData.daughters} onChange={handleChange} />
        <InputGroup label="Number of Brothers" name="brothers" value={formData.brothers} onChange={handleChange} />
        <InputGroup label="Number of Sisters" name="sisters" value={formData.sisters} onChange={handleChange} />
        <InputGroup label="Number of Grandsons" name="grandsons" value={formData.grandsons} onChange={handleChange} />
        <InputGroup label="Number of Granddaughters" name="granddaughters" value={formData.granddaughters} onChange={handleChange} /> 
        <InputGroup label="Number of Grandfathers" name="grandfather" value={formData.grandfather} onChange={handleChange} /> 
        <InputGroup label="Number of Grandmothers" name="grandmother" value={formData.grandmother} onChange={handleChange} />
        <InputGroup label="Number of Husbands" name="husband" value={formData.husband} onChange={handleChange} />
        <InputGroup label="Number of Wives" name="wife" value={formData.wife} onChange={handleChange} />
        <InputGroup label="Net Worth" name="net_worth" value={formData.net_worth} onChange={handleChange} />
        <InputGroup label="Will (Wasiya Amount)" name="will" value={formData.will} onChange={handleChange} />
        <button type="submit" className="btn btn-primary mt-3">Calculate</button>
      </form>
      
      {result && (
        <div className="mt-3">
          <h4>Results:</h4>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default App;