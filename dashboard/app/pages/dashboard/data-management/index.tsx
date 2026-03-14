import { useLocation, useNavigate } from "react-router";
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
  const location = useLocation();
  const navigate = useNavigate();
  const rawTab = new URLSearchParams(location.search).get("tab");
  const activeTab: TabId =
    rawTab === "import" || rawTab === "backup" ? rawTab : "export";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">
          Export, import, and backup your data
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(`/dashboard?tab=${tab.id}`)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === tab.id
                ? "border-yellow-500 text-yellow-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-900"
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
