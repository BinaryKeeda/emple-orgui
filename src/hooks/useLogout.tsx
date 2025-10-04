import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/thunks/userThunks';
import type { AppDispatch } from '../store/store';

export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return handleLogout;
};
