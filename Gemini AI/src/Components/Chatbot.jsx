import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const formatResponse = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold text
            .replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>") // Code blocks
            .replace(/\n/g, "<br>"); // Line breaks
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Response copied to clipboard!");
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, type: "user" };
        setMessages((prev) => [...prev, userMessage]);

        // Show loading message
        setLoading(true);

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    contents: [{ parts: [{ text: input }] }],
                }
            );

            const botRawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
            const botMessage = {
                text: botRawText,
                formattedText: formatResponse(botRawText),
                type: "bot",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error fetching response:", error);
        } finally {
            setLoading(false); // Remove loading message when bot replies
        }

        setInput("");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">
            <h1 className="chat-header">ChatBot AI</h1>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        {msg.type === "bot" ? (
                            <div>
                                <span dangerouslySetInnerHTML={{ __html: msg.formattedText }}></span>
                                <button className="copy-btn" onClick={() => copyToClipboard(msg.text)}>
                                    Copy
                                </button>
                            </div>
                        ) : (
                            <span>{msg.text}</span>
                        )}
                    </div>
                ))}
                {loading && <div className="message bot">Thinking...</div>}
            </div>
            <div className="chat-input">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default Chatbot;
