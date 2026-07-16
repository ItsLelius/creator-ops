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
    return Array.from(new Set(calendarPosts.map((post) => post.brand))).sort();
  }, []);

  const platforms = useMemo(() => {
    return Array.from(
      new Set(calendarPosts.map((post) => post.platform)),
    ).sort();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calendarPosts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.brand.toLowerCase().includes(query) ||
        post.platform.toLowerCase().includes(query);

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
    return filteredPosts.find((post) => post.id === selectedPostId) ?? null;
  }, [filteredPosts, selectedPostId]);

  const selectedDatePosts = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }

    return filteredPosts
      .filter((post) => dateKey(new Date(post.date)) === selectedDateKey)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredPosts, selectedDateKey]);

  const scheduledCount = filteredPosts.filter(
    (post) => post.status === "scheduled",
  ).length;

  const readyCount = filteredPosts.filter((post) => post.status === "ready")
    .length;

  const postedCount = filteredPosts.filter((post) => post.status === "posted")
    .length;

  function clearSelection() {
    setSelectedPostId(null);
    setSelectedDateKey(null);
  }

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
        description="Compact posting calendar with small pills so each date stays clean and balanced."
        onOpenSidebar={onOpenSidebar}
        accent="blue"
        pills={[
          {
            icon: CalendarDays,
            value: filteredPosts.length,
            label: "Visible posts",
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
          {
            icon: Video,
            value: postedCount,
            label: "Posted",
            accent: "amber",
          },
        ]}
      />

      <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-[#111318] p-5">
        <div className="mb-5 rounded-xl border border-white/10 bg-[#171A21] p-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0B0D10] px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-500" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  clearSelection();
                }}
                placeholder="Search scheduled content..."
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-300 outline-none placeholder:text-slate-600"
              />
            </div>

            <SmoothSelect
              value={brandFilter}
              onChange={(value) => {
                setBrandFilter(value);
                clearSelection();
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
                clearSelection();
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
                clearSelection();
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
              fixedWeekCount
              showNonCurrentDates
              events={calendarEvents}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              dateClick={(info) => {
                setSelectedDateKey(dateKey(info.date));
                setSelectedPostId(null);
              }}
              dayMaxEventRows={3}
              moreLinkContent={(args) => (
                <span className="text-[10px] font-black text-blue-300">
                  +{args.num} more
                </span>
              )}
              moreLinkClick={(info) => {
                setSelectedDateKey(dateKey(info.date));
                setSelectedPostId(null);

                return "popover";
              }}
              eventOrder="start,title"
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
              slotMinTime="06:00:00"
              slotMaxTime="23:00:00"
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
    <div className="flex h-[18px] w-full min-w-0 items-center gap-1 overflow-hidden rounded-md border border-blue-500/20 bg-blue-500/10 px-1.5 text-blue-100 transition hover:bg-blue-500/20">
      <span className="shrink-0 text-[9px] font-black leading-none text-blue-300">
        {compactTime(time)}
      </span>

      <span className="min-w-0 truncate text-[10px] font-bold leading-none">
        {post.title}
      </span>
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
        <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-blue-300">
          Day Schedule
        </span>

        <h3 className="mt-3 text-lg font-black text-white">{dateLabel}</h3>

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
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                  <h4 className="text-sm font-black text-white">{brand}</h4>
                  <span className="text-xs text-slate-500">
                    {brandPosts.length} item{brandPosts.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-2">
                  {brandPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => onSelectPost(post)}
                      className="w-full rounded-xl border border-white/10 bg-[#111318] p-3 text-left transition hover:border-white/20 hover:bg-[#171A21]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-black leading-snug text-white">
                            {post.title}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {post.platform}
                          </p>
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-black",
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
                            className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-black text-blue-300"
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
      <div className="border-b border-white/10 bg-[#111318] p-5">
        <span
          className={[
            "rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
            calendarStatusBadge(post.status),
          ].join(" ")}
        >
          {calendarStatusLabel(post.status)}
        </span>

        <h3 className="mt-3 break-words text-xl font-black leading-snug text-white">
          {post.title}
        </h3>

        <p className="mt-2 text-sm font-semibold text-slate-400">
          {post.brand}
        </p>
      </div>

      <div className="scroll-panel min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-5">
          <DetailRow icon={CalendarDays} label="Date" value={formattedDate} />
          <DetailRow icon={Video} label="Platform" value={post.platform} />

          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              Posting Time
            </div>

            <div className="flex flex-wrap gap-2">
              {post.times.map((time) => (
                <span
                  key={time}
                  className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-300"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111318] p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Status
            </p>

            <p className="mt-1 text-sm font-bold text-white">
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
        <p className="mt-3 font-semibold text-white">Select a post or day</p>
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
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-white">{value}</p>
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

function compactTime(time: string) {
  return time.replace(":00", "").replace(" ", "");
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
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "scheduled":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    case "posted":
      return "border-green-500/20 bg-green-500/10 text-green-300";
    case "missed":
      return "border-red-500/20 bg-red-500/10 text-red-300";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}