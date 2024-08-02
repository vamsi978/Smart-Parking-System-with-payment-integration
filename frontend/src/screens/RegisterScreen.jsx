import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";

import { useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import toast, { Toaster } from "react-hot-toast";
import "../assets/styles/index.scss";
import "../assets/styles/index.css";
import "../assets/styles/bootstrap.custom.css";
import styled from "styled-components";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading, error }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  //   const { search } = useLocation();
  //   const sp = new URLSearchParams(search);
  const redirect = "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password.length < 3) {
      toast.error("Password needs to be of min 8 char");
    } else if (password !== confirmPassword) {
      console.log(password + " " + confirmPassword);
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await register({ name, email, password }).unwrap();
        console.log(res);
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
      } catch (err) {
        console.log(err);
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <StyledFormContainer>
      <h1>Register</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <StyledFormControl
            type="name"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></StyledFormControl>
        </Form.Group>

        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email </Form.Label>
          <StyledFormControl
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></StyledFormControl>
        </Form.Group>

        <Form.Group className="my-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <StyledFormControl
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></StyledFormControl>
        </Form.Group>
        <Form.Group className="my-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <StyledFormControl
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></StyledFormControl>
        </Form.Group>

        <button disabled={isLoading} type="submit" variant="primary">
          <p> Register </p>
        </button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col>
          Already have an account?{" "}
          <StyledLink to={redirect ? `/login?redirect=${redirect}` : "/login"}>
            Login
          </StyledLink>
        </Col>
      </Row>
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

const StyledLink = styled(Link)`
  text-decoration: underline !important;
`;

const StyledFormControl = styled(Form.Control)`
  font-size: 14px;
  margin: 0px 0;
  height: 40px;
  width: 300px;
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

export default RegisterScreen;
