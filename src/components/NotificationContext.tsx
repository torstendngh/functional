import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef, // Import useRef
} from "react";
import { createPortal } from "react-dom";
import WarningIcon from "../icons/WarningIcon";
import CheckIcon from "../icons/CheckIcon";

export type NotificationType = "success" | "warning";

// Add status for animation handling
export type NotificationStatus = "entering" | "visible" | "closing";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: React.ReactNode;
  duration?: number;
  status: NotificationStatus; // Add status
}

interface NotificationContextValue {
  addNotification: (item: Omit<NotificationItem, "id" | "status">) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx.addNotification;
};

// Default duration and animation time
const DEFAULT_DURATION = 5000;
const ANIMATION_DURATION = 300; // ms - match this with Tailwind duration class (e.g., duration-300)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  // Use refs to manage timers to prevent issues with stale closures in setTimeouts
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const closingTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Function to actually remove the notification from state
  const removeNotification = useCallback((id: string) => {
    setNotifications((cur) => cur.filter((n) => n.id !== id));
    // Clean up timer refs
    delete timersRef.current[id];
    delete closingTimersRef.current[id];
  }, []);

  // Function to initiate the closing animation
  const startClosingNotification = useCallback(
    (id: string) => {
      setNotifications((cur) =>
        cur.map((n) => (n.id === id ? { ...n, status: "closing" } : n))
      );
      // Set a timer to remove the notification after the animation completes
      closingTimersRef.current[id] = setTimeout(() => {
        removeNotification(id);
      }, ANIMATION_DURATION);
    },
    [removeNotification] // Include removeNotification dependency
  );

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "status">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newItem: NotificationItem = {
        ...item,
        id,
        status: "entering", // Start as entering
      };

      // Add the notification
      setNotifications((cur) => [...cur, newItem]);

      // --- Animation Handling ---

      // 1. Transition to 'visible' state shortly after adding
      //    This allows the initial 'entering' styles to be applied first
      setTimeout(() => {
        setNotifications((cur) =>
          cur.map((n) =>
            n.id === id ? { ...n, status: "visible" } : n
          )
        );
      }, 50); // Small delay to ensure initial render with 'entering' styles

      // 2. Set timer to start the closing process
      const duration = item.duration ?? DEFAULT_DURATION;
      // Clear any existing timers for this ID just in case
      clearTimeout(timersRef.current[id]);
      clearTimeout(closingTimersRef.current[id]);

      timersRef.current[id] = setTimeout(() => {
        startClosingNotification(id);
      }, duration);
    },
    [startClosingNotification] // Include startClosingNotification dependency
  );

   // Cleanup timers on unmount
   useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      Object.values(closingTimersRef.current).forEach(clearTimeout);
    };
  }, []);


  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}

      {createPortal(
        <div className="fixed top-0 left-0 right-0 flex flex-col items-center gap-2 p-4 pointer-events-none z-50">
          {/* Ensure the container has enough space */}
          {notifications.map(({ id, type, message, status }) => {
            const isSuccess = type === "success";
            const bg = isSuccess ? "bg-emerald-100" : "bg-yellow-100";
            const border = isSuccess
              ? "border-emerald-400"
              : "border-yellow-400";
            const text = isSuccess ? "text-emerald-600" : "text-yellow-600";
            const Icon = isSuccess ? CheckIcon : WarningIcon;

            // Define base transition classes
            const transitionClasses = `transition-all ease-in-out duration-${ANIMATION_DURATION}`;

            // Define state-specific transform and opacity classes
            let stateClasses = "";
            switch (status) {
              case "entering":
                stateClasses = "opacity-0 translate-y-[-20px]"; // Start invisible and shifted up
                break;
              case "visible":
                stateClasses = "opacity-100 translate-y-0"; // Fully visible and in position
                break;
              case "closing":
                stateClasses = "opacity-0 translate-y-[-20px]"; // Fade out and shift up
                break;
            }

            return (
              <div
                key={id}
                className={`${bg} ${border} ${text} ${transitionClasses} ${stateClasses} border px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-auto font-semibold max-w-md mx-auto`}
              >
                <Icon className="flex-shrink-0"/>
                <span>{message}</span>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};