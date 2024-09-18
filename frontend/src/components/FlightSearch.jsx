// src/components/FlightSearch.js

import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Table, Spinner, Alert, Row, Col } from "react-bootstrap";

const FlightSearch = () => {
  const [departureDate, setDepartureDate] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [numAdult, setNumAdult] = useState(1);
  const [numChild, setNumChild] = useState(0);
  const [numInfant, setNumInfant] = useState(0);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:3000/api/flights", {
        params: {
          departureDate,
          origin,
          destination,
          numAdult: parseInt(numAdult, 10),
          numChild: parseInt(numChild, 10),
          numInfant: parseInt(numInfant, 10),
        },
      });
      setFlights(response.data);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to fetch flights: " +
          (err.response ? err.response.data : err.message)
      );
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <Row className="g-8">
        <h2>Competitors Flight Search</h2>
        {/* Column for the form */}
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <Form.Group controlId="departureDate">
              <Form.Label>Departure Date</Form.Label>
              <Form.Control
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="origin">
              <Form.Label>Origin</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter origin airport code"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="destination">
              <Form.Label>Destination</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter destination airport code"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="numAdult">
              <Form.Label>Number of Adults</Form.Label>
              <Form.Control
                type="number"
                value={numAdult}
                onChange={(e) => setNumAdult(e.target.value)}
                min="1"
                required
              />
            </Form.Group>
            <Form.Group controlId="numChild">
              <Form.Label>Number of Children</Form.Label>
              <Form.Control
                type="number"
                value={numChild}
                onChange={(e) => setNumChild(e.target.value)}
                min="0"
              />
            </Form.Group>
            <Form.Group controlId="numInfant">
              <Form.Label>Number of Infants</Form.Label>
              <Form.Control
                type="number"
                value={numInfant}
                onChange={(e) => setNumInfant(e.target.value)}
                min="0"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Search
            </Button>
          </Form>
        </Col>

        {/* Column for the results (loading, error, table) */}
        <Col md={6}>
          {loading && (
            <Spinner animation="border" variant="primary" className="mt-3" />
          )}
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          {flights.length > 0 && (
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>Airline</th>
                  <th>Flight Number</th>
                  <th>Departure Time</th>
                  <th>Arrival Time</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {flights.map((flight, index) => (
                  <tr key={index}>
                    <td>{flight.airline}</td>
                    <td>{flight.flightNumber}</td>
                    <td>{flight.departureTime}</td>
                    <td>{flight.arrivalTime}</td>
                    <td>{flight.price}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default FlightSearch;
