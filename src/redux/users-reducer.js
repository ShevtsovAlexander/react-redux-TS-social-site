import { userAPI } from '../API/api';
import { updateObjectInArray } from '../utils/object-helpers';

const FOLLOW = 'FOLLOW';
const UNFOLLOW = 'UNFOLLOW';
const SET_USERS = 'SET_USERS';
const SET_CURRENT_USERS = 'SET_CURRENT_USERS';
const SET_TOTAL_USERS_COUNT = 'SET_TOTAL_USERS_COUNT';
const TOGGLE_IS_FETCHING = 'TOGGLE_IS_FETCHING';
const TOGGLE_IS_FOLLOWING_PROGRESS = 'TOGGLE_IS_FOLLOWING_PROGRESS';

const InitialReducer = {
  users: [],
  // [
  //   {
  //     id: 1,
  //     followed: false,
  //     fullName: 'Alexander',
  //     photoUrl: 'https://cdn-icons-png.flaticon.com/512/1250/1250751.png',
  //     status: 'I am studying REACT',
  //     location: { city: 'Moscow', country: 'Russia' },
  //   },
  //   {
  //     id: 2,
  //     followed: true,
  //     fullName: 'Amir',
  //     photoUrl: 'https://cdn-icons-png.flaticon.com/512/1250/1250751.png',
  //     status: 'I am studying REACT, too',
  //     location: { city: 'Yalta', country: 'Russia' },
  //   },
  //   {
  //     id: 3,
  //     followed: false,
  //     fullName: 'Anton',
  //     photoUrl: 'https://cdn-icons-png.flaticon.com/512/1250/1250751.png',
  //     status: 'I am working at home!',
  //     location: { city: 'Krasnodar', country: 'Russia' },
  //   },
  // ],
  pageSize: 5,
  totalUsersCount: 110,
  currentPage: 1,
  isFetching: true,
  followingInProgress: [],
};

const usersReducer = (state = InitialReducer, action) => {
  switch (action.type) {
    case FOLLOW:
      return {
        ...state,
        users: updateObjectInArray(state.users, action.userId, 'id', { followed: true }),
      };
    case UNFOLLOW:
      return {
        ...state,
        users: updateObjectInArray(state.users, action.userId, 'id', { followed: false }),
      };
    case SET_USERS:
      return { ...state, users: action.users };
    case SET_CURRENT_USERS:
      return { ...state, currentPage: action.currentPage };
    case SET_TOTAL_USERS_COUNT:
      return { ...state, totalUsersCount: action.totalUsersCount };
    case TOGGLE_IS_FETCHING:
      return { ...state, isFetching: action.isFetching };
    case TOGGLE_IS_FOLLOWING_PROGRESS:
      return {
        ...state,
        followingInProgress: action.isFetching
          ? [...state.followingInProgress, action.userId]
          : state.followingInProgress.filter((id) => id != action.userId),
      };

    default:
      return state;
  }
};

export const followSuccess = (userId) => ({ type: FOLLOW, userId });
export const unfollowSuccess = (userId) => ({ type: UNFOLLOW, userId });
export const setUsers = (users) => ({ type: SET_USERS, users });
export const setCurrentPage = (currentPage) => ({ type: SET_CURRENT_USERS, currentPage });
export const setTotalUsersCount = (totalUsersCount) => ({ type: SET_TOTAL_USERS_COUNT, totalUsersCount });
export const toggleIsFetching = (isFetching) => ({ type: TOGGLE_IS_FETCHING, isFetching });
export const toggleFollowingProgress = (isFetching, userId) => ({
  type: TOGGLE_IS_FOLLOWING_PROGRESS,
  isFetching,
  userId,
});

export const requestUsers = (currentPage, pageSize) => {
  return async (dispatch) => {
    dispatch(setCurrentPage(currentPage));
    dispatch(toggleIsFetching(true));
    let data = await userAPI.getUsers(currentPage, pageSize);
    dispatch(toggleIsFetching(false));
    dispatch(setUsers(data.items));
    // this.props.setTotalUsersCount(response.data.totalCount);
  };
};
const followUnfollowFlow = async (dispatch, userId, apiMethod, actionCreator) => {
  dispatch(toggleFollowingProgress(true, userId));
  let response = await apiMethod(userId);

  if (response.data.resultCode == 0) {
    dispatch(actionCreator(userId));
  }
  dispatch(toggleFollowingProgress(false, userId));
};
export const follow = (userId) => {
  return async (dispatch) => {
    await followUnfollowFlow(dispatch, userId, userAPI.follow.bind(userAPI), followSuccess);
  };
};
export const unfollow = (userId) => {
  return async (dispatch) => {
    await followUnfollowFlow(dispatch, userId, userAPI.unfollow.bind(userAPI), unfollowSuccess);
  };
};
export default usersReducer;
