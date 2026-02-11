import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import axios from "axios";

import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";

import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import "../styles/stream-chat-theme.css";
import { HashIcon, PlusIcon, UsersIcon, Trash2 } from "lucide-react";

import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();

  // set active channel from URL
  useEffect(() => {
    if (!chatClient) return;

    const channelId = searchParams.get("channel");
    if (channelId) {
      const channel = chatClient.channel("messaging", channelId);
      setActiveChannel(channel);
    }
  }, [chatClient, searchParams]);

  // ===== XOÁ HỘI THOẠI =====
  const handleDeleteConversation = async () => {
    if (!activeChannel) return;

    const ok = window.confirm(
      "Bạn có chắc muốn xoá hội thoại này không? Hành động này không thể hoàn tác."
    );
    if (!ok) return;

    try {
      await axios.delete(
        `/api/chat/conversation/${activeChannel.id}`
      );

      // reset UI
      setActiveChannel(null);
      setSearchParams({});
    } catch (error) {
      console.error(error);
      alert("Xoá hội thoại thất bại");
    }
  };

  if (error) return <p>Something went wrong...</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className="chat-wrapper">
      <Chat client={chatClient}>
        <div className="chat-container">
          {/* LEFT SIDEBAR */}
          <div className="str-chat__channel-list">
            <div className="team-channel-list">
              {/* HEADER */}
              <div className="team-channel-list__header gap-4">
                <div className="brand-container">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                      height: 32,
                      width: "auto",
                      maxWidth: 140,
                      objectFit: "contain",
                    }}
                  />
                  <span className="brand-name">Youtube</span>
                </div>
                <UserButton />
              </div>

              {/* CONTENT */}
              <div className="team-channel-list__content">
                {/* CREATE CHANNEL */}
                <div className="create-channel-section">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="create-channel-btn"
                  >
                    <PlusIcon className="size-4" />
                    <span>Create Channel</span>
                  </button>
                </div>

                {/* CHANNEL LIST */}
                <div className="channel-sections">
                  <div className="section-header">
                    <HashIcon className="size-4" />
                    <span>Channels</span>
                  </div>

                  <ChannelList
                    filters={{
                      members: { $in: [chatClient.user.id] },
                      type: "messaging",
                    }}
                    options={{ state: true, watch: true }}
                    Preview={({ channel }) => (
                      <CustomChannelPreview
                        channel={channel}
                        activeChannel={activeChannel}
                        setActiveChannel={(ch) =>
                          setSearchParams({ channel: ch.id })
                        }
                      />
                    )}
                  />
                </div>

                {/* DIRECT MESSAGES */}
                <div className="channel-sections">
                  <div className="section-header">
                    <UsersIcon className="size-4" />
                    <span>Direct Messages</span>
                  </div>
                  <UsersList activeChannel={activeChannel} />
                </div>
              </div>
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="chat-main">
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  {/* HEADER CHAT (CUSTOM) */}
                  <div className="custom-channel-header">
                    <div className="channel-title">
                      {activeChannel.data?.name || "Conversation"}
                    </div>

                    <button
                      onClick={handleDeleteConversation}
                      className="delete-channel-btn"
                    >
                      <Trash2 size={18} />
                      <span>Xoá hội thoại</span>
                    </button>
                  </div>

                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="empty-chat">Chọn 1 hội thoại</div>
            )}
          </div>
        </div>

        {isCreateModalOpen && (
          <CreateChannelModal
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </Chat>
    </div>
  );
};

export default HomePage;
