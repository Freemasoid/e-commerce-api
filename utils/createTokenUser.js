const createTokenUser = (user) => {
  return {
    name: user.name,
    lastName: user.lastName,
    userId: user._id,
    role: user.role,
    location: user.location,
    email: user.email,
  };
};

export default createTokenUser;
