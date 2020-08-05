// SCHEMA
// id: {
//   username,
//   createdAt,
//   profileImgName
// },

const users = {};

exports.getUserById = (id) => {
  return users[id];
};

exports.doesUsernameExists = (username) => {
  return Object.keys(users).find((user) => users[user].username === username);
};

exports.addNewUser = (id, username, imgNumber) => {
  const profileImgName = imgNumber.split('-')[2];

  users[id] = {
    username,
    createdAt: Date.now(),
    profileImgName,
  };

  return users[id];
};

exports.getAllUsers = () => {
  return {
    members: Object.keys(users).length,
    users,
  };
};

exports.removeUser = (id) => {
  delete users[id];
};
