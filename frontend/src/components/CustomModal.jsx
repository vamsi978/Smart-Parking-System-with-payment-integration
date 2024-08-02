import React, { useRef } from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import styled from "styled-components";
const CustomModal = ({ show, handleClose, data }) => {
  const qrCodeRef = useRef(null);

  if (!data || data.length === 0) {
    return null;
  }

  const downloadQR = () => {
    // Ensure the QR code element is available before proceeding
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then((canvas) => {
        // Create an "a" element to trigger the download
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `exhibit_qr_${data[0].exhibit_id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }
  };

  const { title, exhibit_id } = data[0];
  console.log(data[0]);

  const exhibitUrl = `${window.location.origin}/UserScreen/${exhibit_id}`;
  console.log("EXIBIT URL " + exhibitUrl);

  return (
    <>
      {show && exhibit_id && (
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <StyledModalTitle>{`QR Code for ${title}`}</StyledModalTitle>
          </Modal.Header>
          <Modal.Body ref={qrCodeRef}>
            <Container>
              <Row className="justify-content-center">
                <Col xs={6}>
                  <div className="text-center">
                    <QRCode
                      size={256}
                      style={{
                        height: "200px",
                        maxWidth: "200px",
                        width: "200px",
                      }}
                      value={exhibitUrl}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Container>
              <Row className="justify-content-center">
                <Col xs={6}>
                  {/* Your centered element goes here */}
                  <div className="text-center">
                    <button
                      className="btn-primary btn-primary-md"
                      onClick={downloadQR}
                    >
                      Download
                    </button>
                  </div>
                </Col>
              </Row>
            </Container>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
const StyledModalTitle = styled(Modal.Title)`
  font-size: 18px;
  font-family: "Poppins";
`;

export default CustomModal;
