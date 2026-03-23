import React from "react";
import "./ChatSidebarNew.css";

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
  labels,
  language = "en",
}) {
  const t = (key, fallback) => labels?.[key] || fallback;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t("today", "Today");
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return t("yesterday", "Yesterday");
    }

    return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getChatPreview = (chat) => {
    const userMessage = chat.messages.find((message) => message.role === "user" && message.content);
    if (!userMessage) {
      return t("newChat", "New chat");
    }

    return userMessage.content.length > 38
      ? `${userMessage.content.slice(0, 38)}...`
      : userMessage.content;
  };

  return (
    <>
      <aside className={`chat-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <h2 className="sidebar-brand">PlantLyf</h2>
          <button className="close-sidebar-btn" onClick={onToggle} title={t("closeSidebar", "Close sidebar")}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <button className="new-chat-btn" onClick={onNewChat}>
          <PlusIcon />
          <span>{t("newChat", "New chat")}</span>
        </button>

        <div className="sidebar-section-title">{t("chats", "Chats")}</div>

        <div className="chats-list">
          {chats.length === 0 ? (
            <div className="empty-chats">
              <ChatIcon />
              <p>{t("noChats", "No chats yet")}</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${currentChatId === chat.id ? "active" : ""}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="chat-item-content">
                  <ChatIcon />
                  <div className="chat-item-info">
                    <p className="chat-preview">{getChatPreview(chat)}</p>
                    <span className="chat-date">{formatDate(chat.timestamp)}</span>
                  </div>
                </div>
                <button
                  className="delete-chat-btn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  title={t("deleteChat", "Delete chat")}
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      <button className="sidebar-toggle-btn" onClick={onToggle} title={t("openSidebar", "Open sidebar")}>
        <MenuIcon />
      </button>
    </>
  );
}
