import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMER_KEY = "TIMER_KEY";
const INITIAL_TIME = 60;

interface TimerContextType {
  timeLeft: number;
  resetTimer: () => void;
  onTimerEnd: (callback: () => void) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const timerEndCallbacks = useRef<(() => void)[]>([]);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const loadTimer = async () => {
      try {
        const storedTime = await AsyncStorage.getItem(TIMER_KEY);
        if (storedTime !== null) {
          const currentTime = Math.floor(Date.now() / 1000);
          const savedTime = JSON.parse(storedTime);
          const elapsed = currentTime - savedTime.timestamp;
          const remainingTime = savedTime.timeLeft - elapsed;
          setTimeLeft(remainingTime > 0 ? remainingTime : INITIAL_TIME);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadTimer();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = prevTimeLeft > 0 ? prevTimeLeft - 1 : 0;
        if (newTimeLeft === 0) {
          console.log("Timer reached zero, executing callbacks");
          timerEndCallbacks.current.forEach((callback) => callback());
          setTimeLeft(INITIAL_TIME);
        }
        saveTimer(newTimeLeft);
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        const loadTimer = async () => {
          try {
            const storedTime = await AsyncStorage.getItem(TIMER_KEY);
            if (storedTime !== null) {
              const currentTime = Math.floor(Date.now() / 1000);
              const savedTime = JSON.parse(storedTime);
              const elapsed = currentTime - savedTime.timestamp;
              const remainingTime = savedTime.timeLeft - elapsed;
              setTimeLeft(remainingTime > 0 ? remainingTime : INITIAL_TIME);
            }
          } catch (e) {
            console.error(e);
          }
        };
        loadTimer();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const saveTimer = async (timeLeft: number) => {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const timerData = {
        timeLeft,
        timestamp: currentTime,
      };
      await AsyncStorage.setItem(TIMER_KEY, JSON.stringify(timerData));
    } catch (e) {
      console.error(e);
    }
  };

  const resetTimer = () => {
    setTimeLeft(INITIAL_TIME);
  };

  const onTimerEnd = useCallback((callback: () => void) => {
    console.log("Registering timer end callback");
    timerEndCallbacks.current.push(callback);
    return () => {
      console.log("Cleaning up timer end callback");
      timerEndCallbacks.current = timerEndCallbacks.current.filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  return (
    <TimerContext.Provider value={{ timeLeft, resetTimer, onTimerEnd }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
