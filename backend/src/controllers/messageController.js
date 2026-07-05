const Message = require("../model/Message");

const getRideMessages = async (req, res) => {
  try {
    const { rideId } = req.params;

    const messages = await Message.find({
      rideId,
    }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getRideMessages,
};