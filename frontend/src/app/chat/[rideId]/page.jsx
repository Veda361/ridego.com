"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { Send, Car, Circle } from "lucide-react";

import { socket, registerSocketUser } from "@/lib/socket";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RideChatPage() {
  const { rideId } = useParams();

  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  /*
  ======================================
  Load Previous Messages
  ======================================
  */

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(
          `${API}/api/messages/${rideId}`,
          {
            headers: authHeaders(),
          }
        );

        const data = await response.json();

        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();
  }, [rideId]);

  /*
  ======================================
  Socket
  ======================================
  */

  useEffect(() => {
    socket.connect();

    registerSocketUser(localStorage.getItem("mongoUserId"));

    socket.emit("join-ride", rideId);

    const receiveMessage = (data) => {
      if (data.rideId !== rideId) return;

      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive-message", receiveMessage);

    return () => {
      socket.off("receive-message", receiveMessage);

      socket.emit("leave-ride", rideId);
    };
  }, [rideId]);

  /*
  ======================================
  Auto Scroll
  ======================================
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
  ======================================
  Send
  ======================================
  */

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      rideId,
      text,
    });

    setText("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Background */}

      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-[140px]" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-[140px]" />

      </div>

      {/* Header */}

      <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xl">

              <Car size={28} />

            </div>

            <div>

              <h1 className="text-2xl font-bold">
                Ride Chat
              </h1>

              <div className="mt-1 flex items-center gap-2">

                <Circle
                  size={10}
                  className="fill-green-500 text-green-500"
                />

                <span className="text-sm text-slate-400">
                  Connected
                </span>

              </div>

            </div>

          </div>

          <div className="rounded-xl bg-slate-900 px-4 py-2 text-xs text-slate-400 border border-slate-800">

            Ride #{rideId.slice(-6)}

          </div>

        </div>

      </div>

      {/* Chat */}

      <div className="mx-auto flex h-[calc(100vh-96px)] max-w-5xl flex-col">

        {/* Messages */}

        <div className="flex-1 overflow-y-auto px-6 py-8">

          {messages.length === 0 ? (

            <div className="mt-32 text-center">

              <Car
                size={60}
                className="mx-auto text-slate-700"
              />

              <h2 className="mt-6 text-2xl font-bold">
                No Messages Yet
              </h2>

              <p className="mt-2 text-slate-400">

                Start chatting with your driver.

              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {messages.map((msg, index) => {

                const mine =
                  (msg.sender || msg.senderId) ===
                  localStorage.getItem("mongoUserId");

                return (

                  <div
                    key={index}
                    className={`flex ${
                      mine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-sm rounded-3xl px-5 py-4 shadow-lg transition-all ${
                        mine
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                          : "border border-slate-700 bg-slate-900"
                      }`}
                    >

                      <p className="leading-7">
                        {msg.text}
                      </p>

                      <p className="mt-3 text-right text-xs opacity-70">

                        {new Date(
                          msg.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                      </p>

                    </div>

                  </div>

                );

              })}

              <div ref={messagesEndRef} />

            </div>

          )}

        </div>

        {/* Input */}

        <div className="border-t border-slate-800 bg-slate-900/70 p-5 backdrop-blur-xl">

          <div className="flex items-center gap-4">

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 outline-none transition-all focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-4 font-semibold transition-all hover:scale-105"
            >

              <Send size={18} />

              Send

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}