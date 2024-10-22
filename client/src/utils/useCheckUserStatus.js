import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetUserStatusQuery } from "../api/userApiSlice";
import { setLogout } from "../auth/authSlice";
import { resetAllApiStates } from "./logoutUtils";

const useCheckUserStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.user?._id);
  const { refetch } = useGetUserStatusQuery(userId ?? "", { skip: !userId });
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStatusChecked(true);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await refetch();
        if (!response.isSuccess) return;
        const isBlocked = response.data.user.isBlocked;
        if (!isBlocked) {
          // console.log("User Authenticated");
        } else {
          dispatch(setLogout());
          resetAllApiStates(dispatch);
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        dispatch(setLogout());
        resetAllApiStates(dispatch);
        navigate("/login");
      } finally {
        setStatusChecked(true);
      }
    };

    checkStatus();
  }, [dispatch, navigate, refetch, userId]);

  return statusChecked;
};

export default useCheckUserStatus;
