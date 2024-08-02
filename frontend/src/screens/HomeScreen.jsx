import { useMutation, useQueryClient, useQuery } from "react-query";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Row,
  Col,
  Modal,
  InputGroup,
} from "react-bootstrap";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";

const HomeScreen = () => {
  const [realTimeData, setRealTimeData] = useState([]);

  const apiUrl = `https://api.thingspeak.com/channels/2352500/feeds.json?api_key=CVTICTTRWFQTUZ28&results=2`;

  useEffect(() => {
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data2) => {
        console.log(data2);
        setRealTimeData(data2);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  const filteredFields = [];
  if (realTimeData && realTimeData.channel) {
    for (let key in realTimeData.channel) {
      if (key.startsWith("field")) {
        filteredFields.push(key);
      }
    }
  }

  const columns = filteredFields.map((field) => ({
    field,
    headerName: realTimeData.channel[field],
    width: 200,
  }));

  const tdata = [];
  if (realTimeData && realTimeData.feeds) {
    realTimeData.feeds.forEach((item, index) => {
      const keyValuePair = { id: index + 1 };
      for (let key in item) {
        if (key.startsWith("field")) {
          keyValuePair[key] = item[key];
        }
      }
      tdata.push(keyValuePair);
    });
    console.log(tdata);
  }

  const bookParking = () => {};
  return (
    <>
      <Navbar expand="sm" collapseOnSelect>
        <Container>
          <Navbar.Brand className="heading">Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </Container>
        <Container>
          <Navbar.Collapse id="basic-navbar-nav secondary-header">
            <Nav className="ms-auto">
              <Nav.Link>
                <Button
                  variant="contained"
                  size="small"
                  className="btn btn-small btn-primary"
                  onClick={bookParking}
                >
                  Book Parking
                </Button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <DataGrid
        rows={tdata}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </>
  );
};

export default HomeScreen;
