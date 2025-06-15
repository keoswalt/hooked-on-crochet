
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PreviousPageInfo {
  label: string;
  path: string;
}
interface NavigationContextType {
  previousPage: PreviousPageInfo | null;
  setPreviousPage: (info: PreviousPageInfo | null) => void;
}
const NavigationContext = createContext<NavigationContextType>({
  previousPage: null,
  setPreviousPage: () => {},
});

const NAVIGATION_KEY = "crochet-navigation-prev-page";

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [previousPage, setPreviousPage] = useState<PreviousPageInfo | null>(null);

  useEffect(() => {
    // On mount, hydrate from sessionStorage
    const data = sessionStorage.getItem(NAVIGATION_KEY);
    if (data) {
      setPreviousPage(JSON.parse(data));
    }
  }, []);

  const updatePreviousPage = (info: PreviousPageInfo | null) => {
    setPreviousPage(info);
    if (info) sessionStorage.setItem(NAVIGATION_KEY, JSON.stringify(info));
    else sessionStorage.removeItem(NAVIGATION_KEY);
  };

  return (
    <NavigationContext.Provider value={{ previousPage, setPreviousPage: updatePreviousPage }}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigationContext() {
  return useContext(NavigationContext);
}
