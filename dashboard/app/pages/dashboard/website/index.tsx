import { useLocation, useNavigate } from "react-router";
import {
  Image,
  Award,
  Info,
  MessageSquareQuote,
  Phone,
  Mail,
} from "lucide-react";
import HeroSlidesTab from "./components/HeroSlidesTab";
import AdvantagesTab from "./components/AdvantagesTab";
import AboutTab from "./components/AboutTab";
import TestimonialsTab from "./components/TestimonialsTab";
import ContactSocialTab from "./components/ContactSocialTab";
import NewsletterTab from "./components/NewsletterTab";

type TabId = "hero" | "advantages" | "about" | "testimonials" | "contact" | "newsletter";

const tabs: { id: TabId; label: string; icon: typeof Image }[] = [
  { id: "hero", label: "Hero Slides", icon: Image },
  { id: "advantages", label: "Advantages", icon: Award },
  { id: "about", label: "About", icon: Info },
  { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { id: "contact", label: "Contact & Social", icon: Phone },
  { id: "newsletter", label: "Newsletter", icon: Mail },
];

export default function WebsiteManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const rawTab = new URLSearchParams(location.search).get("tab");
  const activeTab: TabId = (tabs.some(t => t.id === rawTab) ? rawTab : "hero") as TabId;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Website Management</h1>
        <p className="text-muted-foreground">
          Manage your frontend website content -- hero slides, advantages, testimonials, and more
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(`/dashboard/website?tab=${tab.id}`, { replace: true })}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
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
      {activeTab === "hero" && <HeroSlidesTab />}
      {activeTab === "advantages" && <AdvantagesTab />}
      {activeTab === "about" && <AboutTab />}
      {activeTab === "testimonials" && <TestimonialsTab />}
      {activeTab === "contact" && <ContactSocialTab />}
      {activeTab === "newsletter" && <NewsletterTab />}
    </div>
  );
}
