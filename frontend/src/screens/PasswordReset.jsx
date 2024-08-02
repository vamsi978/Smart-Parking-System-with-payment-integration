import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { id, token } = useParams();

  const history = useNavigate();

  const [data2, setData] = useState(false);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  const userValid = async () => {
    try {
      console.log("ID:", id);
      console.log("Token:", token);

      const res = await fetch(`/api/admin/auth/reset-password/${id}/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (data.status === 201) {
        console.log("User is valid");
      } else {
        console.log("User is INVALID");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendpassword = async (e) => {
    e.preventDefault();

    if (password === "") {
      toast.error("password is required!", {
        position: "top-center",
      });
    } else if (password.length < 6) {
      toast.error("password must be 6 char!", {
        position: "top-center",
      });
    } else {
      const res = await fetch(`/api/admin/auth/${id}/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.status == 201) {
        setPassword("");
        setMessage(true);
        //wait for like 2seconds
        navigate("/login");
      } else {
        toast.error("Token Expired generate a new link", {
          position: "top-center",
        });
      }
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  useEffect(() => {
    userValid();
    setTimeout(() => {
      setData(true);
    }, 3000);
  }, []);

  return (
    <>
      {data2 ? (
        <StyledFormContainer>
          <h1>Password reset</h1>
          {message ? (
            <p style={{ color: "#111" }}>Password Successfully Updated</p>
          ) : (
            ""
          )}
          <Form>
            <Form.Group className="my-3" controlId="email">
              <Form.Label>Enter New Password</Form.Label>
              <StyledFormControl
                type="password"
                value={password}
                name="password"
                id="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
              ></StyledFormControl>
            </Form.Group>

            <button
              disabled={isLoading}
              type="submit"
              variant="primary"
              onClick={sendpassword}
            >
              <p>Update</p>
            </button>

            {isLoading && <Loader />}
          </Form>
        </StyledFormContainer>
      ) : (
        <h1>Loading</h1>
      )}
    </>
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
