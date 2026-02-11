import { useState } from "react";
import { Download, Upload, HardDrive } from "lucide-react";
import ExportTab from "./components/ExportTab";
import ImportTab from "./components/ImportTab";
import BackupTab from "./components/BackupTab";

type TabId = "export" | "import" | "backup";

const tabs: { id: TabId; label: string; icon: typeof Download }[] = [
  { id: "export", label: "Export", icon: Download },
  { id: "import", label: "Import", icon: Upload },
  { id: "backup", label: "Backup & Restore", icon: HardDrive },
];

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>("export");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">
          Export, import, and backup your data
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-yellow-500 text-yellow-600 font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "export" && <ExportTab />}
      {activeTab === "import" && <ImportTab />}
      {activeTab === "backup" && <BackupTab />}
    </div>
  );
}
