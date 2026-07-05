const { auth } = require("../config/firebaseAdmin");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Extracted Token:", token);

    const decodedToken = await auth.verifyIdToken(token);

    console.log("\n========== AUTH ==========");
    console.log("Route :", req.method, req.originalUrl);
    console.log("UID   :", decodedToken.uid);
    console.log("Email :", decodedToken.email);
    console.log("==========================\n");

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Firebase Verify Error");
    console.error("Code:", error.code);
    console.error("Message:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = protect;
