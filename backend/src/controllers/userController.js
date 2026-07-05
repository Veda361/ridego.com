const User = require("../model/User");

const ADMIN_EMAILS = ["devsahugdg@gmail.com"];


const registerUser = async (req, res) => {
  try {
    const { uid, email } = req.user;

    const role = ADMIN_EMAILS.includes(email.toLowerCase())
      ? "admin"
      : req.body.role || "rider";

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          email,
          name: req.body.name,
          role,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    console.log("Firebase User:", req.user);

    const currentUser = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!currentUser) {
      const role = ADMIN_EMAILS.includes(req.user.email.toLowerCase())
        ? "admin"
        : "rider";

      const newUser = await User.create({
        firebaseUid: req.user.uid,
        email: req.user.email,
        name: req.user.email.split("@")[0],
        role,
      });

      return res.status(200).json(newUser);
    }

    res.status(200).json(currentUser);
  } catch (error) {
    console.error("GET USER ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  getCurrentUser,
};
