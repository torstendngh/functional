import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import WarningIcon from "../icons/WarningIcon";
import CheckIcon from "../icons/CheckIcon";

export type NotificationType = "success" | "warning";
export type NotificationStatus = "entering" | "visible" | "closing";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: React.ReactNode;
  duration?: number;
  status: NotificationStatus;
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

const DEFAULT_DURATION = 5000;
const ANIMATION_DURATION = 300;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const timersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const closingTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const removeNotification = useCallback((id: string) => {
    setNotifications((cur) => cur.filter((n) => n.id !== id));
    delete timersRef.current[id];
    delete closingTimersRef.current[id];
  }, []);

  const startClosingNotification = useCallback(
    (id: string) => {
      setNotifications((cur) =>
        cur.map((n) => (n.id === id ? { ...n, status: "closing" } : n))
      );
      closingTimersRef.current[id] = setTimeout(() => {
        removeNotification(id);
      }, ANIMATION_DURATION);
    },
    [removeNotification]
  );

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "status">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newItem: NotificationItem = {
        ...item,
        id,
        status: "entering",
      };

      setNotifications((cur) => [...cur, newItem]);

      setTimeout(() => {
        setNotifications((cur) =>
          cur.map((n) =>
            n.id === id ? { ...n, status: "visible" } : n
          )
        );
      }, 50);

      const duration = item.duration ?? DEFAULT_DURATION;
      clearTimeout(timersRef.current[id]);
      clearTimeout(closingTimersRef.current[id]);

      timersRef.current[id] = setTimeout(() => {
        startClosingNotification(id);
      }, duration);
    },
    [startClosingNotification]
  );

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
          {notifications.map(({ id, type, message, status }) => {
            const isSuccess = type === "success";
            const bg = isSuccess ? "bg-emerald-100" : "bg-yellow-100";
            const border = isSuccess
              ? "border-emerald-400"
              : "border-yellow-400";
            const text = isSuccess ? "text-emerald-600" : "text-yellow-600";
            const Icon = isSuccess ? CheckIcon : WarningIcon;

            const transitionClasses = `transition-all ease-in-out duration-${ANIMATION_DURATION}`;

            let stateClasses = "";
            switch (status) {
              case "entering":
                stateClasses = "opacity-0 translate-y-[-20px]";
                break;
              case "visible":
                stateClasses = "opacity-100 translate-y-0";
                break;
              case "closing":
                stateClasses = "opacity-0 translate-y-[-20px]";
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