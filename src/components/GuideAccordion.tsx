import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GuideItem {
  id: string;
  title: string;
  content: string;
}

interface GuideAccordionProps {
  items?: GuideItem[];
}

const defaultItems: GuideItem[] = [
  {
    id: "profile-setup",
    title: "Setting up your profile",
    content: "Complete all required fields including your name, contact information, address, and disciplines. Add a professional profile photo and gallery images to showcase your work."
  },
  {
    id: "approval-process",
    title: "Approval process",
    content: "Once submitted, your profile will be reviewed by our team. This usually takes 1-2 business days. You'll be notified via email once your profile is approved."
  },
  {
    id: "managing-bookings",
    title: "Managing your bookings",
    content: "View and manage your upcoming gigs in the calendar. Update your availability and respond to booking requests promptly to maintain a good rating."
  },
  {
    id: "updating-profile",
    title: "Updating your profile",
    content: "You can update your profile information at any time. If your profile is already approved, changes will need to be re-reviewed before going live."
  }
];

export default function GuideAccordion({ items = defaultItems }: GuideAccordionProps) {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Artist Guidelines</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-700 rounded-lg bg-gray-800/50"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <span className="font-medium text-white">{item.title}</span>
              {openItems.has(item.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openItems.has(item.id) && (
              <div className="px-4 pb-4">
                <div className="text-gray-300 leading-relaxed">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}