export const fakeAuth = (req, res, next) => {
  req.user = {
    id: "64f012345678901234567890",
    name: "waiter",
    role: "waiter",
  };
  next();
};
