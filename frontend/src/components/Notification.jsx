import React, { useEffect } from 'react';
import {Navbar,  Nav, Container, Badge, NavDropdown, InputGroup, Modal} from 'react-bootstrap'
import styled from 'styled-components';
const Notification = ({ showNotification, closeNotification, notificationMessage }) => {
  const handleUndoDelete=()=>{
    console.log('undo');
  }

  return (
    <Modal show={showNotification} onHide={closeNotification}>
       <Modal.Body>{`Exhibits ${notificationMessage.join(', ')} have been deleted` }</Modal.Body>
       <StyledModalFooter onClick={handleUndoDelete}> Undo </StyledModalFooter>
     </Modal>
  );
};

const StyledModalFooter= styled(Modal.Footer)`
  text-decoration:underline;
  color:#ADD8E6; 
  cursor:pointer;
  font-size : 13px;
`;

export default Notification;
