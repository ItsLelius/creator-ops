import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Search,
  Video,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { SmoothSelect } from "../components/common/SmoothSelect";
import { calendarPosts } from "../data/mockData";
import type { CalendarPost, CalendarPostStatus } from "../types";

type CalendarPageProps = {
  onOpenSidebar: () => void;
};

export function CalendarPage({ onOpenSidebar }: CalendarPageProps) {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CalendarPostStatus>(
    "all",
  );

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const brands = useMemo(() => {
    return Array.from(new Set(calendarPosts.map((post) => post.brand)));
  }, []);

  const platforms = useMemo(() => {
    return Array.from(new Set(calendarPosts.map((post) => post.platform)));
  }, []);

  const filteredPosts = useMemo(() => {
    return calendarPosts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesBrand = brandFilter === "all" || post.brand === brandFilter;

      const matchesPlatform =
        platformFilter === "all" || post.platform === platformFilter;

      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;

      return matchesSearch && matchesBrand && matchesPlatform && matchesStatus;
    });
  }, [search, brandFilter, platformFilter, statusFilter]);

  const calendarEvents = useMemo(() => {
    return filteredPosts.flatMap((post) => {
      return post.times.map((time, index) => ({
        id: `${post.id}-${index}`,
        title: post.title,
        start: combineDateAndTime(post.date, time),
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: "inherit",
        extendedProps: {
          postId: post.id,
          post,
          time,
        },
      }));
    });
  }, [filteredPosts]);

  const selectedPost = useMemo(() => {
    return calendarPosts.find((post) => post.id === selectedPostId) ?? null;
  }, [selectedPostId]);

  const selectedDatePosts = useMemo(() => {
    if (!selectedDateKey) return [];

    return filteredPosts.filter((post) => {
      return dateKey(new Date(post.date)) === selectedDateKey;
    });
  }, [filteredPosts, selectedDateKey]);

  const scheduledCount = calendarPosts.filter(
    (post) => post.status === "scheduled",
  ).length;

  const readyCount = calendarPosts.filter((post) => post.status === "ready")
    .length;

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault();

    const post = info.event.extendedProps.post as CalendarPost;
    const postId = info.event.extendedProps.postId as string;

    setSelectedPostId(postId);
    setSelectedDateKey(dateKey(new Date(post.date)));
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader
        title="Calendar"
        description="Posting schedule by page name, platform, and upload time."
        onOpenSidebar={onOpenSidebar}
        pills={[
          {
            icon: CalendarDays,
            value: calendarPosts.length,
            label: "Calendar posts",
            accent: "blue",
          },
          {
            icon: Clock,
            value: scheduledCount,
            label: "Scheduled",
            accent: "violet",
          },
          {
            icon: CheckCircle2,
            value: readyCount,
            label: "Ready",
            accent: "emerald",
          },
        ]}
      />

      <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[#111318] p-5">
        <div className="mb-5 rounded-2xl border border-white/5 bg-[#171A21] p-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5">
              <Search className="h-4 w-4 text-slate-500" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSelectedPostId(null);
                  setSelectedDateKey(null);
                }}
                placeholder="Search scheduled content..."
                className="w-full bg-transparent text-sm text-slate-300 outline-none placeholder:text-slate-600"
              />
            </div>

            <SmoothSelect
              value={brandFilter}
              onChange={(value) => {
                setBrandFilter(value);
                setSelectedPostId(null);
                setSelectedDateKey(null);
              }}
              options={[
                { label: "All Pages", value: "all" },
                ...brands.map((brand) => ({ label: brand, value: brand })),
              ]}
            />

            <SmoothSelect
              value={platformFilter}
              onChange={(value) => {
                setPlatformFilter(value);
                setSelectedPostId(null);
                setSelectedDateKey(null);
              }}
              options={[
                { label: "All Platforms", value: "all" },
                ...platforms.map((platform) => ({
                  label: platform,
                  value: platform,
                })),
              ]}
            />

            <SmoothSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as "all" | CalendarPostStatus);
                setSelectedPostId(null);
                setSelectedDateKey(null);
              }}
              options={[
                { label: "All Status", value: "all" },
                { label: "Ready", value: "ready" },
                { label: "Scheduled", value: "scheduled" },
                { label: "Posted", value: "posted" },
                { label: "Missed", value: "missed" },
              ]}
            />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="calendar-shell min-h-0 overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10] p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialDate={
                calendarPosts[0]?.date
                  ? new Date(calendarPosts[0].date)
                  : new Date()
              }
              initialView="dayGridMonth"
              height="100%"
              events={calendarEvents}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              dateClick={(info) => {
                setSelectedDateKey(info.dateStr);
                setSelectedPostId(null);
              }}
              dayMaxEvents={2}
              moreLinkText={(count) => `+${count} more`}
              moreLinkClick={(info) => {
                setSelectedDateKey(dateKey(info.date));
                setSelectedPostId(null);

                return "timeGridDay";
              }}
              nowIndicator
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
            />
          </div>

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10]">
            {selectedPost ? (
              <PostDetailPanel post={selectedPost} />
            ) : selectedDateKey ? (
              <DaySchedulePanel
                dateKeyValue={selectedDateKey}
                posts={selectedDatePosts}
                onSelectPost={(post) => {
                  setSelectedPostId(post.id);
                  setSelectedDateKey(dateKey(new Date(post.date)));
                }}
              />
            ) : (
              <EmptyCalendarPanel />
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function renderEventContent(eventInfo: EventContentArg) {
  const post = eventInfo.event.extendedProps.post as CalendarPost;
  const time = eventInfo.event.extendedProps.time as string;

  return (
    <div
      className={[
        "w-full min-w-0 rounded-md border px-2 py-1 text-left transition",
        brandEventStyle(post.brand),
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="truncate text-[11px] font-bold">{shortBrand(post.brand)}</span>
        <span className="shrink-0 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-semibold">
          {time}
        </span>
      </div>

      <p className="mt-0.5 truncate text-[11px] opacity-90">{post.title}</p>
    </div>
  );
}

function DaySchedulePanel({
  dateKeyValue,
  posts,
  onSelectPost,
}: {
  dateKeyValue: string;
  posts: CalendarPost[];
  onSelectPost: (post: CalendarPost) => void;
}) {
  const groupedByBrand = useMemo(() => {
    return posts.reduce<Record<string, CalendarPost[]>>((groups, post) => {
      if (!groups[post.brand]) {
        groups[post.brand] = [];
      }

      groups[post.brand].push(post);
      return groups;
    }, {});
  }, [posts]);

  const dateLabel = new Date(`${dateKeyValue}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 bg-[#111318] p-5">
        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
          Day Schedule
        </span>

        <h3 className="mt-3 text-lg font-bold text-white">{dateLabel}</h3>

        <p className="mt-1 text-sm text-slate-500">
          {posts.length} posting item{posts.length === 1 ? "" : "s"} scheduled.
        </p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        {posts.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center text-center">
            <div>
              <CalendarDays className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-3 font-semibold text-white">
                No posts scheduled
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Scheduled posts for this day will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(groupedByBrand).map(([brand, brandPosts]) => (
              <section key={brand}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      brandDotStyle(brand),
                    ].join(" ")}
                  />
                  <h4 className="text-sm font-bold text-white">{brand}</h4>
                  <span className="text-xs text-slate-500">
                    {brandPosts.length} item{brandPosts.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-2">
                  {brandPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="w-full rounded-xl border border-white/10 bg-[#0B0D10] p-3 text-left transition hover:border-white/20 hover:bg-[#14171d]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-white">
                            {post.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {post.platform}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            calendarStatusBadge(post.status),
                          ].join(" ")}
                        >
                          {calendarStatusLabel(post.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.times.map((time) => (
                          <span
                            key={time}
                            className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostDetailPanel({ post }: { post: CalendarPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={["p-5", brandHeaderStyle(post.brand)].join(" ")}>
        <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
          {calendarStatusLabel(post.status)}
        </span>

        <h3 className="mt-3 break-words text-base font-bold leading-snug text-white">
          {post.title}
        </h3>

        <p className="mt-1 text-sm text-white/80">{post.brand}</p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-5">
          <DetailRow icon={CalendarDays} label="Date" value={formattedDate} />
          <DetailRow icon={Video} label="Platform" value={post.platform} />

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Posting Time
            </div>

            <div className="flex flex-wrap gap-2">
              {post.times.map((time) => (
                <span
                  key={time}
                  className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111318] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {calendarStatusLabel(post.status)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCalendarPanel() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center">
      <div>
        <CalendarDays className="mx-auto h-8 w-8 text-slate-600" />
        <p className="mt-3 font-semibold text-white">
          Select a post or day
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Click a calendar item for details, or click a day to see its full
          posting schedule.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function combineDateAndTime(date: string, time: string) {
  const base = new Date(date);
  const [rawTime, modifier] = time.split(" ");
  const [rawHours, rawMinutes] = rawTime.split(":").map(Number);

  let hours = rawHours;

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  }

  if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  base.setHours(hours, rawMinutes, 0, 0);

  return base;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortBrand(brand: string) {
  if (brand === "Maya's Kitchen") return "Maya";
  if (brand === "Chef Marrow") return "Marrow";
  return brand;
}

function calendarStatusLabel(status: CalendarPostStatus) {
  switch (status) {
    case "ready":
      return "Ready";
    case "scheduled":
      return "Scheduled";
    case "posted":
      return "Posted";
    case "missed":
      return "Missed";
    default:
      return status;
  }
}

function calendarStatusBadge(status: CalendarPostStatus) {
  switch (status) {
    case "ready":
      return "bg-emerald-500/10 text-emerald-300";
    case "scheduled":
      return "bg-violet-500/10 text-violet-300";
    case "posted":
      return "bg-green-500/10 text-green-300";
    case "missed":
      return "bg-red-500/10 text-red-300";
    default:
      return "bg-slate-500/10 text-slate-300";
  }
}

function brandEventStyle(brand: string) {
  switch (brand) {
    case "Maya's Kitchen":
      return "border-emerald-500/25 bg-emerald-500/12 text-emerald-100";
    case "Chef Marrow":
      return "border-amber-500/25 bg-amber-500/12 text-amber-100";
    case "Noutrix":
      return "border-cyan-500/25 bg-cyan-500/12 text-cyan-100";
    default:
      return "border-blue-500/25 bg-blue-500/12 text-blue-100";
  }
}

function brandDotStyle(brand: string) {
  switch (brand) {
    case "Maya's Kitchen":
      return "bg-emerald-400";
    case "Chef Marrow":
      return "bg-amber-400";
    case "Noutrix":
      return "bg-cyan-400";
    default:
      return "bg-blue-400";
  }
}

function brandHeaderStyle(brand: string) {
  switch (brand) {
    case "Maya's Kitchen":
      return "bg-gradient-to-br from-emerald-600/90 to-emerald-700/90";
    case "Chef Marrow":
      return "bg-gradient-to-br from-amber-600/90 to-orange-700/90";
    case "Noutrix":
      return "bg-gradient-to-br from-cyan-600/90 to-blue-700/90";
    default:
      return "bg-gradient-to-br from-blue-600/90 to-blue-700/90";
  }
}