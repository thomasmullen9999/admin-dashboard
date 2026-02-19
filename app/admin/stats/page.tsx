"use client";

import { useState, useMemo } from "react";

// Mock lead data with dates
const MOCK_LEADS = [
  {
    id: "1",
    campaign: "morrisons",
    status: "sold",
    createdAt: "2024-02-03 13:22",
  },
  {
    id: "2",
    campaign: "asda",
    status: "nurture",
    createdAt: "2024-02-03 09:10",
  },
  { id: "3", campaign: "pcp", status: "sold", createdAt: "2024-02-02 11:45" },
  {
    id: "4",
    campaign: "dpf",
    status: "nurture",
    createdAt: "2024-02-01 08:30",
  },
  { id: "5", campaign: "next", status: "sold", createdAt: "2024-02-01 10:00" },
  {
    id: "6",
    campaign: "sainsburys",
    status: "nurture",
    createdAt: "2024-01-31 14:00",
  },
  {
    id: "7",
    campaign: "morrisons",
    status: "sold",
    createdAt: "2024-01-30 10:00",
  },
  {
    id: "8",
    campaign: "asda",
    status: "nurture",
    createdAt: "2024-01-28 11:00",
  },
  { id: "9", campaign: "pcp", status: "sold", createdAt: "2024-01-27 12:00" },
  {
    id: "10",
    campaign: "dpf",
    status: "nurture",
    createdAt: "2024-01-25 13:00",
  },
  {
    id: "11",
    campaign: "morrisons",
    status: "sold",
    createdAt: "2024-01-20 13:22",
  },
  { id: "12", campaign: "asda", status: "sold", createdAt: "2024-01-15 09:10" },
  {
    id: "13",
    campaign: "pcp",
    status: "nurture",
    createdAt: "2024-01-10 11:45",
  },
  {
    id: "14",
    campaign: "sainsburys",
    status: "sold",
    createdAt: "2024-01-08 14:00",
  },
  { id: "15", campaign: "next", status: "sold", createdAt: "2024-01-05 10:00" },
];

type Lead = {
  id: string;
  campaign: string;
  status: string;
  createdAt: string;
};

function PieChart({
  data,
  darkMode,
}: {
  data: { label: string; value: number; color: string }[];
  darkMode: boolean;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div
        style={{
          width: 300,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: darkMode ? "#94a3b8" : "#64748b",
        }}
      >
        No data available
      </div>
    );
  }

  let currentAngle = -90;

  return (
    <div style={{ position: "relative", width: 300, height: 300 }}>
      <svg width="300" height="300" viewBox="0 0 300 300">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;

          const startX = 150 + 120 * Math.cos((startAngle * Math.PI) / 180);
          const startY = 150 + 120 * Math.sin((startAngle * Math.PI) / 180);
          const endX = 150 + 120 * Math.cos((endAngle * Math.PI) / 180);
          const endY = 150 + 120 * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const path = [
            `M 150 150`,
            `L ${startX} ${startY}`,
            `A 120 120 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `Z`,
          ].join(" ");

          currentAngle = endAngle;

          return (
            <g key={index}>
              <path d={path} fill={item.color} opacity={0.9} />
            </g>
          );
        })}
        <circle
          cx="150"
          cy="150"
          r="60"
          fill={darkMode ? "#1e293b" : "#ffffff"}
        />
        <text
          x="150"
          y="145"
          textAnchor="middle"
          fontSize="32"
          fontWeight="700"
          fill={darkMode ? "#f1f5f9" : "#0f172a"}
        >
          {total}
        </text>
        <text
          x="150"
          y="165"
          textAnchor="middle"
          fontSize="14"
          fill={darkMode ? "#94a3b8" : "#64748b"}
        >
          Total Leads
        </text>
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 20 }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: item.color,
              }}
            />
            <span
              style={{ fontSize: 14, color: darkMode ? "#f1f5f9" : "#0f172a" }}
            >
              {item.label}: {item.value} (
              {((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({
  data,
  darkMode,
}: {
  data: { label: string; value: number; color: string }[];
  darkMode: boolean;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 60;
  const gap = 20;
  const chartHeight = 250;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        width={data.length * (barWidth + gap) + gap}
        height={chartHeight + 60}
      >
        {data.map((item, index) => {
          const height = (item.value / maxValue) * chartHeight;
          const x = gap + index * (barWidth + gap);
          const y = chartHeight - height;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={item.color}
                rx={8}
                opacity={0.9}
              />
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={darkMode ? "#f1f5f9" : "#0f172a"}
              >
                {item.value}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill={darkMode ? "#94a3b8" : "#64748b"}
                transform={`rotate(0, ${x + barWidth / 2}, ${chartHeight + 20})`}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function StatsPage() {
  const [darkMode] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "7days" | "30days" | "all"
  >("7days");

  const bgColor = darkMode ? "#1e293b" : "#ffffff";
  const textColor = darkMode ? "#f1f5f9" : "#0f172a";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";
  const headerBg = darkMode ? "#0f172a" : "#f8fafc";

  const campaignColors: Record<string, string> = {
    morrisons: "#f59e0b",
    asda: "#22c55e",
    pcp: "#6366f1",
    dpf: "#a855f7",
    diesel: "#a855f7",
    sainsburys: "#ef4444",
    next: "#374151",
  };

  const filterLeadsByPeriod = (leads: Lead[], period: string) => {
    const now = new Date("2024-02-03"); // Current date from context
    const cutoffDates: Record<string, Date> = {
      today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      "7days": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "30days": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      all: new Date(0),
    };

    const cutoff = cutoffDates[period];
    return leads.filter((lead) => new Date(lead.createdAt) >= cutoff);
  };

  const filteredLeads = useMemo(
    () => filterLeadsByPeriod(MOCK_LEADS, selectedPeriod),
    [selectedPeriod],
  );

  const campaignStats = useMemo(() => {
    const stats: Record<
      string,
      { total: number; sold: number; nurture: number }
    > = {};

    filteredLeads.forEach((lead) => {
      if (!stats[lead.campaign]) {
        stats[lead.campaign] = { total: 0, sold: 0, nurture: 0 };
      }
      stats[lead.campaign].total++;
      if (lead.status === "sold") {
        stats[lead.campaign].sold++;
      } else {
        stats[lead.campaign].nurture++;
      }
    });

    return stats;
  }, [filteredLeads]);

  const pieChartData = Object.entries(campaignStats).map(
    ([campaign, stats]) => ({
      label: campaign.charAt(0).toUpperCase() + campaign.slice(1),
      value: stats.total,
      color: campaignColors[campaign] || "#9ca3af",
    }),
  );

  const barChartData = Object.entries(campaignStats).map(
    ([campaign, stats]) => ({
      label: campaign.charAt(0).toUpperCase() + campaign.slice(1),
      value: stats.total,
      color: campaignColors[campaign] || "#9ca3af",
    }),
  );

  const totalLeads = filteredLeads.length;
  const soldLeads = filteredLeads.filter((l) => l.status === "sold").length;
  const nurtureLeads = filteredLeads.filter(
    (l) => l.status === "nurture",
  ).length;
  const conversionRate =
    totalLeads > 0 ? ((soldLeads / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: textColor,
            margin: "0 0 8px 0",
          }}
        >
          📊 Lead Statistics
        </h1>
        <p
          style={{
            fontSize: 15,
            color: darkMode ? "#94a3b8" : "#64748b",
            margin: 0,
          }}
        >
          Comprehensive overview of your lead performance across all campaigns
        </p>
      </div>

      {/* Period Selector */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          padding: 4,
          backgroundColor: headerBg,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          width: "fit-content",
        }}
      >
        {[
          { key: "today", label: "Today" },
          { key: "7days", label: "Last 7 Days" },
          { key: "30days", label: "Last 30 Days" },
          { key: "all", label: "All Time" },
        ].map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key as any)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background:
                selectedPeriod === period.key
                  ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                  : "transparent",
              color: selectedPeriod === period.key ? "#ffffff" : textColor,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            padding: "24px",
            background: darkMode ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: darkMode ? "#94a3b8" : "#64748b",
              marginBottom: 8,
            }}
          >
            Total Leads
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: textColor }}>
            {totalLeads}
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            background: darkMode ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: darkMode ? "#94a3b8" : "#64748b",
              marginBottom: 8,
            }}
          >
            Sold
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#22c55e" }}>
            {soldLeads}
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            background: darkMode ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: darkMode ? "#94a3b8" : "#64748b",
              marginBottom: 8,
            }}
          >
            Nurture
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#94a3b8" }}>
            {nurtureLeads}
          </div>
        </div>

        <div
          style={{
            padding: "24px",
            background: darkMode ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: darkMode ? "#94a3b8" : "#64748b",
              marginBottom: 8,
            }}
          >
            Conversion Rate
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#6366f1" }}>
            {conversionRate}%
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Pie Chart */}
        <div
          style={{
            padding: "28px",
            background: bgColor,
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: textColor,
              margin: "0 0 24px 0",
            }}
          >
            Leads by Campaign
          </h3>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PieChart data={pieChartData} darkMode={darkMode} />
          </div>
        </div>

        {/* Bar Chart */}
        <div
          style={{
            padding: "28px",
            background: bgColor,
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: textColor,
              margin: "0 0 24px 0",
            }}
          >
            Campaign Performance
          </h3>
          <BarChart data={barChartData} darkMode={darkMode} />
        </div>
      </div>

      {/* Campaign Details Table */}
      <div
        style={{
          background: bgColor,
          borderRadius: 16,
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
          boxShadow: darkMode
            ? "0 4px 6px rgba(0,0,0,0.3)"
            : "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            padding: "24px 28px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: textColor,
              margin: 0,
            }}
          >
            Campaign Breakdown
          </h3>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: headerBg }}>
              <th
                style={{
                  padding: "16px 28px",
                  textAlign: "left",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: darkMode ? "#94a3b8" : "#64748b",
                  letterSpacing: "0.5px",
                  borderBottom: `2px solid ${borderColor}`,
                }}
              >
                Campaign
              </th>
              <th
                style={{
                  padding: "16px 28px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: darkMode ? "#94a3b8" : "#64748b",
                  letterSpacing: "0.5px",
                  borderBottom: `2px solid ${borderColor}`,
                }}
              >
                Total Leads
              </th>
              <th
                style={{
                  padding: "16px 28px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: darkMode ? "#94a3b8" : "#64748b",
                  letterSpacing: "0.5px",
                  borderBottom: `2px solid ${borderColor}`,
                }}
              >
                Sold
              </th>
              <th
                style={{
                  padding: "16px 28px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: darkMode ? "#94a3b8" : "#64748b",
                  letterSpacing: "0.5px",
                  borderBottom: `2px solid ${borderColor}`,
                }}
              >
                Nurture
              </th>
              <th
                style={{
                  padding: "16px 28px",
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: darkMode ? "#94a3b8" : "#64748b",
                  letterSpacing: "0.5px",
                  borderBottom: `2px solid ${borderColor}`,
                }}
              >
                Conversion %
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(campaignStats).map(([campaign, stats], idx) => {
              const convRate =
                stats.total > 0
                  ? ((stats.sold / stats.total) * 100).toFixed(1)
                  : "0";
              return (
                <tr
                  key={campaign}
                  style={{
                    backgroundColor: idx % 2 === 0 ? bgColor : headerBg,
                  }}
                >
                  <td
                    style={{
                      padding: "20px 28px",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor:
                            campaignColors[campaign] || "#9ca3af",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: textColor,
                        }}
                      >
                        {campaign.charAt(0).toUpperCase() + campaign.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "20px 28px",
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      color: textColor,
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {stats.total}
                  </td>
                  <td
                    style={{
                      padding: "20px 28px",
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#22c55e",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {stats.sold}
                  </td>
                  <td
                    style={{
                      padding: "20px 28px",
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#94a3b8",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {stats.nurture}
                  </td>
                  <td
                    style={{
                      padding: "20px 28px",
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#6366f1",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    {convRate}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
