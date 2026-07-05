const User = require("../model/User");

module.exports = async (
  req,
  res,
  next
) => {

  const user =
  await User.findOne({
    firebaseUid:
      req.user.uid,
  });

  if (
    !user ||
    user.role !== "driver"
  ) {
    return res
      .status(403)
      .json({
        message:
          "Driver only",
      });
  }

  next();
};