import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { appLogo } from "../assets/appConfig.js";
import { useLoginMutation } from "../api/userApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "../auth/authSlice";

const LoginPage = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await login({ userId, password }).unwrap();

      if (response.user.isBlocked) {
        setLoginError("Your account has been blocked. Please contact support.");
        return;
      }

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          lastLoggedIn: new Date().toISOString(),
        })
      );
      navigate("/dashboard");
    } catch (err) {
      if (err.data?.message === "Invalid credentials") {
        setLoginError("Invalid user ID or password. Please try again.");
      } else {
        setLoginError("Login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-7 rounded-lg shadow-md w-full max-w-sm">
        <img src={appLogo} alt="Logo" className="mb-4 mx-auto w-32" />
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="user-id" className="block text-muted-foreground">
              User ID
            </label>
            <input
              type="text"
              id="user-id"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border border-border rounded-lg p-2 w-full focus:outline-none"
              required
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-border rounded-lg p-2 w-full focus:outline-none"
              required
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="mt-4 mb-4 bg-blue text-white hover:opacity-90 p-2 w-full transition duration-200 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
        {loginError && <p className="text-red mt-4">{loginError}</p>}
      </div>
      <p className="mt-4 text-muted text-sm flex justify-center items-center gap-2">
        Made With
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="red"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"></path>
        </svg>
        By
        <a href="https://ametzo.com" target="_blank">
          Ametzo Technologies
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
