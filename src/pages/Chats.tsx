import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket, disconnectSocket } from '../services/socket';
import type { BuyerProfile } from '../types/api';

// ==========================================
// CUSTOM SLEEK SVG ICONS (INLINE COMPONENT)
// ==========================================
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  ),
  Package: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  ShoppingCart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  History: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.25.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.773-.56-.374-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  User: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
};

interface Message {
  _id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  createdAt: string;
}

export default function Chats() {
  const { user } = useAuth();

  // Profile metadata for bottom-left display (GCS photo)
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  // Contacts and active conversation states
  const [contactIds, setContactIds] = useState<string[]>([]);
  const [buyerProfiles, setBuyerProfiles] = useState<Record<string, BuyerProfile>>({});
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  
  // Stores real message histories per buyer ID for last message previews
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});

  // Loading & Viewport states
  const [loadingContacts, setLoadingContacts] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeToast, setActiveToast] = useState<{ senderName: string; message: string } | null>(null);
  const selectedBuyerIdRef = useRef<number | null>(null);

  // Sync selectedBuyerId to ref to avoid stale closures in socket callback
  useEffect(() => {
    selectedBuyerIdRef.current = selectedBuyerId;
  }, [selectedBuyerId]);

  // Load and manage client-side read messages to bypass missing backend read endpoint
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`read_msg_ids_${user?.id || 0}`);
      return stored ? new Set(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Helper to mark messages of a buyer as read in localStorage and state
  const markMessagesAsReadLocally = (msgs: Message[]) => {
    if (msgs.length === 0) return;
    setReadMessageIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      msgs.forEach((m) => {
        if (m.sender_id.startsWith('buyer_') && !next.has(m._id)) {
          next.add(m._id);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(`read_msg_ids_${user?.id || 0}`, JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Fetch traveler profile photo link
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user?.id) return;
      try {
        const profileRes = await api.get(`/api/travelers/${user.id}`);
        if (profileRes.data.status === 'success') {
          setProfilePhoto(profileRes.data.data.profile_photo || '');
        }
      } catch (err) {
        console.warn('Failed to fetch profile details.', err);
      }
    };
    fetchProfilePhoto();
  }, [user]);

  // Fetch chat contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await api.get('/api/chats/contacts');
        const ids = res.data.data || [];
        
        if (ids.length === 0) {
          setContactIds([]);
          setBuyerProfiles({});
          setMessagesMap({});
        } else {
          setContactIds(ids);

          // Fetch buyer profiles and message histories in parallel for each contact ID
          const profilesMap: Record<string, BuyerProfile> = {};
          const msgMap: Record<string, Message[]> = {};
          await Promise.all(
            ids.map(async (id: string) => {
              try {
                // Fetch profile
                const buyerRes = await api.get(`/api/buyers/${id}`);
                if (buyerRes.data.status === 'success' || buyerRes.data.data) {
                  profilesMap[id] = buyerRes.data.data;
                }
              } catch (buyerErr) {
                console.error(`Failed to fetch buyer details for ID ${id}`, buyerErr);
              }

              try {
                // Fetch messages history
                const msgRes = await api.get(`/api/chats/messages?with_user_id=${id}`);
                if (msgRes.data.data) {
                  msgMap[id] = msgRes.data.data;
                }
              } catch (msgErr) {
                console.error(`Failed to fetch messages history for ID ${id}`, msgErr);
              }
            })
          );
          setBuyerProfiles(profilesMap);
          setMessagesMap(msgMap);
        }
      } catch (err) {
        console.warn('API error loading chat contacts:', err);
        setContactIds([]);
        setBuyerProfiles({});
        setMessagesMap({});
      } finally {
        setLoadingContacts(false);
      }
    };

    if (user?.id) {
      fetchContacts();
    }
  }, [user]);

  // Fetch messages for selected contact
  const fetchMessages = async (buyerId: number, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const res = await api.get(`/api/chats/messages?with_user_id=${buyerId}`);
      if (res.data.data) {
        const fetchedMsgs = res.data.data || [];
        setMessages(fetchedMsgs);
        // Also update message history map so that the sidebar's preview stays instantly updated!
        setMessagesMap((prev) => ({
          ...prev,
          [buyerId.toString()]: fetchedMsgs
        }));
        // Mark these messages as read in localStorage
        markMessagesAsReadLocally(fetchedMsgs);
      }
    } catch (err) {
      console.warn(`Failed to load messages from backend with buyer ${buyerId}, fallback to empty:`, err);
      setMessages([]);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Trigger loading when selected buyer contact changes
  useEffect(() => {
    if (selectedBuyerId !== null) {
      fetchMessages(selectedBuyerId, false);
      
      // Mark all buyer-sent messages as read locally
      setMessagesMap((prev) => {
        const updated = { ...prev };
        const key = selectedBuyerId.toString();
        const conversation = updated[key] || [];

        // Persist to localStorage too!
        markMessagesAsReadLocally(conversation);

        if (updated[key]) {
          updated[key] = updated[key].map((msg) => {
            if (msg.sender_id.startsWith('buyer_')) {
              return { ...msg, is_read: true };
            }
            return msg;
          });
        }
        return updated;
      });

      // Trigger real background read API call if supported
      api.put(`/api/chats/read/${selectedBuyerId}`).catch(() => {});
    } else {
      setMessages([]);
    }
  }, [selectedBuyerId]);

  // WebSocket: Connect on mount, listen for incoming messages, disconnect on unmount
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    const handleConnect = () => {
      console.log('[Socket] Connected:', socket.id);
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('[Socket] Disconnected');
      setSocketConnected(false);
    };

    const handleReceiveMessage = (msg: Message) => {
      console.log('[Socket] receiveMessage:', msg);
      const activeId = selectedBuyerIdRef.current;
      const isFromActiveBuyer = msg.sender_id === `buyer_${activeId}`;
      const isToActiveBuyer = msg.receiver_id === `buyer_${activeId}`;

      // 1. Append message to the active conversation panel ONLY if it belongs to this active buyer conversation
      if (activeId !== null && (isFromActiveBuyer || isToActiveBuyer)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Dynamically mark as read in background if we are currently looking at the chat
        api.put(`/api/chats/read/${activeId}`).catch(() => {});
        // Also persist read locally!
        markMessagesAsReadLocally([msg]);
      }

      // 2. Identify the other participant's buyer ID string
      const buyerIdStr = msg.sender_id.startsWith('buyer_')
        ? msg.sender_id.split('_')[1]
        : msg.receiver_id.split('_')[1];

      if (buyerIdStr) {
        // Update the sidebar preview list map
        setMessagesMap((prev) => {
          const currentList = prev[buyerIdStr] || [];
          if (currentList.some((m) => m._id === msg._id)) return prev;
          return { ...prev, [buyerIdStr]: [...currentList, msg] };
        });

        // 3. DYNAMIC CONTACT REGISTRATION & RE-ORDERING: Move sender to the top of the sidebar list instantly!
        setContactIds((prev) => {
          const cleanId = String(buyerIdStr);
          const isNew = !prev.map(String).includes(cleanId);
          
          if (isNew) {
            // Fetch the brand new buyer profile dynamically in the background
            api.get(`/api/buyers/${cleanId}`).then((res) => {
              if (res.data.status === 'success' || res.data.data) {
                setBuyerProfiles((prevProfiles) => ({
                  ...prevProfiles,
                  [cleanId]: res.data.data
                }));
              }
            }).catch((err) => {
              console.warn(`Failed to fetch buyer details for new connection: ${cleanId}`, err);
            });
          }

          const filtered = prev.map(String).filter((x) => x !== cleanId);
          return [cleanId, ...filtered];
        });

        // 4. CHIME SOUND & PUSH TOAST NOTIFICATION
        const isFromMe = msg.sender_id.startsWith('traveler_');
        if (!isFromActiveBuyer && !isFromMe) {
          // Play premium Web Audio synthesized ping sound
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);

            osc.frequency.setValueAtTime(880, context.currentTime); // A5 note
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, context.currentTime + 0.05); // quick attack
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35); // smooth exponential decay

            osc.start();
            osc.stop(context.currentTime + 0.35);
          } catch (e) {
            // Audio context blocked by browser gesture policies
          }

          // Trigger sleek visually animatable notification toast
          const triggerToast = (senderName: string) => {
            setActiveToast({
              senderName,
              message: msg.message
            });

            // Auto dismiss toast after 4 seconds
            setTimeout(() => {
              setActiveToast((prev) => {
                if (prev?.message === msg.message) return null;
                return prev;
              });
            }, 4000);
          };

          const existingProfile = buyerProfiles[buyerIdStr];
          if (existingProfile) {
            triggerToast(existingProfile.name);
          } else {
            api.get(`/api/buyers/${buyerIdStr}`).then((res) => {
              const name = res.data.data?.name || `Buyer #${buyerIdStr}`;
              triggerToast(name);
            }).catch(() => {
              triggerToast(`Buyer #${buyerIdStr}`);
            });
          }
        }
      }
    };

    const handleMessageSent = (msg: Message) => {
      // Swap the optimistic temp message with the confirmed server message
      setMessages((prev) =>
        prev.map((m) => (m._id.startsWith('temp_') && m.message === msg.message ? msg : m))
      );
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageSent', handleMessageSent);

    // If already connected when effect runs
    if (socket.connected) setSocketConnected(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageSent', handleMessageSent);
      disconnectSocket();
    };
  }, [user]);

  // Failsafe Background Polling: Syncs contacts and messages in background every 8 seconds if WebSocket is offline
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(async () => {
      // Only execute this intensive fallback polling if WebSocket is NOT connected!
      if (!socketConnected) {
        console.log('[Fallback Polling] Syncing chat data in background...');
        try {
          const res = await api.get('/api/chats/contacts');
          const ids: string[] = res.data.data || [];

          if (ids.length > 0) {
            const cleanIds = ids.map(String);
            
            // Sync in parallel for all contacts
            await Promise.all(
              cleanIds.map(async (id) => {
                try {
                  const msgRes = await api.get(`/api/chats/messages?with_user_id=${id}`);
                  const fetchedMsgs: Message[] = msgRes.data.data || [];

                  // Compare if messages changed
                  setMessagesMap((prev) => {
                    const localMsgs = prev[id] || [];
                    
                    const hasChanged = localMsgs.length !== fetchedMsgs.length || 
                      (localMsgs.length > 0 && fetchedMsgs.length > 0 && 
                       localMsgs[localMsgs.length - 1]._id !== fetchedMsgs[fetchedMsgs.length - 1]._id);

                    if (hasChanged) {
                      // If it's the currently active chat, update active messages panel too!
                      if (selectedBuyerIdRef.current === Number(id)) {
                        setMessages(fetchedMsgs);
                        // Mark active chat messages as read in localStorage!
                        markMessagesAsReadLocally(fetchedMsgs);
                      }
                      
                      // Also trigger Toast/Chime if there's a new unread message not sent by traveler
                      if (fetchedMsgs.length > 0) {
                        const newMsg = fetchedMsgs[fetchedMsgs.length - 1];
                        const isFromMe = newMsg.sender_id.startsWith('traveler_');
                        const isFromActive = selectedBuyerIdRef.current === Number(id);

                        if (!isFromMe && !isFromActive) {
                          const alreadyProcessed = localMsgs.some((m) => m._id === newMsg._id);
                          if (!alreadyProcessed) {
                            // Synthesize Audio Chime
                            try {
                              const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                              const osc = context.createOscillator();
                              const gain = context.createGain();
                              osc.connect(gain);
                              gain.connect(context.destination);
                              osc.frequency.setValueAtTime(880, context.currentTime);
                              gain.gain.setValueAtTime(0, context.currentTime);
                              gain.gain.linearRampToValueAtTime(0.06, context.currentTime + 0.05);
                              gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
                              osc.start();
                              osc.stop(context.currentTime + 0.35);
                            } catch (e) {}

                            // Display Toast
                            const existingProfile = buyerProfiles[id];
                            const name = existingProfile?.name || `Buyer #${id}`;
                            setActiveToast({
                              senderName: name,
                              message: newMsg.message
                            });
                            
                            setTimeout(() => {
                              setActiveToast((prev) => (prev?.message === newMsg.message ? null : prev));
                            }, 4000);
                          }
                        }
                      }

                      return { ...prev, [id]: fetchedMsgs };
                    }
                    return prev;
                  });

                  // Fetch profile if it's a new contact not yet in buyerProfiles
                  if (!buyerProfiles[id]) {
                    const buyerRes = await api.get(`/api/buyers/${id}`);
                    if (buyerRes.data.status === 'success' || buyerRes.data.data) {
                      setBuyerProfiles((prevProfiles) => ({
                        ...prevProfiles,
                        [id]: buyerRes.data.data
                      }));
                    }
                  }

                } catch (err) {
                  console.warn(`[Fallback Polling] Error syncing for contact ID ${id}`, err);
                }
              })
            );

            // Update contactIds array if new contacts arrived or order changed
            setContactIds((prev) => {
              const prevClean = prev.map(String);
              const isDiff = prevClean.length !== cleanIds.length || prevClean.some((v, i) => v !== cleanIds[i]);
              if (isDiff) {
                return cleanIds;
              }
              return prev;
            });
          }
        } catch (err) {
          console.warn('[Fallback Polling] Error syncing contacts:', err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [socketConnected, buyerProfiles]);

  // Auto-scroll messages list to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message via socket.io (real-time)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyerId || !inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    // Optimistic append
    const optimisticMsg: Message = {
      _id: `temp_${Date.now()}`,
      sender_id: `traveler_${user?.id || 0}`,
      receiver_id: `buyer_${selectedBuyerId}`,
      message: messageText,
      is_read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Also update sidebar preview immediately
    setMessagesMap((prev) => {
      const currentList = prev[selectedBuyerId.toString()] || [];
      return { ...prev, [selectedBuyerId.toString()]: [...currentList, optimisticMsg] };
    });

    // Move current contact to the top of the contact list instantly
    setContactIds((prev) => {
      const cleanId = selectedBuyerId.toString();
      const filtered = prev.map(String).filter((x) => x !== cleanId);
      return [cleanId, ...filtered];
    });

    if (socketConnected) {
      const socket = getSocket();
      socket.emit('sendMessage', { receiverId: selectedBuyerId, message: messageText });
    } else {
      // Failsafe REST HTTP POST Fallback if WebSocket is offline!
      try {
        const res = await api.post('/api/chats', { receiver_id: selectedBuyerId, message: messageText });
        if (res.data.data) {
          const confirmedMsg = res.data.data;
          
          // Swap the optimistic temp message with the confirmed server message
          setMessages((prev) =>
            prev.map((m) => (m._id.startsWith('temp_') && m.message === messageText ? confirmedMsg : m))
          );
          
          setMessagesMap((prev) => {
            const currentList = prev[selectedBuyerId.toString()] || [];
            const updated = currentList.map((m) =>
              m._id.startsWith('temp_') && m.message === messageText ? confirmedMsg : m
            );
            return { ...prev, [selectedBuyerId.toString()]: updated };
          });
        }
      } catch (err) {
        console.error('[HTTP Fallback] Failed to send message:', err);
      }
    }
  };

  const activeBuyer = selectedBuyerId !== null ? buyerProfiles[selectedBuyerId.toString()] : null;

  const renderSidebarLinks = () => (
    <nav className="space-y-1 mt-4">
      <Link to="/dashboard" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Dashboard />
        <span>Dashboard</span>
      </Link>
      <Link to="/catalogue" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Package />
        <span>My Catalogue</span>
      </Link>
      <Link to="/orders" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.ShoppingCart />
        <span>Orders</span>
      </Link>
      <Link to="/sales-history" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.History />
        <span>Sales History</span>
      </Link>
      <Link to="/reviews" className="text-white hover:bg-white/10 px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-medium">
        <Icons.Star />
        <span>My Reviews</span>
      </Link>
      <Link to="/chats" className="bg-white text-[#1e53e6] px-4 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm font-semibold shadow-sm">
        <Icons.Chat />
        <span>Chats</span>
      </Link>
    </nav>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      
      {/* ==========================================
         A. SIDEBAR NAVIGATION (ROYAL BLUE)
         ========================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e53e6] text-white shrink-0 justify-between p-4 shadow-xl">
        <div>
          {/* Logo */}
          <div className="px-2 py-4">
            <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Nitipin</h1>
            <p className="text-xs text-blue-200/80 mt-1 font-medium">Traveler Dashboard</p>
            <hr className="border-white/10 mt-4" />
          </div>

          {/* Links */}
          {renderSidebarLinks()}
        </div>

        {/* User Card */}
        <Link 
          to="/profile" 
          className="bg-white/10 rounded-xl p-3.5 mx-1 flex items-center gap-3 border border-white/5 shrink-0 hover:bg-white/15 hover:scale-[1.01] transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden flex items-center justify-center shrink-0 bg-white/10 text-white">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Icons.User />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm leading-none text-white truncate">
              {user?.name || 'Sarah'}
            </h4>
            <p className="text-blue-200/80 text-[11px] mt-1 truncate">
              {user?.email || 'sarah@email.com'}
            </p>
          </div>
        </Link>
      </aside>

      {/* ==========================================
         B. MOBILE SIDEBAR OVERLAY
         ========================================== */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowMobileSidebar(false)} />
          
          <aside className="relative flex flex-col w-64 bg-[#1e53e6] text-white p-4 shadow-2xl animate-slide-right h-full justify-between shrink-0">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white"
            >
              <Icons.Close />
            </button>

            <div>
              {/* Logo */}
              <div className="px-2 py-4">
                <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Nitipin</h1>
                <p className="text-xs text-blue-200/80 mt-1 font-medium">Traveler Dashboard</p>
                <hr className="border-white/10 mt-4" />
              </div>

              {/* Links */}
              {renderSidebarLinks()}
            </div>

            {/* User Card */}
            <Link 
              to="/profile" 
              onClick={() => setShowMobileSidebar(false)}
              className="bg-white/10 rounded-xl p-3.5 flex items-center gap-3 border border-white/5 cursor-pointer hover:bg-white/15 transition-all"
            >
              <div className="w-9 h-9 rounded-full border border-white/20 overflow-hidden flex items-center justify-center shrink-0 bg-white/10 text-white">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Icons.User />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm leading-none text-white truncate">
                  {user?.name || 'Sarah'}
                </h4>
                <p className="text-blue-200/80 text-[11px] mt-1 truncate">
                  {user?.email || 'sarah@email.com'}
                </p>
              </div>
            </Link>
          </aside>
        </div>
      )}

      {/* ==========================================
         C. MAIN DASHBOARD CONTENT AREA
         ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-150 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 transition duration-150 cursor-pointer"
          >
            <Icons.Menu />
          </button>
          <span className="font-semibold text-[#1e53e6] text-lg tracking-tight">Nitipin</span>
          <div className="w-8 h-8 rounded-full bg-[#1e53e6]/10 text-[#1e53e6] flex items-center justify-center font-semibold text-xs">
            {user?.name?.[0].toUpperCase() || 'S'}
          </div>
        </header>

        {/* Outer Split Pane Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 1. Chats Contacts Column (Left Pane) */}
          <div className="w-full md:w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-semibold text-[#1e53e6]">Chats</h2>
              <p className="text-xs text-gray-400 mt-1">Talk with your buyers</p>
            </div>

            {/* Contacts list container */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loadingContacts ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-slate-100 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contactIds.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-semibold text-gray-400">No active chats</p>
                  <p className="text-xs text-gray-300 mt-1">Complete catalog orders to interact with buyers</p>
                </div>
              ) : (() => {
                // Sort contact IDs dynamically by newest message timestamp
                const getContactLastTimestamp = (cid: string) => {
                  const conversation = messagesMap[cid];
                  if (conversation && conversation.length > 0) {
                    const lastMsg = conversation[conversation.length - 1];
                    return new Date(lastMsg.createdAt).getTime();
                  }
                  return 0;
                };

                const sortedContactIds = [...contactIds].sort((a, b) => {
                  return getContactLastTimestamp(b) - getContactLastTimestamp(a);
                });

                return sortedContactIds.map((id) => {
                  const profile = buyerProfiles[id];
                  const isActive = selectedBuyerId === Number(id);
                  const conversation = messagesMap[id];

                  // Calculate unread count dynamically (only buyer-sent unread messages, filtered by local readMessageIds)
                  const unreadCount = conversation
                    ? conversation.filter((msg) => 
                        msg.sender_id.startsWith('buyer_') && 
                        !msg.is_read && 
                        !readMessageIds.has(msg._id)
                      ).length
                    : 0;
                  
                  // Retrieve the last message dynamically
                  const lastMsg = conversation && conversation.length > 0 ? conversation[conversation.length - 1] : null;
                  const lastMsgText = lastMsg ? lastMsg.message : 'No messages yet';

                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedBuyerId(Number(id))}
                      className={`w-full p-4 flex items-center gap-3 transition-all text-left border-l-[5px] cursor-pointer ${
                        isActive 
                          ? 'bg-blue-50/90 border-[#1e53e6] shadow-sm shadow-[#1e53e6]/5' 
                          : 'bg-white border-transparent hover:bg-slate-50/70 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border flex items-center justify-center font-semibold transition-all ${
                        isActive 
                          ? 'border-[#1e53e6]/30 bg-blue-100 text-[#1e53e6] scale-105 shadow-sm' 
                          : 'border-slate-100 bg-slate-50 text-gray-600'
                      }`}>
                        {profile?.profile_photo ? (
                          <img src={profile.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          profile?.name?.[0].toUpperCase() || 'B'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm truncate transition-colors ${
                            unreadCount > 0 
                              ? 'font-semibold text-[#1e53e6]' 
                              : isActive 
                                ? 'font-semibold text-gray-900' 
                                : 'font-normal text-gray-700'
                          }`}>
                            {profile?.name || `Buyer #${id}`}
                          </h4>
                          {unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-semibold text-[10px] flex items-center justify-center shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${
                          unreadCount > 0 
                            ? 'font-normal text-gray-800' 
                            : isActive 
                              ? 'text-gray-500 font-normal' 
                              : 'text-gray-400 font-normal'
                        }`}>
                          {lastMsgText}
                        </p>
                      </div>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* 2. Messages Chat Window Area (Right Pane) */}
          <div className="hidden md:flex flex-1 bg-slate-50 flex-col overflow-hidden">
            {selectedBuyerId === null ? (
              // Empty Slate
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center text-[#1e53e6] shadow-sm mb-4">
                  <Icons.Chat />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">No Chat Selected</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Select a buyer contact on the left column to start exchanging messages in real-time.
                </p>
              </div>
            ) : (
              // Active Conversation panel
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active contact bar */}
                <div className="h-16 bg-white border-b border-gray-150 flex items-center px-6 justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center bg-blue-50 text-[#1e53e6] font-semibold text-sm">
                      {activeBuyer?.profile_photo ? (
                        <img src={activeBuyer.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        activeBuyer?.name?.[0].toUpperCase() || 'B'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 leading-none truncate">
                        {activeBuyer?.name || `Buyer #${selectedBuyerId}`}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-normal mt-1 inline-block leading-none">
                        Buyer Account
                      </span>
                    </div>
                  </div>
                  {/* Socket connection status indicator */}
                  {socketConnected && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-gray-400 font-normal">
                        Live
                      </span>
                    </div>
                  )}
                </div>

                {/* Messages Box scrollable list */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingMessages ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                        <div className="h-10 bg-slate-200 rounded-2xl w-48 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2 max-w-xs justify-end ml-auto">
                        <div className="h-10 bg-slate-200 rounded-2xl w-36 animate-pulse" />
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm font-semibold text-gray-400">No conversation yet</p>
                      <p className="text-xs text-gray-300 mt-1">Send your first message below!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOutgoing = msg.sender_id.startsWith('traveler');
                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 max-w-[75%] ${
                            isOutgoing ? 'ml-auto flex-row-reverse' : ''
                          }`}
                        >
                          {/* Speech Bubble */}
                          <div className="space-y-1">
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm font-normal shadow-sm leading-relaxed transition-all duration-200 ${
                                isOutgoing
                                  ? 'bg-[#1e53e6] text-white rounded-tr-none shadow-blue-600/10'
                                  : 'bg-white text-gray-800 border border-slate-150 rounded-tl-none'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span 
                              className={`text-[9px] font-normal text-gray-400 block px-1 ${
                                isOutgoing ? 'text-right' : ''
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat message input form */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 bg-white border-t border-gray-150 shrink-0 flex items-center gap-3 shadow-md"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400 text-gray-900 bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-10 h-10 rounded-xl bg-[#1e53e6] hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shrink-0 transition disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    <Icons.Send />
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Real-time Chime Notification Toast */}
      {activeToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-2xl shadow-blue-500/15 w-80 transition duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1e53e6] flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100 shadow-inner">
            {activeToast.senderName[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider leading-none">New Message</h5>
            <h4 className="font-bold text-sm text-gray-900 truncate mt-1">{activeToast.senderName}</h4>
            <p className="text-xs text-gray-600 truncate mt-0.5 font-normal leading-normal">{activeToast.message}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer self-start p-0.5"
          >
            <Icons.Close />
          </button>
        </div>
      )}

    </div>
  );
}
