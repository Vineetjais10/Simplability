// serializers/user/user.serializer.js

const userSerializer = users => {
  if (!Array.isArray(users)) {
    users = [users];
  }
  let response = [];

  response = users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number,
    profile_image: user.profile_image,
    address: user.address,
    created_at: user.created_at,
    updated_at: user.updated_at,
    password: user.password,
    roles: user?.Roles
  }));

  if (response.length === 1) {
    return response.pop();
  } else {
    return response;
  }
};

const usersSerializer = users => {
  return users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number,
    profile_image: user.profile_image,
    address: user.address,
    password: user.password,
    created_at: user.created_at,
    updated_at: user.updated_at,
    roles: user?.Roles
  }));
};

module.exports = {
  userSerializer,
  usersSerializer
};
