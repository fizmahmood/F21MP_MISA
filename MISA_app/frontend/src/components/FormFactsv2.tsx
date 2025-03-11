import React, { useState, useEffect } from "react";
import {
  Form,
  Container,
  Row,
  Col,
  Button,
  Card,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import axios from "axios";
import useUserInfo from "../hooks/useUserInfo";
import { useNavigate } from "react-router-dom";

interface FormData {
  gender: string;
  married: string;
  father: number;
  mother: number;
  sons: number;
  daughters: number;
  brothers: number;
  sisters: number;
  will_amount: number;
  networth: number;
  husband: number;
  wife: number;
  paternal_grandfather: number;
  paternal_grandmother: number;
  maternal_grandfather: number;
  maternal_grandmother: number;
  grandparents: string;
  Users_user_id: number;
  grandsons: number;
  granddaughters: number;
  children: string;
}

export default function InheritanceForm() {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    married: "",
    children: "",
    father: 0,
    mother: 0,
    sons: 0,
    daughters: 0,
    brothers: 0,
    sisters: 0,
    will_amount: 0,
    networth: 0,
    husband: 0,
    wife: 0,
    paternal_grandfather: 0,
    paternal_grandmother: 0,
    maternal_grandfather: 0,
    maternal_grandmother: 0,
    grandparents: "",
    Users_user_id: 0,
    grandsons: 0,
    granddaughters: 0,
  });

  const navigate = useNavigate();
  const userInfo = useUserInfo();

  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        Users_user_id: userInfo.user_id,
      }));
    }
  }, [userInfo]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      wife: prev.gender === "Male" && prev.married === "Yes" ? 1 : 0,
      husband: prev.gender === "Female" && prev.married === "Yes" ? 1 : 0,
    }));
  }, [formData.gender, formData.married]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const numericValue = value === "" ? 0 : Number(value);
    let updatedValue = type === "checkbox" ? (checked ? 1 : 0) : numericValue;

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("✅ Submitting Data:", formData);
  };

  const renderTooltip = (message: string) => <Tooltip id="tooltip">{message}</Tooltip>;

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">Inheritance Information Form</h2>

            <Form onSubmit={handleSubmit}>
              {/* ✅ Section: Personal Information */}
              <Card className="mb-3">
                <Card.Body>
                  <h5>Personal Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Gender:</Form.Label>
                        <Form.Check inline type="radio" label="Male" name="gender" value="Male" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="Female" name="gender" value="Female" onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Married?</Form.Label>
                        <Form.Check inline type="radio" label="Yes" name="married" value="Yes" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="No" name="married" value="No" onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ✅ Section: Family Details */}
              <Card className="mb-3">
                <Card.Body>
                  <h5>Family Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Father Alive?</Form.Label>
                        <Form.Check inline type="radio" label="Yes" name="father" value="1" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="No" name="father" value="0" onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Mother Alive?</Form.Label>
                        <Form.Check inline type="radio" label="Yes" name="mother" value="1" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="No" name="mother" value="0" onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ✅ Section: Financial Information */}
              <Card>
                <Card.Body>
                  <h5>Financial Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Net Worth ($):</Form.Label>
                        <Form.Control type="number" name="networth" min="0" max="999999999999" value={formData.networth} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Will Amount ($):</Form.Label>
                        <Form.Control type="number" name="will_amount" min="0" max="999999999999" value={formData.will_amount} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* ✅ Submit Button */}
              <Button type="submit" className="btn btn-primary w-100 mt-3">
                Save & Proceed
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}