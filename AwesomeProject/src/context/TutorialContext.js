import React, { createContext, useContext, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TutorialContext = createContext();

export const useTutorial = () => useContext(TutorialContext);

const TUTORIAL_STORAGE_KEY = 'tutorial_completed_v1';

export const TutorialProvider = ({ children }) => {
  const refs = useRef({});
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const registerRef = (key, ref) => {
    if (ref) refs.current[key] = ref;
  };

  const getRef = key => refs.current[key];

  const startTutorial = () => {
    setTutorialStep(0);
    setTutorialActive(true);
  };

  const endTutorial = async () => {
    setTutorialActive(false);
    try {
      await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch (_) {}
  };

  const checkAndStartTutorial = async () => {
    try {
      const done = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!done) startTutorial();
    } catch (_) {
      // silently skip if storage fails
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        tutorialActive,
        tutorialStep,
        setTutorialStep,
        registerRef,
        getRef,
        startTutorial,
        endTutorial,
        checkAndStartTutorial,
      }}>
      {children}
    </TutorialContext.Provider>
  );
};
