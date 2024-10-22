import { userApi } from '../api/userApiSlice';
import { roleApi } from '../api/roleApiSlice';

export const resetAllApiStates = (dispatch) => {
  dispatch(userApi.util.resetApiState());
  dispatch(roleApi.util.resetApiState());
};
