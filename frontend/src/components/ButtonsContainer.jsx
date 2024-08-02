import React, { useState, useEffect } from "react";
import {Container, Row, Col} from 'react-bootstrap'

const ButtonsContainer = ({showPreview, showQRHandler, editExhibits, deleteExhibits}) => {
  return (
    <Container className="btn-menu d-flex justify-content-end">
            
    <Row>
      <Col xs={2} md={3}>
        <button onClick={showPreview}>Preview</button>
      </Col>
      <Col xs={2} md={3}>
        <button onClick={showQRHandler}>Show QR</button>
      </Col>
      <Col xs={2} md={3}>
        <button onClick={editExhibits }>Edit</button>
      </Col>
      <Col xs={2} md={3}>
        <button onClick={deleteExhibits}>Delete</button>
      </Col>
    </Row>
    </Container>
  )
}

export default ButtonsContainer
