import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const deleteConversation = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!channelId) {
      return res.status(400).json({ message: "channelId is required" });
    }

    await serverClient.deleteChannel("messaging", channelId);

    res.status(200).json({
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({
      message: "Failed to delete conversation",
    });
  }
};
