import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import toast, { Toaster } from "react-hot-toast";
import styled from "styled-components";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const sendLink = async (e) => {
    e.preventDefault();
    if (email === "") {
      toast.error("email is required!", {
        position: "top-center",
      });
    } else if (!email.includes("@")) {
      toast.warning("includes @ in your email!", {
        position: "top-center",
      });
    } else {
      const res = await fetch("/api/admin/auth/sendpasswordlink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, baseUrl: window.location.origin }),
      });

      const data = await res.json();

      if (data.status == 201) {
        setEmail("");
        setMessage(true);
      } else {
        toast.error("Invalid User", {
          position: "top-center",
        });
      }
    }
  };

  return (
    <StyledFormContainer>
      <h1>Password reset</h1>
      {message ? (
        <p style={{ color: "#111" }}>
          Password reset link has been sent to your email.
        </p>
      ) : (
        ""
      )}
      <Form onSubmit={sendLink}>
        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <StyledFormControl
            type="email"
            value={email}
            name="email"
            id="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          ></StyledFormControl>
        </Form.Group>

        <button disabled={isLoading} type="submit" variant="primary">
          <p>Send</p>
        </button>

        {isLoading && <Loader />}
      </Form>
    </StyledFormContainer>
  );
};

const StyledFormContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 50px;
  width: 400px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 3em;
  margin-bottom: 3em;
  font-size: 14px;
  border-radius: 10px;
  background-color: #ffff;
  padding: 1.8rem;
  box-shadow: 2px 5px 20px rgba(0, 0, 0, 0.1);
  font-family: Arial;
`;

const StyledFormControl = styled(Form.Control)`
  margin: 0px 0;
  height: 40px;
  width: 300px;
  font-size: 14px;
`;

const StyledButton = styled(Button)`
  margin-top: 16px;
  border: 1px solid #1f41bb;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: background-color 0.3s, color 0.3s; /* Add a smooth transition effect */
`;

const HorizontalRule = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 16px;
  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #000; /* Adjust the color as needed */
    margin: 0 10px; /* Adjust the spacing as needed */
  }
`;

const TextAboveRule = styled.div`
  margin: 0 10px; /* Adjust the spacing as needed */
`;

export default ForgotPasswordScreen;
