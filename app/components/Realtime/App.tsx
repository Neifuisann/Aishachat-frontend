"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// UI components
import BottomToolbar from "./components/BottomToolbar";

// Types
import { AgentConfig, SessionStatus } from "@/app/components/Realtime/types";

// Context providers & hooks
import { useTranscript } from "@/app/components/Realtime/contexts/TranscriptContext";
import { useEvent } from "@/app/components/Realtime/contexts/EventContext";
import { useHandleServerEvent } from "./hooks/useHandleServerEvent";

// Utilities
import { createGeminiConnection, sendAudioToGemini, convertAudioToPCM } from "./lib/realtimeConnection";
import { Session } from '@google/genai';
import { toast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Transcript from "./components/Transcript";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { getPersonalityById } from "@/db/personalities";
import { createClient } from "@/utils/supabase/client";

interface AppProps {
  personalityIdState: string;
  isDoctor: boolean;
  userId: string;
}

function App({ personalityIdState, isDoctor, userId }: AppProps) {
  const supabase = createClient();

  const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } =
    useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] =
    useState<AgentConfig[] | null>(null);

    const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
    const [userText, setUserText] = useState<string>("");

  const isMobile = useMediaQuery("(max-width: 768px)");

  const [personality, setPersonality] = useState<IPersonality | null>(null);

  useEffect(() => {
    const fetchPersonality = async () => {
      if (personalityIdState) {
        const personalityData = await getPersonalityById(supabase, personalityIdState);
        setPersonality(personalityData);
      }
    };

    fetchPersonality();
  }, [personalityIdState, supabase]);


  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const geminiSessionRef = useRef<Session | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("DISCONNECTED");

  const [isEventsPaneExpanded, setIsEventsPaneExpanded] =
    useState<boolean>(true);
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] =
    useState<boolean>(true);

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    if (geminiSessionRef.current) {
      logClientEvent(eventObj, eventNameSuffix);

      // Convert OpenAI-style events to Gemini format
      if (eventObj.type === "conversation.item.create" && eventObj.item?.content) {
        const textContent = eventObj.item.content.find((c: any) => c.type === "input_text");
        if (textContent) {
          geminiSessionRef.current.sendClientContent({
            turns: [{
              role: "user",
              parts: [{ text: textContent.text }]
            }],
            turnComplete: true
          });
        }
      } else if (eventObj.type === "response.create") {
        // Gemini automatically responds, no need to explicitly trigger
        console.log("Response creation triggered for Gemini");
      }
    } else {
      logClientEvent(
        { attemptedEvent: eventObj.type },
        "error.gemini_session_not_available"
      );
      console.error(
        "Failed to send message - no Gemini session available",
        eventObj
      );
    }
  };

  const handleServerEventRef = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName,
    selectedAgentConfigSet,
    sendClientEvent,
    setSelectedAgentName,
  });

  useEffect(() => {
    if (selectedAgentName && sessionStatus === "DISCONNECTED") {
      connectToRealtime();
    }
  }, [selectedAgentName]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession(true);
    }
  }, [sessionStatus]);

  const fetchGeminiConfig = async (): Promise<any | null> => {
    logClientEvent({ url: "/session" }, "fetch_gemini_config_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    logServerEvent(data, "fetch_gemini_config_response");

    if (!data.apiKey) {
      logClientEvent(data, "error.no_gemini_api_key");
      setSessionStatus("DISCONNECTED");
      toast({
        description: "Your Gemini API key is invalid. Please update it in Settings.",
      });
      return null;
    }

    return data;
  };

  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const geminiConfig = await fetchGeminiConfig();
      if (!geminiConfig) {
        return;
      }

      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement("audio");
      }
      audioElementRef.current.autoplay = isAudioPlaybackEnabled;

      const { session, mediaStream } = await createGeminiConnection(
        geminiConfig,
        audioElementRef,
        (message: any) => {
          handleServerEventRef.current(message);
        },
        (error: any) => {
          console.error("Gemini connection error:", error);
          setSessionStatus("DISCONNECTED");
        }
      );

      geminiSessionRef.current = session;
      mediaStreamRef.current = mediaStream;
      setSessionStatus("CONNECTED");

      logClientEvent({}, "gemini_session.connected");
    } catch (err) {
      console.error("Error connecting to Gemini:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromRealtime = () => {
    if (geminiSessionRef.current) {
      geminiSessionRef.current.close();
      geminiSessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setSessionStatus("DISCONNECTED");

    logClientEvent({}, "disconnected");
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          id,
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      },
      "(simulated user text message)"
    );
    sendClientEvent(
      { type: "response.create" },
      "(trigger response after simulated user text message)"
    );
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    // Gemini Live API doesn't require session updates like OpenAI
    // Configuration is set during connection
    console.log("Session update requested for Gemini (no action needed)");

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage(isDoctor ? "Ask the doctor if everything is good and how you can help them and their patient." : "The user is initiating a new chat here. Say something!");
    }
  };

  const onToggleConnection = () => {
    // Only connect if we're disconnected
    if (sessionStatus === "DISCONNECTED") {
      connectToRealtime();
      setIsSheetOpen(true);
    } else {
      // If already connected or connecting, disconnect
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
      setIsSheetOpen(false);
    }
  };

  const cancelAssistantSpeech = async () => {
    const mostRecentAssistantMessage = [...transcriptItems]
      .reverse()
      .find((item) => item.role === "assistant");

    if (!mostRecentAssistantMessage) {
      console.warn("can't cancel, no recent assistant message found");
      return;
    }
    if (mostRecentAssistantMessage.status === "DONE") {
      console.log("No truncation needed, message is DONE");
      return;
    }

    // For Gemini, we can interrupt by sending new input
    // The Live API handles interruptions automatically
    console.log("Interrupting Gemini response (handled automatically by Live API)");
  };

  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    cancelAssistantSpeech();

    sendClientEvent(
      {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: userText.trim() }],
        },
      },
      "(send user text message)"
    );
    setUserText("");

    sendClientEvent({ type: "response.create" }, "trigger response");
  };

  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === "true");
    }
    const storedLogsExpanded = localStorage.getItem("logsExpanded");
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === "true");
    }
    const storedAudioPlaybackEnabled = localStorage.getItem(
      "audioPlaybackEnabled"
    );
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("logsExpanded", isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  useEffect(() => {
    localStorage.setItem(
      "audioPlaybackEnabled",
      isAudioPlaybackEnabled.toString()
    );
  }, [isAudioPlaybackEnabled]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch((err) => {
          console.warn("Autoplay may be blocked by browser:", err);
        });
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);

    // If sheet is closed, disconnect
    if (!open && (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING")) {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    }
  };

  if (!personality) {
    return null;
  }

  return   <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
    <div className="inline-block">
       <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isDoctor={isDoctor}
      />
    </div>
  <SheetContent
    side={isMobile ? "bottom" : "right"}
    className="h-[80vh] md:h-full p-0"
    style={{ maxWidth: isMobile ? "100%" : "50%" }}
  >
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Transcript
          userText={userText}
          setUserText={setUserText}
          onSendMessage={handleSendTextMessage}
          canSend={
            sessionStatus === "CONNECTED" &&
            geminiSessionRef.current !== null
          }
          personality={personality}
          userId={userId}
          isDoctor={isDoctor}
          supabase={supabase}
        />
      </div>
    </div>
  </SheetContent>
</Sheet>
}

export default App;
