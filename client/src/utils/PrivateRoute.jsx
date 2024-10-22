import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useTokenValidation from "./useTokenValidation";
import useCheckUserStatus from "./useCheckUserStatus";
import Loader from "../assets/Loader";

const PrivateRoute = ({ children, isComponentLoading }) => {
  const tokenChecked = useTokenValidation();
  const statusChecked = useCheckUserStatus();
  const token = useSelector((state) => state.auth.token);

  if (!tokenChecked || !statusChecked || isComponentLoading) {
    return <Loader />
  } else {
    return token ? children : <Navigate to="/login" />;
  }
};

export default PrivateRoute;
