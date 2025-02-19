import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

// Define the type for form data
interface FormData {
  gender: string;
  married: string;
  father: number;
  mother: number;
  sons: number;
  daughters: number;
  brothers: number;
  sisters: number;
}

export default function InheritanceForm() {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    married: "",
    father: 0,
    mother: 0,
    sons: 0,
    daughters: 0,
    brothers: 0,
    sisters: 0,
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Define fields that should be numbers
    const numericFields = [
      "father",
      "mother",
      "sons",
      "daughters",
      "brothers",
      "sisters",
    ];

    setFormData((prevData) => ({
      ...prevData,
      [name]: numericFields.includes(name) ? Number(value) : value, // Convert only numeric fields
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  return (
    <div className="container mt-4">
      <h2>Inheritance Information Form</h2>
      <Form onSubmit={handleSubmit}>
        {/* Gender */}
        <Form.Group>
          <Form.Label>Gender:</Form.Label>
          <Form.Check
            type="radio"
            label="Male"
            name="gender"
            value="Male"
            onChange={handleChange}
            required
          />
          <Form.Check
            type="radio"
            label="Female"
            name="gender"
            value="Female"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Is Father Alive */}
        <Form.Group>
          <Form.Label>Is Father Alive?</Form.Label>
          <Form.Check
            type="radio"
            label="Yes"
            name="father"
            value="1"
            onChange={handleChange}
            required
          />
          <Form.Check
            type="radio"
            label="No"
            name="father"
            value="0"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Is Mother Alive */}
        <Form.Group>
          <Form.Label>Is Mother Alive?</Form.Label>
          <Form.Check
            type="radio"
            label="Yes"
            name="mother"
            value="1"
            onChange={handleChange}
            required
          />
          <Form.Check
            type="radio"
            label="No"
            name="mother"
            value="0"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Are You Married */}
        <Form.Group>
          <Form.Label>Are you Married?</Form.Label>
          <Form.Check
            type="radio"
            label="Yes"
            name="married"
            value="Yes"
            onChange={handleChange}
            required
          />
          <Form.Check
            type="radio"
            label="No"
            name="married"
            value="No"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Number Inputs */}
        {/* Conditionally Render Sons and Daughters if Married is "Yes" */}
        {formData.married === "Yes" && (
          <>
            <Form.Group>
              <Form.Label>Number of Sons:</Form.Label>
              <Form.Control
                type="number"
                name="sons"
                min="0"
                value={formData.sons}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Number of Daughters:</Form.Label>
              <Form.Control
                type="number"
                name="daughters"
                min="0"
                value={formData.daughters}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </>
        )}

        <Form.Group>
          <Form.Label>Number of Brothers:</Form.Label>
          <Form.Control
            type="number"
            name="brothers"
            min="0"
            value={formData.brothers}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Number of Sisters:</Form.Label>
          <Form.Control
            type="number"
            name="sisters"
            min="0"
            value={formData.sisters}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Submit Button */}
        <Button type="submit" className="mt-3">
          Submit
        </Button>
      </Form>
    </div>
  );
}
