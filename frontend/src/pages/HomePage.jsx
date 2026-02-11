import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
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
import { HashIcon, PlusIcon, UsersIcon } from "lucide-react";

import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();

  // set active channel from URL params
  useEffect(() => {
    if (!chatClient) return;
    const channelId = searchParams.get("channel");
    if (channelId) {
      const channel = chatClient.channel("messaging", channelId);
      setActiveChannel(channel);
    }
  }, [chatClient, searchParams]);

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
  className="brand-logo"
  style={{
    height: 32,        // chỉnh cao/thấp tùy ý: 28 / 32 / 36
    width: "auto",     // 🔥 quan trọng
    maxWidth: 140,     // giới hạn để không tràn
    objectFit: "contain",
  }}
/>

                  <span className="brand-name">Youtube</span>
                </div>
                <div className="user-button-wrapper">
                  <UserButton />
                </div>
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

                {/* CHANNELS */}
                <div className="channel-sections">
                  <div className="section-header">
                    <div className="section-title">
                      <HashIcon className="size-4" />
                      <span>Channels</span>
                    </div>
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
                  <div className="section-header direct-messages">
                    <div className="section-title">
                      <UsersIcon className="size-4" />
                      <span>Direct Messages</span>
                    </div>
                  </div>

                  <UsersList activeChannel={activeChannel} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CONTAINER */}
          <div className="chat-main">
            <Channel channel={activeChannel}>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
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
