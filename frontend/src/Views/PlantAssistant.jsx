import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import robotImage from "../assets/ChatGPT Image Dec 12, 2025, 10_43_24 AM.jpg";
import ChatSidebar from "../Components/ChatSidebar";
import "./PlantAssistantNew.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEFAULT_LANGUAGE = "en";
const LANGUAGE_STORAGE_KEY = "plantAssistantLanguage";

const TRANSLATIONS = {
  en: {
    languageLabel: "Language",
    english: "English",
    hindi: "Hindi",
    plantGuide: "PlantLyf Guide",
    plantAi: "PlantLyf AI",
    thinking: "Thinking...",
    streaming: "Streaming",
    ready: "Ready",
    addToCart: "Add to Cart",
    welcomeMessage:
      "Hi! Welcome to PlantLyf. Ask about tomato care, upload a leaf image, and I will respond in a live streaming style.",
    newChat: "New chat",
    askPlantLyf: "Ask PlantLyf",
    askImage: "Ask PlantLyf about this image...",
    imageCare: "Image + Care",
    diseaseOnly: "Disease Only",
    takePhoto: "Take Photo",
    imageDiagnosis: "Image diagnosis",
    diseaseDetection: "Disease detection",
    removeImage: "Remove image",
    sendImage: "Send image",
    sendMessage: "Send message",
    cameraTitle: "Take Photo - PlantLyf",
    today: "Today",
    yesterday: "Yesterday",
    chats: "Chats",
    noChats: "No chats yet",
    deleteChat: "Delete chat",
    openSidebar: "Open sidebar",
    closeSidebar: "Close sidebar",
    close: "Close",
    capturePhoto: "Capture Photo",
    uploadInstead: "Upload Instead",
    cameraBlocked: "Camera access blocked or unavailable. Choose image manually.",
    cameraNotReady: "Camera is not ready yet. Please try again.",
    cameraCaptureFailed: "Unable to capture photo from camera.",
    streamError: "Sorry, I could not stream a response.",
    streamUnsupported: "Streaming is not supported by this browser response.",
    streamFailed: "Streaming failed.",
    fallbackError: "I could not generate a response.",
    genericError: "Sorry, I encountered an error. Please try again.",
    imageAnalysisFailedContext: "Image was uploaded, but disease model analysis failed.",
    imageAnalysisFailedReply: "Could not detect disease from the uploaded image.",
    diseaseDetected: "Disease detected:",
    analysisQuestion:
      "Please analyze this tomato leaf condition and provide care suggestions based on the detected disease and current weather.",
    hindiInstruction: "Please respond in Hindi language.",
  },
  hi: {
    languageLabel: "भाषा",
    english: "अंग्रेजी",
    hindi: "हिंदी",
    plantGuide: "PlantLyf मार्गदर्शक",
    plantAi: "PlantLyf एआई",
    thinking: "सोच रहा है...",
    streaming: "उत्तर दे रहा है...",
    ready: "तैयार",
    addToCart: "कार्ट में जोड़ें",
    welcomeMessage:
      "नमस्ते! PlantLyf में आपका स्वागत है। टमाटर देखभाल के बारे में पूछें, पत्ते की छवि अपलोड करें, और मैं लाइव स्ट्रीमिंग शैली में उत्तर दूंगा।",
    newChat: "नई चैट",
    askPlantLyf: "PlantLyf से पूछें",
    askImage: "इस छवि के बारे में PlantLyf से पूछें...",
    imageCare: "छवि + उपचार",
    diseaseOnly: "केवल रोग नाम",
    takePhoto: "फोटो लें",
    imageDiagnosis: "छवि निदान",
    diseaseDetection: "रोग पहचान",
    removeImage: "छवि हटाएं",
    sendImage: "छवि भेजें",
    sendMessage: "संदेश भेजें",
    cameraTitle: "फोटो लें - PlantLyf",
    today: "आज",
    yesterday: "कल",
    chats: "चैट्स",
    noChats: "कोई चैट नहीं",
    deleteChat: "चैट हटाएं",
    openSidebar: "साइडबार खोलें",
    closeSidebar: "साइडबार बंद करें",
    close: "बंद करें",
    capturePhoto: "फोटो कैप्चर करें",
    uploadInstead: "इसके बजाय अपलोड करें",
    cameraBlocked: "कैमरा उपलब्ध नहीं है या अनुमति नहीं मिली। कृपया छवि अपलोड करें।",
    cameraNotReady: "कैमरा अभी तैयार नहीं है। कृपया फिर से प्रयास करें।",
    cameraCaptureFailed: "कैमरे से फोटो कैप्चर नहीं हो पाई।",
    streamError: "क्षमा करें, मैं उत्तर स्ट्रीम नहीं कर सका।",
    streamUnsupported: "इस ब्राउज़र में स्ट्रीमिंग समर्थित नहीं है।",
    streamFailed: "स्ट्रीमिंग विफल हुई।",
    fallbackError: "मैं उत्तर उत्पन्न नहीं कर सका।",
    genericError: "क्षमा करें, एक त्रुटि हुई। कृपया फिर से प्रयास करें।",
    imageAnalysisFailedContext: "छवि अपलोड हुई, लेकिन रोग मॉडल विश्लेषण विफल हो गया।",
    imageAnalysisFailedReply: "अपलोड की गई छवि से रोग पहचान नहीं हो पाई।",
    diseaseDetected: "पहचाना गया रोग:",
    analysisQuestion:
      "कृपया इस टमाटर पत्ते की स्थिति का विश्लेषण करें और पहचाने गए रोग तथा वर्तमान मौसम के आधार पर देखभाल सुझाव दें।",
    hindiInstruction: "कृपया उत्तर हिंदी भाषा में दें।",
  },
};

const LOCATION_OPTIONS = [
  { value: "lucknow", city: "Lucknow", en: "Lucknow, Uttar Pradesh", hi: "लखनऊ, उत्तर प्रदेश" },
  { value: "kanpur", city: "Kanpur", en: "Kanpur, Uttar Pradesh", hi: "कानपुर, उत्तर प्रदेश" },
  { value: "varanasi", city: "Varanasi", en: "Varanasi, Uttar Pradesh", hi: "वाराणसी, उत्तर प्रदेश" },
  { value: "prayagraj", city: "Prayagraj", en: "Prayagraj, Uttar Pradesh", hi: "प्रयागराज, उत्तर प्रदेश" },
  { value: "agra", city: "Agra", en: "Agra, Uttar Pradesh", hi: "आगरा, उत्तर प्रदेश" },
  { value: "meerut", city: "Meerut", en: "Meerut, Uttar Pradesh", hi: "मेरठ, उत्तर प्रदेश" },
  { value: "ghaziabad", city: "Ghaziabad", en: "Ghaziabad, Uttar Pradesh", hi: "गाजियाबाद, उत्तर प्रदेश" },
  { value: "noida", city: "Noida", en: "Noida, Uttar Pradesh", hi: "नोएडा, उत्तर प्रदेश" },
  { value: "gorakhpur", city: "Gorakhpur", en: "Gorakhpur, Uttar Pradesh", hi: "गोरखपुर, उत्तर प्रदेश" },
  { value: "bareilly", city: "Bareilly", en: "Bareilly, Uttar Pradesh", hi: "बरेली, उत्तर प्रदेश" },
  { value: "jhansi", city: "Jhansi", en: "Jhansi, Uttar Pradesh", hi: "झांसी, उत्तर प्रदेश" },
  { value: "aligarh", city: "Aligarh", en: "Aligarh, Uttar Pradesh", hi: "अलीगढ़, उत्तर प्रदेश" },
  { value: "moradabad", city: "Moradabad", en: "Moradabad, Uttar Pradesh", hi: "मुरादाबाद, उत्तर प्रदेश" },
  { value: "saharanpur", city: "Saharanpur", en: "Saharanpur, Uttar Pradesh", hi: "सहारनपुर, उत्तर प्रदेश" },
];

const createId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const generateChatId = () => createId("chat");
const generateMessageId = () => createId("msg");

const createMessage = (role, overrides = {}) => ({
  id: generateMessageId(),
  role,
  content: "",
  status: "done",
  ...overrides,
});

const createInitialMessage = (language = DEFAULT_LANGUAGE) =>
  createMessage("assistant", {
    content: TRANSLATIONS[language]?.welcomeMessage || TRANSLATIONS.en.welcomeMessage,
    isWelcomeMessage: true,
  });

const createInitialChat = (language = DEFAULT_LANGUAGE) => ({
  id: generateChatId(),
  messages: [createInitialMessage(language)],
  timestamp: Date.now(),
});

const getChatTitle = (chat, fallbackTitle = "New chat") => {
  const userMessage = chat?.messages?.find((message) => message.role === "user" && message.content?.trim());
  if (!userMessage) {
    return fallbackTitle;
  }

  return userMessage.content.length > 42
    ? `${userMessage.content.slice(0, 42)}...`
    : userMessage.content;
};

const normalizeMessage = (message) => ({
  id: message.id || generateMessageId(),
  status: message.status || "done",
  ...message,
});

const hydrateChats = (storedChats, language = DEFAULT_LANGUAGE) => {
  if (!Array.isArray(storedChats) || storedChats.length === 0) {
    return [createInitialChat(language)];
  }

  return storedChats.map((chat) => ({
    id: chat.id || generateChatId(),
    timestamp: chat.timestamp || Date.now(),
    messages:
      Array.isArray(chat.messages) && chat.messages.length > 0
        ? chat.messages.map(normalizeMessage)
        : [createInitialMessage(language)],
  }));
};

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
  </svg>
);

const DiseaseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const TypingIndicator = () => (
  <div className="typing-indicator" aria-label="Assistant is typing">
    <span />
    <span />
    <span />
  </div>
);

const ProductCard = ({ product, labels }) => (
  <div className="product-card">
    <div className="product-image-container">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-overlay" />
    </div>
    <div className="product-info">
      <h4 className="product-name">{product.name}</h4>
      <p className="product-usage">{product.usage}</p>
      <p className="product-price">{product.price}</p>
      <button className="add-to-cart-btn">{labels.addToCart}</button>
    </div>
  </div>
);

const RobotAvatar = () => (
  <img src={robotImage} alt="PlantLyf Robot" className="robot-avatar-image" />
);

const renderFormattedContent = (text) => {
  if (!text) {
    return null;
  }

  const lines = text.split("\n");

  return lines.map((line, lineIndex) => {
    const bulletMatch = line.match(/^\s*[*-]\s+(.*)$/);
    const rawContent = bulletMatch ? bulletMatch[1] : line;
    const chunks = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let cursor = 0;
    let match;

    while ((match = boldRegex.exec(rawContent)) !== null) {
      if (match.index > cursor) {
        chunks.push(
          <React.Fragment key={`text-${lineIndex}-${cursor}`}>
            {rawContent.slice(cursor, match.index)}
          </React.Fragment>
        );
      }

      chunks.push(
        <strong key={`bold-${lineIndex}-${match.index}`}>{match[1]}</strong>
      );
      cursor = match.index + match[0].length;
    }

    if (cursor < rawContent.length) {
      chunks.push(
        <React.Fragment key={`tail-${lineIndex}-${cursor}`}>
          {rawContent.slice(cursor)}
        </React.Fragment>
      );
    }

    if (bulletMatch) {
      return (
        <p key={`line-${lineIndex}`} className="message-content markdown-line bullet-line">
          <span className="bullet-dot">* </span>
          {chunks}
        </p>
      );
    }

    return (
      <p key={`line-${lineIndex}`} className="message-content markdown-line">
        {chunks.length > 0 ? chunks : rawContent}
      </p>
    );
  });
};

const MessageBubble = ({ message, isUser, quickActions, labels }) => {
  const showTyping = !isUser && message.status === "thinking" && !message.content;
  const showCursor = !isUser && (message.status === "thinking" || message.status === "streaming");

  return (
    <div className={`message-wrapper ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className={`robot-avatar ${message.isWelcomeMessage ? "welcome" : ""}`}>
          <RobotAvatar />
        </div>
      )}

      <div className="message-shell">
        {!isUser && (
          <div className="message-meta">
            <span className="message-author">
              {message.isWelcomeMessage ? labels.plantGuide : labels.plantAi}
            </span>
            <span className={`message-status ${message.status}`}>
              {message.status === "thinking"
                ? labels.thinking
                : message.status === "streaming"
                  ? labels.streaming
                  : labels.ready}
            </span>
          </div>
        )}

        <div className={`message-bubble ${showTyping ? "loading" : ""}`}>
          {message.image && (
            <div className="message-image-container">
              <img src={message.image} alt="Uploaded plant" className="message-image" />
            </div>
          )}

          {showTyping ? (
            <TypingIndicator />
          ) : (
            <>
              {message.content && (
                <div className="message-content-wrap">
                  {renderFormattedContent(message.content)}
                  {showCursor && <span className="stream-cursor" />}
                </div>
              )}

              {message.showQuickActions && quickActions && (
                <div className="quick-actions-inline">
                  {quickActions.map((action, index) => (
                    <button key={index} onClick={action.action} className="quick-action-btn-inline">
                      <action.icon />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {message.products && message.products.length > 0 && (
                <div className="products-grid">
                  {message.products.map((product) => (
                    <ProductCard key={product.id} product={product} labels={labels} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const cityMap = Object.fromEntries(LOCATION_OPTIONS.map((item) => [item.value, item.city]));

export default function PlantAssistant() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LANGUAGE
  );
  const labels = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);
  const t = (key) => labels[key] || TRANSLATIONS.en[key] || key;

  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("plantAssistantChats");
    if (!savedChats) {
      return [createInitialChat(language)];
    }

    try {
      return hydrateChats(JSON.parse(savedChats), language);
    } catch (error) {
      console.error("Error parsing saved chats:", error);
      return [createInitialChat(language)];
    }
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    const savedChats = localStorage.getItem("plantAssistantChats");
    if (!savedChats) {
      return null;
    }

    try {
      return hydrateChats(JSON.parse(savedChats), language)[0]?.id || null;
    } catch {
      return null;
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("lucknow");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [mode, setMode] = useState("image_diagnosis");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const currentChat = useMemo(
    () => chats.find((chat) => chat.id === currentChatId) || chats[0] || null,
    [chats, currentChatId]
  );
  const messages = useMemo(
    () => currentChat?.messages || [createInitialMessage(language)],
    [currentChat, language]
  );
  const currentChatTitle = useMemo(() => getChatTitle(currentChat, t("newChat")), [currentChat, labels]);
  const locationOptions = useMemo(
    () =>
      LOCATION_OPTIONS.map((item) => ({
        value: item.value,
        label: item[language] || item.en,
      })),
    [language]
  );

  useEffect(() => {
    if (!currentChatId && chats[0]?.id) {
      setCurrentChatId(chats[0].id);
    }
  }, [chats, currentChatId]);

  useEffect(() => {
    localStorage.setItem("plantAssistantChats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isCameraOpen || !cameraVideoRef.current || !cameraStreamRef.current) {
      return;
    }

    cameraVideoRef.current.srcObject = cameraStreamRef.current;
    cameraVideoRef.current.play().catch(() => {
      // Ignore autoplay interruption; user can press capture after manual interaction.
    });
  }, [isCameraOpen]);

  useEffect(
    () => () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
    },
    []
  );

  const appendMessagesToChat = (chatId, newMessages) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, ...newMessages],
              timestamp: Date.now(),
            }
          : chat
      )
    );
  };

  const updateMessage = (chatId, messageId, updates) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== chatId) {
          return chat;
        }

        return {
          ...chat,
          messages: chat.messages.map((message) => {
            if (message.id !== messageId) {
              return message;
            }

            const nextUpdates =
              typeof updates === "function" ? updates(message) : updates;

            return { ...message, ...nextUpdates };
          }),
        };
      })
    );
  };

  const animateAssistantMessage = (chatId, messageId, text) =>
    new Promise((resolve) => {
      const finalText = text || "";

      if (!finalText) {
        updateMessage(chatId, messageId, { content: "", status: "done" });
        resolve();
        return;
      }

      let currentLength = 0;
      const step = Math.max(2, Math.ceil(finalText.length / 90));

      const intervalId = window.setInterval(() => {
        currentLength = Math.min(finalText.length, currentLength + step);
        const isComplete = currentLength >= finalText.length;

        updateMessage(chatId, messageId, {
          content: finalText.slice(0, currentLength),
          status: isComplete ? "done" : "streaming",
        });

        if (isComplete) {
          window.clearInterval(intervalId);
          resolve();
        }
      }, 18);
    });

  const streamAssistantReply = async (chatId, messageId, payload) => {
    const response = await fetch(`${API_BASE_URL}/api/chatbot/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let detail = t("streamError");
      try {
        const errorData = await response.json();
        detail = errorData.detail || errorData.message || detail;
      } catch {
        // Ignore JSON parsing issues and use the default detail.
      }
      throw new Error(detail);
    }

    if (!response.body) {
      throw new Error(t("streamUnsupported"));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let buffer = "";

    const applyEvent = (rawLine) => {
      if (!rawLine.trim()) {
        return null;
      }

      const event = JSON.parse(rawLine);

      if (event.type === "chunk") {
        accumulated += event.content || "";
        updateMessage(chatId, messageId, {
          content: accumulated,
          status: "streaming",
        });
        return null;
      }

      if (event.type === "done") {
        updateMessage(chatId, messageId, {
          content: event.answer || accumulated,
          status: "done",
        });
        return event;
      }

      if (event.type === "error") {
        throw new Error(event.detail || t("streamFailed"));
      }

      return null;
    };

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const completedEvent = applyEvent(line);
        if (completedEvent) {
          return completedEvent;
        }
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      const completedEvent = applyEvent(buffer);
      if (completedEvent) {
        return completedEvent;
      }
    }

    updateMessage(chatId, messageId, {
      content: accumulated,
      status: "done",
    });

    return { answer: accumulated };
  };

  const sendMessage = async () => {
    if ((!input.trim() && !uploadedImage) || loading || !currentChat) {
      return;
    }

    const activeChatId = currentChat.id;
    const userText = input.trim();
    const imageToSend = uploadedImage;
    const existingMessages = currentChat.messages || [];
    const assistantMessageId = generateMessageId();

    const messageHistory = existingMessages
      .filter((message) => {
        if (message.isWelcomeMessage) {
          return false;
        }

        if (!message.content || !message.content.trim()) {
          return false;
        }

        return message.role === "user" || message.role === "assistant";
      })
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const userMessage = createMessage("user", {
      content: userText,
      image: imageToSend?.previewUrl || undefined,
    });

    const assistantMessage = createMessage("assistant", {
      id: assistantMessageId,
      status: "thinking",
    });

    setInput("");
    setUploadedImage(null);
    appendMessagesToChat(activeChatId, [userMessage, assistantMessage]);
    setLoading(true);

    try {
      let diseaseContext = null;
      let diagnosisReply = null;

      if (imageToSend?.file) {
        const formData = new FormData();
        formData.append("file", imageToSend.file);

        try {
          const imageResponse = await axios.post(`${API_BASE_URL}/api/analyze-image`, formData);
          const imageData = imageResponse.data;
          const topCandidates = (imageData.top3 || [])
            .map((item) => `${item[0]} (${(item[1] * 100).toFixed(1)}%)`)
            .join(", ");

          diseaseContext = `Predicted disease: ${imageData.predicted_label}. Confidence: ${(
            imageData.confidence * 100
          ).toFixed(1)}%. Top candidates: ${topCandidates}.`;
          diagnosisReply = `${t("diseaseDetected")} ${imageData.predicted_label}`;
        } catch (imageError) {
          console.error("Image analysis failed:", imageError);
          diseaseContext = t("imageAnalysisFailedContext");
          diagnosisReply = t("imageAnalysisFailedReply");
        }
      }

      if (mode === "disease_detection" && imageToSend?.file) {
        await animateAssistantMessage(
          activeChatId,
          assistantMessageId,
          diagnosisReply || t("imageAnalysisFailedReply")
        );
        setLoading(false);
        return;
      }

      let questionToSend = userText || t("analysisQuestion");
      if (language === "hi") {
        questionToSend = `${t("hindiInstruction")} ${questionToSend}`;
      }

      try {
        await streamAssistantReply(activeChatId, assistantMessageId, {
          question: questionToSend,
          history: messageHistory,
          city: cityMap[location] || "Lucknow",
          disease_context: diseaseContext,
        });
      } catch (streamError) {
        console.error("Streaming failed, falling back to standard reply:", streamError);

        const fallbackResponse = await axios.post(`${API_BASE_URL}/api/chatbot`, {
          question: questionToSend,
          history: messageHistory,
          city: cityMap[location] || "Lucknow",
          disease_context: diseaseContext,
        });

        const fallbackReply =
          fallbackResponse.data?.answer || t("fallbackError");

        await animateAssistantMessage(activeChatId, assistantMessageId, fallbackReply);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        t("genericError");

      updateMessage(activeChatId, assistantMessageId, {
        content: `Error: ${errorMessage}`,
        status: "done",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (input.trim() || uploadedImage) {
        sendMessage();
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = "";
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage({ file, previewUrl: imageUrl });
  };

  const closeCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCameraError("");
  };

  const openCamera = async () => {
    setMode("image_diagnosis");
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      cameraStreamRef.current = stream;

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        await cameraVideoRef.current.play();
      }
    } catch (error) {
      console.error("Camera access failed:", error);
      setCameraError(t("cameraBlocked"));
      cameraInputRef.current?.click();
    }
  };

  const handleCapturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video) {
      setCameraError(t("cameraNotReady"));
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(t("cameraCaptureFailed"));
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError(t("cameraCaptureFailed"));
          return;
        }

        if (uploadedImage?.previewUrl) {
          URL.revokeObjectURL(uploadedImage.previewUrl);
        }

        const file = new File([blob], `plantlyf-camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        const previewUrl = URL.createObjectURL(file);
        setUploadedImage({ file, previewUrl });
        closeCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const removeUploadedImage = () => {
    if (uploadedImage?.previewUrl) {
      URL.revokeObjectURL(uploadedImage.previewUrl);
    }
    setUploadedImage(null);
  };

  const handleNewChat = () => {
    const newChat = createInitialChat(language);
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
    setUploadedImage(null);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
    setUploadedImage(null);
  };

  const handleDeleteChat = (chatId) => {
    setChats((prevChats) => {
      const filteredChats = prevChats.filter((chat) => chat.id !== chatId);

      if (filteredChats.length === 0) {
        const replacementChat = createInitialChat(language);

        setCurrentChatId(replacementChat.id);
        return [replacementChat];
      }

      if (chatId === currentChatId) {
        setCurrentChatId(filteredChats[0].id);
      }

      return filteredChats;
    });
  };

  return (
    <div className="plant-assistant">
      <div className="background-overlay" />

      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        labels={labels}
        language={language}
      />

      <div className={`main-container ${!sidebarOpen ? "sidebar-collapsed" : ""}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="sidebar-collapse-btn"
              onClick={() => setSidebarOpen((open) => !open)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
            <img src="/PlantLyf Logo.png" alt="PlantLyf logo" className="brand-logo" />
            <span className="brand-name">PlantLyf</span>
          </div>

          <h1 className="chat-title">{currentChatTitle}</h1>

          <div className="topbar-right">
            <div className="language-selector">
              <span className="selector-label">{t("languageLabel")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="language-select"
              >
                <option value="en">{t("english")}</option>
                <option value="hi">{t("hindi")}</option>
              </select>
            </div>
            <div className="location-selector">
              <MapIcon />
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="location-select"
              >
                {locationOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="chat-area">
          <div className="chat-container">
            <div className="messages-container">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isUser={message.role === "user"}
                  quickActions={null}
                  labels={labels}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              {uploadedImage && (
                <div className="image-preview-container">
                  <div className="image-preview">
                    <img src={uploadedImage.previewUrl} alt="Uploaded plant" className="preview-image" />
                    <div className="preview-badge">
                      {mode === "disease_detection" ? t("diseaseDetection") : t("imageDiagnosis")}
                    </div>
                    <button
                      className="remove-image-btn"
                      onClick={removeUploadedImage}
                      title={t("removeImage")}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="input-shell">
                <div className="input-container">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      uploadedImage
                        ? t("askImage")
                        : t("askPlantLyf")
                    }
                    className="message-input"
                    rows={1}
                  />
                </div>
                <div className="composer-footer">
                  <div className="chatbar-actions">
                    <button
                      className={`chatbar-action-btn ${mode === "image_diagnosis" ? "active" : ""}`}
                      onClick={() => {
                        setMode("image_diagnosis");
                        fileInputRef.current?.click();
                      }}
                      title="Image Diagnosis"
                    >
                      <DiseaseIcon />
                      <span>{t("imageCare")}</span>
                    </button>

                    <button
                      className={`chatbar-action-btn ${mode === "disease_detection" ? "active" : ""}`}
                      onClick={() => {
                        setMode("disease_detection");
                        fileInputRef.current?.click();
                      }}
                      title="Disease Detection"
                    >
                      <DiseaseIcon />
                      <span>{t("diseaseOnly")}</span>
                    </button>

                    <button
                      className="chatbar-action-btn"
                      onClick={() => {
                        openCamera();
                      }}
                      title="Take Photo"
                    >
                      <CameraIcon />
                      <span>{t("takePhoto")}</span>
                    </button>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={(!input.trim() && !uploadedImage) || loading}
                    className="send-button"
                    title={uploadedImage && !input.trim() ? t("sendImage") : t("sendMessage")}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden-input"
        onChange={handleFileUpload}
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        className="hidden-input"
        onChange={handleFileUpload}
      />

      {isCameraOpen && (
        <div className="camera-modal-overlay" onClick={closeCamera}>
          <div className="camera-modal" onClick={(event) => event.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>{t("cameraTitle")}</h3>
              <button className="camera-close-btn" onClick={closeCamera}>
                {t("close")}
              </button>
            </div>

            <div className="camera-preview-shell">
              <video ref={cameraVideoRef} autoPlay playsInline muted className="camera-video" />
            </div>

            {cameraError && <p className="camera-error">{cameraError}</p>}

            <div className="camera-modal-actions">
              <button className="camera-capture-btn" onClick={handleCapturePhoto}>
                {t("capturePhoto")}
              </button>
              <button className="camera-upload-btn" onClick={() => cameraInputRef.current?.click()}>
                {t("uploadInstead")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
