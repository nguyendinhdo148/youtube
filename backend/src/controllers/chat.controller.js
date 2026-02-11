import { generateStreamToken } from "../config/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.auth().userId);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error generating Stream token:", error);
    res.status(500).json({
      message: "Failed to generate Stream token",
    });
  }
};
export const deleteConversation = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return res.status(400).json({
        message: "channelId is required",
      });
    }

    // ✅ LẤY CHANNEL
    const channel = serverClient.channel("messaging", channelId);

    // ✅ XOÁ CHANNEL (XOÁ TOÀN BỘ HỘI THOẠI)
    await channel.delete();

    return res.status(200).json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return res.status(500).json({
      message: error.message || "Failed to delete conversation",
    });
  }
};

