import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip } from "react-tooltip";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

interface StreakGridProps {
  streak: Record<string, number> | null;
}

export default function StreakGrid({ streak }: StreakGridProps) {
  // ✅ Inclusive date range (Last 365 days → Today)
  const endDate = new Date();
  endDate.setUTCHours(0, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 365);

  // Generate all days of current year
  const allDays: { date: string; count: number }[] = [];

  for (
    let d = new Date(startDate);
    d <= endDate;
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    const dateStr = d.toISOString().split("T")[0];
    allDays.push({
      date: dateStr,
      count: streak?.[dateStr] || 0,
    });
  }

  // Color scale
  const getColor = (count: number) => {
    if (count === 0) return "color-empty";
    if (count < 2) return "color-scale-1";
    if (count < 5) return "color-scale-2";
    if (count < 10) return "color-scale-3";
    return "color-scale-4";
  };

  return (
    <div className="bg-[#0d1117] border border-[#1f2328] rounded-xl p-5 text-gray-300 overflow-hidden">
      <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#ff006e] via-[#00d9ff] to-[#ffbe0b] mb-4">
        Push Activity
      </h2>

      <div className="overflow-x-auto" style={{ maxWidth: '100%', zoom: '0.6' }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={allDays}
          showWeekdayLabels={false}
          classForValue={(value) => {
            if (!value || value.count === 0) return "color-empty";
            return getColor(value.count);
          }}
          tooltipDataAttrs={(value: any) => {
            if (!value?.date) return {};

            const date = new Date(value.date + "T00:00:00");
            const dateStr = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            const tooltipText =
              value.count > 0
                ? `${dateStr}: ${value.count} push${
                    value.count > 1 ? "es" : ""
                  }`
                : `${dateStr}: No activity`;

            return {
              "data-tooltip-id": "activity-tip",
              "data-tooltip-content": tooltipText,
            };
          }}
        />

        <Tooltip id="activity-tip" place="top" />
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 3, 6, 10].map((c) => (
            <div
              key={c}
              className={`w-3 h-3 rounded-sm ${getColor(c)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>

      {/* Custom Heatmap Styling */}
      <style jsx>{`
        .color-empty {
          fill: #0d1117;
        }
        .color-scale-1 {
          fill: #ff8fb3;
        }
        .color-scale-2 {
          fill: #ff4a87;
        }
        .color-scale-3 {
          fill: #ff006e;
        }
        .color-scale-4 {
          fill: #00d9ff;
        }

        .react-calendar-heatmap {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        }

        .react-calendar-heatmap svg {
          max-width: 100% !important;
          height: auto !important;
          width: 100% !important;
          overflow: visible !important;
        }

        .react-calendar-heatmap rect {
          rx: 2 !important;
          ry: 2 !important;
          width: 8px !important;
          height: 8px !important;
        }

        .react-calendar-heatmap .react-calendar-heatmap-week {
          margin-right: 1px !important;
        }

        .react-calendar-heatmap .react-calendar-heatmap-week:nth-child(5n) {
          margin-right: 4px !important;
        }

        .react-calendar-heatmap-month-labels text {
          fill: #9aa4b2 !important;
          font-size: 6px !important;
          font-weight: 500 !important;
        }

        .react-calendar-heatmap text {
          font-size: 6px !important;
        }
      `}</style>
    </div>
  );
}
