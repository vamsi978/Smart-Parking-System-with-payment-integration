import "./table.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";

const List = () => {
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

  const rows = [
    {
      id: 1143155,
      product: "Acer Nitro 5",
      img: "https://m.media-amazon.com/images/I/81bc8mA3nKL._AC_UY327_FMwebp_QL65_.jpg",
      customer: "John Smith",
      date: "1 March",
      amount: 785,
      method: "Cash on Delivery",
      status: "Approved",
    },
  ];
  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell"> ID</TableCell>
            <TableCell className="tableCell">Parking Spot 1A</TableCell>
            <TableCell className="tableCell">Parking Spot 1B</TableCell>
            <TableCell className="tableCell">Parking Spot 1C</TableCell>
            <TableCell className="tableCell">Amount</TableCell>
            <TableCell className="tableCell">Payment Method</TableCell>
            <TableCell className="tableCell">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="tableCell">{row.id}</TableCell>
              <TableCell className="tableCell">
                <div className="cellWrapper">
                  <img src={row.img} alt="" className="image" />
                  {row.product}
                </div>
              </TableCell>
              <TableCell className="tableCell">{row.customer}</TableCell>
              <TableCell className="tableCell">{row.date}</TableCell>
              <TableCell className="tableCell">{row.amount}</TableCell>
              <TableCell className="tableCell">{row.method}</TableCell>
              <TableCell className="tableCell">
                <span className={`status ${row.status}`}>{row.status}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default List;
