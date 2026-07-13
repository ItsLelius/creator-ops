import type {
  AssetItem,
  CalendarPost,
  ContentIdea,
  Employee,
  PublishedContent,
  Task,
  UploadDetails,
} from "../types";

export const tasks: Task[] = [
  {
    id: "1",
    title: "Buffalo Bacon Ranch Chicken Cheese Sticks",
    brand: "Maya's Kitchen",
    status: "submitted",
    assignee: "Maria",
    due: "Today, 6:00 PM",
    dueGroup: "Today",
    detail: "Script, Prompt A, Prompt B, Caption",
  },
  {
    id: "2",
    title: "Chicken Broccoli Alfredo Garlic Bread Bowl",
    brand: "Maya's Kitchen",
    status: "in_progress",
    assignee: "John",
    due: "Tomorrow",
    dueGroup: "Tomorrow",
    detail: "Generate full scene package",
  },
  {
    id: "3",
    title: "Peach Cobbler Ice Cream Remake",
    brand: "Maya's Kitchen",
    status: "needs_revision",
    assignee: "Maria",
    due: "Today, 8:00 PM",
    dueGroup: "Today",
    detail: "Revise Scene 3 and CTA",
  },
  {
    id: "4",
    title: "Maya CTA Cookbook Scene",
    brand: "Maya's Kitchen",
    status: "ready_to_upload",
    assignee: "Adi",
    due: "Today, 6:00 PM",
    dueGroup: "Today",
    detail: "Caption and hashtags ready",
  },
  {
    id: "5",
    title: "King Ranch Chicken Casserole",
    brand: "Maya's Kitchen",
    status: "to_generate",
    assignee: "All Employees",
    due: "Tomorrow",
    dueGroup: "Tomorrow",
    detail: "Needs script and prompt package",
  },
  {
    id: "6",
    title: "Chocolate Frosty Copycat Scene",
    brand: "Maya's Kitchen",
    status: "posted",
    assignee: "Maria",
    due: "Posted Jul 12",
    dueGroup: "This Week",
    detail: "Published on Facebook Reels",
  },
];

export const employees: Employee[] = [
  {
    id: "1",
    name: "Maria",
    role: "Employee",
    status: "Online",
    lastSeen: "Now",
  },
  {
    id: "2",
    name: "John",
    role: "Employee",
    status: "Offline",
    lastSeen: "12 minutes ago",
  },
];

export const recentActivity = [
  "Maria submitted Buffalo Bacon Ranch Chicken Cheese Sticks.",
  "Peach Cobbler Ice Cream Remake needs revision.",
  "Maya CTA Cookbook Scene moved to Ready to Upload.",
];

export const uploadDetailsByTaskId: Record<string, UploadDetails> = {
  "4": {
    caption:
      "Did you know this simple recipe can turn into a crispy, cheesy comfort meal? Follow for more!",
    driveUrl: "https://drive.google.com/example",
    platform: "Facebook Reels",
    schedule: "Today, 6:00 PM",
    hashtags: "#easyrecipes #comfortfood #mayaskitchen",
    notes: "Use the final approved Drive video. Caption is ready.",
  },
};

export const publishedContent: PublishedContent[] = [
  {
    id: "p1",
    title: "Chocolate Frosty Copycat Scene",
    brand: "Maya's Kitchen",
    platform: "Facebook Reels",
    postedDate: "Jul 12, 2026",
    publicUrl: "https://facebook.com/example",
    driveUrl: "https://drive.google.com/example",
    caption:
      "A cold, creamy chocolate Frosty-style dessert you can make at home.",
    hashtags: "#frosty #copycatrecipe #mayaskitchen",
    postedBy: "Adi",
  },
];

export const calendarPosts: CalendarPost[] = [
  {
    id: "c1",
    title: "Maya CTA Cookbook Scene",
    brand: "Maya's Kitchen",
    platform: "Facebook Reels",
    date: "Jul 13, 2026",
    dayLabel: "Today",
    times: ["6:00 AM", "6:00 PM"],
    status: "ready",
    linkedTaskId: "4",
  },
  {
    id: "c2",
    title: "King Ranch Chicken Casserole",
    brand: "Maya's Kitchen",
    platform: "Facebook Reels",
    date: "Jul 14, 2026",
    dayLabel: "Tomorrow",
    times: ["6:00 AM", "6:00 PM"],
    status: "scheduled",
    linkedTaskId: "5",
  },
  {
    id: "c3",
    title: "Chocolate Frosty Copycat Scene",
    brand: "Maya's Kitchen",
    platform: "Facebook Reels",
    date: "Jul 12, 2026",
    dayLabel: "Yesterday",
    times: ["6:00 PM"],
    status: "posted",
    linkedTaskId: "6",
  },
];

export const contentIdeas: ContentIdea[] = [
  {
    id: "i1",
    title: "Buffalo Ranch Chicken Cheese Pull",
    brand: "Maya's Kitchen",
    category: "Recipe Remake",
    sourceName: "Facebook Reel Reference",
    sourceUrl: "https://facebook.com/example",
    hook: "Did you know if you mix chicken, bacon, ranch, and cheese...",
    notes:
      "Good for Maya because it has cheese pull, crunchy texture, and strong U.S. comfort food appeal.",
    createdAt: "Jul 13, 2026",
  },
  {
    id: "i2",
    title: "Giant Garlic Butter Pasta Bowl",
    brand: "Maya's Kitchen",
    category: "Visual Food Idea",
    sourceName: "TikTok Reference",
    sourceUrl: "https://tiktok.com/example",
    hook: "If you toss hot pasta with garlic butter and parmesan...",
    notes:
      "Strong sauce coating, steam, parmesan fall, and glossy pasta movement.",
    createdAt: "Jul 13, 2026",
  },
];

export const assetItems: AssetItem[] = [
  {
    id: "a1",
    title: "Maya Character Reference Grid",
    brand: "Maya's Kitchen",
    category: "Character Reference",
    type: "image",
    fileUrl: "https://drive.google.com/example",
    description:
      "Main Maya character reference image used for consistent generation.",
    uploadedAt: "Jul 13, 2026",
  },
  {
    id: "a2",
    title: "Maya Kitchen Prompt Brain PDF",
    brand: "Maya's Kitchen",
    category: "Prompt System",
    type: "pdf",
    fileUrl: "https://drive.google.com/example",
    description:
      "Production prompt rules, character lock, and workflow reference.",
    uploadedAt: "Jul 13, 2026",
  },
  {
    id: "a3",
    title: "Maya Cookbook Page Sample",
    brand: "Maya's Kitchen",
    category: "Cookbook Asset",
    type: "image",
    fileUrl: "https://drive.google.com/example",
    description:
      "Reference image for cookbook page layout and visual direction.",
    uploadedAt: "Jul 13, 2026",
  },
];