
import React, { ReactNode } from "react";
import { DirectSettingsProvider, useSettings } from "./DirectSettingsProvider";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  return <DirectSettingsProvider>{children}</DirectSettingsProvider>;
};

export { useSettings };
