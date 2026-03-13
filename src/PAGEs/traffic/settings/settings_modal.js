import { useContext, useMemo, useState } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import Modal from "../../../BUILTIN_COMPONENTs/modal/modal";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import { AppearanceSettings } from "./appearance_settings";
import { GithubAuthSettings } from "./github_auth_settings";
import { LocalDataSettings } from "./local_data_settings";

const SETTINGS_PAGES = [
  { key: "appearance", icon: "color", label: "Appearance" },
  { key: "github", icon: "key", label: "GitHub Auth" },
  { key: "local_data", icon: "data", label: "Local Data" },
];

export const SettingsModal = ({
  open,
  onClose,
  pat,
  setPat,
  clearPat,
  user,
  setUser,
  selectedRepos,
  allTrafficData,
  onClearLocalData,
}) => {
  const { onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const [selectedPage, setSelectedPage] = useState("appearance");

  const activePage = useMemo(
    () => SETTINGS_PAGES.find((page) => page.key === selectedPage) || SETTINGS_PAGES[0],
    [selectedPage],
  );

  const content = useMemo(() => {
    if (selectedPage === "github") {
      return (
        <GithubAuthSettings
          pat={pat}
          setPat={setPat}
          clearPat={clearPat}
          user={user}
          setUser={setUser}
        />
      );
    }

    if (selectedPage === "local_data") {
      return (
        <LocalDataSettings
          selectedRepos={selectedRepos}
          allTrafficData={allTrafficData}
          onClearLocalData={onClearLocalData}
        />
      );
    }

    return <AppearanceSettings />;
  }, [
    allTrafficData,
    clearPat,
    onClearLocalData,
    pat,
    selectedPage,
    selectedRepos,
    setPat,
    setUser,
    user,
  ]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      style={{
        minWidth: 640,
        width: "min(720px, calc(100vw - 32px))",
        height: 600,
        maxHeight: "80vh",
        padding: 0,
        backgroundColor: isDark ? "#141414" : "#ffffff",
        color: isDark ? "#fff" : "#222",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 168,
          flexShrink: 0,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.04)",
          padding: "16px 10px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRight: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            color: isDark ? "#fff" : "#222",
            opacity: 0.3,
            padding: "8px 12px 12px",
          }}
        >
          Settings
        </div>

        {SETTINGS_PAGES.map((page) => (
          <Button
            key={page.key}
            prefix_icon={page.icon}
            label={page.label}
            onClick={() => setSelectedPage(page.key)}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              fontSize: 13,
              opacity: selectedPage === page.key ? 1 : 0.65,
              padding: "8px 12px",
              borderRadius: 7,
              iconSize: 16,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Button
          prefix_icon="close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            paddingVertical: 6,
            paddingHorizontal: 6,
            borderRadius: 6,
            opacity: 0.45,
            zIndex: 2,
            content: {
              prefixIconWrap: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 0,
              },
              icon: { width: 14, height: 14 },
            },
          }}
        />

        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "NunitoSans, sans-serif",
            color: isDark ? "#fff" : "#222",
            padding: "24px 32px 8px",
          }}
        >
          {activePage.label}
        </div>

        <div
          className="scrollable"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 0 24px 32px",
          }}
        >
          <div style={{ paddingRight: 32 }}>{content}</div>
        </div>
      </div>
    </Modal>
  );
};
