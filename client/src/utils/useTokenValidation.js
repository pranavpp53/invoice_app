import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setLogout } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";
import { resetAllApiStates } from "./logoutUtils";

const useTokenValidation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp < currentTime) {
            dispatch(setLogout());
            resetAllApiStates(dispatch);
            navigate("/login");
          }
        } catch (error) {
          console.error("Token verification error:", error);
          dispatch(setLogout());
          resetAllApiStates(dispatch);
          navigate("/login");
        }
      }
      setTokenChecked(true);
    };

    checkToken();

    const interval = setInterval(checkToken, 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch, token, navigate]);

  return tokenChecked;
};

export default useTokenValidation;
