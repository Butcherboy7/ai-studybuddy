import { useAppStore } from "@/store/appStore";
import AppSidebar from "@/components/layout/app-sidebar";
import WelcomeScreen from "@/components/welcome/welcome-screen";
import ChatInterface from "@/components/chat/chat-interface";
import PaperGenerator from "@/components/paper-generator/paper-generator";
import SkillsTracking from "@/components/skills/skills-tracking";

export default function Home() {
  const currentView = useAppStore(state => state.currentView);

  const renderMainContent = () => {
    switch (currentView) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'chat':
        return <ChatInterface />;
      case 'paper-generator':
        return <PaperGenerator />;
      case 'skills':
        return <SkillsTracking />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AppSidebar />
      <div className="flex-1 ml-70 flex flex-col overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
}
