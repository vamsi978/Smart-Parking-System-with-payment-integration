import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Dropdown } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import toast from "react-hot-toast";
import "../assets/styles/index.css";
import "../assets/styles/bootstrap.custom.css";
import styled from "styled-components";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <StyledFormContainer>
      <h1>Sign In</h1>

      <Form onSubmit={submitHandler}>
        <Form.Group className="my-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
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
        <StyledLink to="/forgotpassword">Forgot password</StyledLink>
        <button disabled={isLoading} type="submit" variant="primary">
          <p>Sign In</p>
        </button>
        <HorizontalRule>
          <TextAboveRule>OR</TextAboveRule>
        </HorizontalRule>
        <Link to={redirect ? `/register?redirect=${redirect}` : "/register"}>
          <StyledButton
            disabled={isLoading}
            type="submit"
            variant="primary"
            outline={true}
          >
            <p>Register</p>
          </StyledButton>
        </Link>
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

const StyledLink = styled(Link)`
  text-decoration: underline !important;
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
  color: #333;
  transition: background-color 0.3s, color 0.3s; /* Add a smooth transition effect */
  width: 100%; /* Make the button take full width */
  display: flex;
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

export default LoginScreen;
