"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/** Generic lead — used for all non-PCP campaigns and as the list row shape. */
type Lead = {
  id: string;
  lead_id: string;
  campaign: string;
  status: "sold" | "nurture";
  name: string;
  createdAt: string;
  soldAt?: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  marketing?: string;
  privacyPolicy?: string;
  step?: string;
  [key: string]: any;
};

/**
 * Core PCP fields — returned by the list endpoint (/api/getpcpdata).
 * Extends Lead so it's compatible with Lead[] state.
 *
 * The base Lead fields (id, lead_id, campaign, status, name, email, phone,
 * createdAt, soldAt …) are satisfied by the display-helper properties below
 * plus the raw lead_* timestamps mapped to createdAt/soldAt in the mock data
 * and in the API route before storing into state.
 */
type PCPLeadCore = Lead & {
  // PCP-specific identifiers
  intellio_id: string | null;
  token_id: string | null;

  // Routing / status (raw DB column names)
  lead_address: string | null;
  lead_campaign: string;
  lead_status: string;
  lead_sold_timestamp: string | null;
  lead_sold_timestamp_txt: string | null;
  lead_source: string | null;
  lead_created_at: string;
  lead_updated_at: string;

  // campaign is narrowed to the literal "pcp"
  campaign: "pcp";
};

type DPFLeadCore = Lead & {
  // PCP-specific identifiers
  intellio_id: string | null;
  token_id: string | null;

  // Routing / status (raw DB column names)
  lead_address: string | null;
  lead_campaign: string;
  lead_status: string;
  lead_sold_timestamp: string | null;
  lead_sold_timestamp_txt: string | null;
  lead_source: string | null;
  lead_created_at: string;
  lead_updated_at: string;
  campaign: "dpf";
};

type FairPayLeadCore = Lead & {
  // PCP-specific identifiers
  intellio_id: string | null;
  token_id: string | null;

  // Routing / status (raw DB column names)
  lead_address: string | null;
  lead_campaign: string;
  lead_status: string;
  lead_sold_timestamp: string | null;
  lead_sold_timestamp_txt: string | null;
  lead_source: string | null;
  lead_created_at: string;
  lead_updated_at: string;
  campaign: "Fair Pay";
};

/** A single PCP claim attached to a lead. */
type PCPClaim = {
  id: string;
  lender: string;
  agreement_date: string;
  agreement_number: string | null;
  vehicle_registration: string | null;
  id_submitted: "Y" | "N";
  signed_loa: "Y" | "N";
  status?: "valid" | "invalid";
};

/**
 * Full PCP lead detail — returned by the single-record endpoint
 * (/api/getpcpdata/[id]). Extends the core shape with all additional
 * sections fetched on demand when the user clicks "View Details".
 */
type PCPLeadDetail = PCPLeadCore & {
  // ── Credit Check ──────────────────────────────────────────
  last_credit_check: string | null;
  credit_check_data: any | null;
  kyc_decision: string | null;
  loaFileLink: string | null;
  salutation: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  completed_steps: number | null;

  // ── Claims (0-many) ───────────────────────────────────────
  claims: PCPClaim[];

  // ── Marketing / Meta ──────────────────────────────────────
  lead_meta_id: string | null;
  lead_meta_ip_address: string | null;
  lead_meta_browser_spec: string | null;
  lead_meta_referer: string | null;
  phoneVerifiedAt: string | null;
  campaignUserId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  formData: Record<string, unknown> | null;
  marketingData: Record<string, unknown> | null;
  apiData: Record<string, unknown> | null;
  jsonData: Record<string, unknown> | null;
  apiCallsHistory: Record<string, unknown>[] | null;
};

// ============================================================
// REAL API INTEGRATION (PCP only) — COMMENTED OUT
// Uncomment both blocks below once the endpoints are live.
// ============================================================

async function fetchPCPLeads(): Promise<PCPLeadCore[]> {
  const res = await fetch("/api/pcp-leads", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch PCP leads: ${res.status}`);
  const json = await res.json();

  // Handle potential variations in API response structure
  const rawLeads = json.data?.pcpLeads || json.data?.pcpleads || [];

  return rawLeads.map((lead: any): PCPLeadCore => {
    // Format dates for display (e.g. "14 Jan 2024 12:10")
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return undefined;
      try {
        return new Date(dateStr).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      // ── Lead Interface (Display) ──
      id: lead.id,
      lead_id: lead.id.substring(0, 8).toUpperCase(), // Shorten for display
      campaign: "pcp",
      status: lead.lead_status,
      name: lead.campaignUser?.name ?? "Unknown",
      email: lead.campaignUser?.email ?? "",
      phone: lead.campaignUser?.phoneNumber ?? "",
      createdAt: formatDate(lead.createdAt) ?? "",
      soldAt: formatDate(lead.lead_sold_timestamp),
      step: lead.completed_steps ? `Step ${lead.completed_steps}` : undefined,

      // ── PCPLeadCore Interface (Internal) ──
      intellio_id: null,
      token_id: lead.token_id,
      lead_address: null,
      lead_campaign: "pcp",
      lead_status: lead.lead_status,
      lead_sold_timestamp: lead.lead_sold_timestamp,
      lead_sold_timestamp_txt: formatDate(lead.lead_sold_timestamp) ?? null,
      lead_source: null,
      lead_created_at: lead.createdAt,
      lead_updated_at: lead.createdAt,
    };
  });
}

async function fetchDPFLeads(): Promise<DPFLeadCore[]> {
  const res = await fetch("/api/dpf-leads", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch DPF leads: ${res.status}`);
  const json = await res.json();

  // Handle potential variations in API response structure
  const rawLeads = json.data?.dpfLeads || json.data?.dpfleads || [];

  return rawLeads.map((lead: any): DPFLeadCore => {
    // Format dates for display (e.g. "14 Jan 2024 12:10")
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return undefined;
      try {
        return new Date(dateStr).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      // ── Lead Interface (Display) ──
      id: lead.id,
      lead_id: lead.id.substring(0, 8).toUpperCase(), // Shorten for display
      campaign: "dpf",
      status: lead.lead_status,
      name: lead.campaignUser?.name ?? "Unknown",
      email: lead.campaignUser?.email ?? "",
      phone: lead.campaignUser?.phoneNumber ?? "",
      createdAt: formatDate(lead.createdAt) ?? "",
      soldAt: formatDate(lead.lead_sold_timestamp),
      step: lead.completed_steps ? `Step ${lead.completed_steps}` : undefined,

      // ── PCPLeadCore Interface (Internal) ──
      intellio_id: null,
      token_id: lead.token_id,
      lead_address: null,
      lead_campaign: "dpf",
      lead_status: lead.lead_status,
      lead_sold_timestamp: lead.lead_sold_timestamp,
      lead_sold_timestamp_txt: formatDate(lead.lead_sold_timestamp) ?? null,
      lead_source: null,
      lead_created_at: lead.createdAt,
      lead_updated_at: lead.createdAt,
    };
  });
}

async function fetchFairPayLeads(): Promise<FairPayLeadCore[]> {
  const res = await fetch("/api/fair-pay-leads", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch Fair Pay leads: ${res.status}`);
  const json = await res.json();

  // Handle potential variations in API response structure
  const rawLeads = json.data?.fairPayLeads || json.data?.fairpayleads || [];

  return rawLeads.map((lead: any): FairPayLeadCore => {
    // Format dates for display (e.g. "14 Jan 2024 12:10")
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return undefined;
      try {
        return new Date(dateStr).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      // ── Lead Interface (Display) ──
      id: lead.id,
      lead_id: lead.id.substring(0, 8).toUpperCase(), // Shorten for display
      campaign: "Fair Pay",
      status: lead.lead_status,
      name: lead.campaignUser?.name ?? "Unknown",
      email: lead.campaignUser?.email ?? "",
      phone: lead.campaignUser?.phoneNumber ?? "",
      createdAt: formatDate(lead.createdAt) ?? "",
      soldAt: formatDate(lead.lead_sold_timestamp),
      step: lead.completed_steps ? `Step ${lead.completed_steps}` : undefined,

      // ── PCPLeadCore Interface (Internal) ──
      intellio_id: null,
      token_id: lead.token_id,
      lead_address: null,
      lead_campaign: "Fair Pay",
      lead_status: lead.lead_status,
      lead_sold_timestamp: lead.lead_sold_timestamp,
      lead_sold_timestamp_txt: formatDate(lead.lead_sold_timestamp) ?? null,
      lead_source: null,
      lead_created_at: lead.createdAt,
      lead_updated_at: lead.createdAt,
    };
  });
}

// ============================================================
// BADGE COMPONENTS
// ============================================================

function CampaignBadge({ campaign }: { campaign: string }) {
  const configs: Record<
    string,
    { bg: string; color: string; gradient?: string }
  > = {
    morrisons: {
      bg: "#fbbf24",
      color: "#78350f",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    },
    asda: {
      bg: "#22c55e",
      color: "#14532d",
      gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    },
    pcp: {
      bg: "#6366f1",
      color: "#ffffff",
      gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    },
    dpf: {
      bg: "#a855f7",
      color: "#ffffff",
      gradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
    },
    diesel: {
      bg: "#a855f7",
      color: "#ffffff",
      gradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)",
    },
    sainsburys: {
      bg: "#ef4444",
      color: "#ffffff",
      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    },
    next: {
      bg: "#374151",
      color: "#ffffff",
      gradient: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
    },
  };

  const config = configs[campaign] ?? { bg: "#9ca3af", color: "#ffffff" };

  return (
    <span
      style={{
        background: config.gradient || config.bg,
        color: config.color,
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        display: "inline-block",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {campaign}
    </span>
  );
}

function StatusBadge({ status }: { status: "sold" | "nurture" }) {
  const isSold = status === "sold";
  return (
    <span
      style={{
        background: isSold
          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
          : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
        color: "#ffffff",
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {isSold ? "✓" : "○"} {status}
    </span>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminPage() {
  const searchParams = useSearchParams();
  const group = searchParams.get("group") ?? "";

  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pcpLoading, setPcpLoading] = useState(false);
  const [pcpError, setPcpError] = useState<string | null>(null);
  const [dpfLoading, setdpfLoading] = useState(false);
  const [dpfError, setDpfError] = useState<string | null>(null);
  const [fairPayLoading, setFairPayLoading] = useState(false);
  const [fairPayError, setFairPayError] = useState<string | null>(null);

  useEffect(() => {
    setPcpLoading(true);
    fetchPCPLeads()
      .then((pcpLeads) => {
        console.log(pcpLeads, "fetched PCP leads");
        setLeads((prev) => {
          const nonPcp = prev.filter((l) => l.campaign !== "pcp");
          return [...nonPcp, ...pcpLeads];
        });
      })
      .catch((err) => setPcpError(err.message))
      .finally(() => setPcpLoading(false));
  }, []);

  useEffect(() => {
    setdpfLoading(true);
    fetchDPFLeads()
      .then((dpfLeads) => {
        console.log(dpfLeads, "fetched DPF leads");
        setLeads((prev) => {
          const nonDpf = prev.filter((l) => l.campaign !== "dpf");
          return [...nonDpf, ...dpfLeads];
        });
      })
      .catch((err) => setDpfError(err.message))
      .finally(() => setdpfLoading(false));
  }, []);

  useEffect(() => {
    setdpfLoading(true);
    fetchFairPayLeads()
      .then((fairPayLeads) => {
        console.log(fairPayLeads, "fetched Fair Pay leads");
        setLeads((prev) => {
          const nonFairPay = prev.filter((l) => l.campaign !== "fairpay");
          return [...nonFairPay, ...fairPayLeads];
        });
      })
      .catch((err) => setFairPayError(err.message))
      .finally(() => setFairPayLoading(false));
  }, []);

  async function fetchPCPLeadDetail(id: string): Promise<PCPLeadDetail> {
    const res = await fetch(`/api/pcp-leads/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch lead detail: ${res.status}`);
    }

    const json = await res.json();

    if (!json.success || !json.data?.pcpLead) {
      throw new Error("Invalid response structure");
    }

    const apiLead = json.data.pcpLead;

    // Helper to format date
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return null;
      try {
        return new Date(dateStr).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return dateStr;
      }
    };

    // Map claims from credit_check_data if available (to show all), otherwise fallback to filteredAgreements
    let claims: PCPClaim[] = [];

    if (
      Array.isArray(apiLead.credit_check_data) &&
      apiLead.credit_check_data.length > 0
    ) {
      const validAccountNumbers = new Set(
        (apiLead.filteredAgreements || []).map((a: any) => a.accountNumber),
      );

      claims = apiLead.credit_check_data.map((agreement: any, idx: number) => {
        const isValid = validAccountNumbers.has(agreement.accountNumber);
        return {
          id: `CLM-${idx + 1}`,
          lender: agreement.supplyCompanyName || "Unknown Lender",
          agreement_date: agreement.agreement_date_single || "Unknown Date",
          agreement_number: agreement.accountNumber || null,
          vehicle_registration: null,
          id_submitted: "Y",
          signed_loa: "Y",
          status: isValid ? "valid" : "invalid",
        };
      });
    } else {
      claims = (apiLead.filteredAgreements || []).map(
        (agreement: any, idx: number) => ({
          id: `CLM-${idx + 1}`,
          lender: agreement.supplyCompanyName || "Unknown Lender",
          agreement_date: agreement.agreement_date_single || "Unknown Date",
          agreement_number: agreement.accountNumber || null,
          vehicle_registration: null,
          id_submitted: "Y",
          signed_loa: "Y",
          status: "valid",
        }),
      );
    }

    // Construct signature data for jsonData field
    const signature = apiLead.signatures?.[0];
    const jsonData = {
      signatureImagePng: signature?.signatureFileLink || null,
      signatureIpAddress: signature?.signerIp || null,
      signatureTimestamp: formatDate(signature?.signedAt) || null,
      signatureId: signature?.id || null,
      signatureUserAgent: signature?.userAgent || null,
      signatureDeviceType: signature?.deviceType || null,
      signatureOperatingSystem: signature?.operatingSystem || null,
      signatureBrowser: signature?.browser || null,
      signatureDocumentHash: signature?.documentHash || null,
      ...apiLead.jsonData,
    };

    // Construct address string
    const addr = apiLead.formData?.currentAddress;
    const addressString = addr
      ? [
          addr.houseNumber,
          addr.houseName,
          addr.street,
          addr.town,
          addr.postcode,
        ]
          .filter(Boolean)
          .join(", ")
      : apiLead.lead_address;

    return {
      // Core fields
      id: apiLead.id,
      lead_id: apiLead.lead_id || apiLead.id.substring(0, 8).toUpperCase(),
      intellio_id: apiLead.intellio_id ? String(apiLead.intellio_id) : null,
      token_id: apiLead.token_id,
      lead_address: addressString,
      lead_campaign: "pcp",
      lead_status: apiLead.lead_status,
      lead_sold_timestamp: apiLead.lead_sold_timestamp,
      lead_sold_timestamp_txt: formatDate(apiLead.lead_sold_timestamp),
      lead_source: apiLead.lead_source,
      lead_created_at: apiLead.lead_created_at,
      lead_updated_at: apiLead.lead_updated_at,
      campaign: "pcp",
      status: apiLead.lead_sold_timestamp ? "sold" : "nurture",
      name: apiLead.campaignUser?.name || "Unknown",
      email: apiLead.campaignUser?.email || "",
      phone: apiLead.campaignUser?.phoneNumber || "",
      createdAt: formatDate(apiLead.createdAt) || "",
      step: apiLead.completed_steps
        ? `Step ${apiLead.completed_steps}`
        : undefined,
      salutation:
        apiLead.campaignUser?.title || apiLead.formData?.title || null,
      firstName:
        apiLead.campaignUser?.firstName || apiLead.formData?.firstName || null,
      middleName: apiLead.campaignUser?.middleName || null,
      lastName:
        apiLead.campaignUser?.lastName || apiLead.formData?.lastName || null,
      dateOfBirth:
        formatDate(apiLead.campaignUser?.dateOfBirth) ||
        apiLead.formData?.dob ||
        null,
      completed_steps: apiLead.completed_steps || null,

      // Detail fields
      last_credit_check: formatDate(apiLead.last_credit_check),
      credit_check_data: apiLead.credit_check_data,
      loaFileLink: apiLead.loaFileLink || null,
      kyc_decision:
        apiLead.kycDecision?.decision ||
        apiLead.kycDecision?.decisionText ||
        null,
      claims: claims,
      lead_meta_id: apiLead.lead_meta_id,
      lead_meta_ip_address:
        apiLead.lead_meta_ip_address || apiLead.formData?.ip,
      lead_meta_browser_spec:
        apiLead.lead_meta_browser_spec || signature?.userAgent,
      lead_meta_referer: apiLead.lead_meta_referer,
      phoneVerifiedAt: formatDate(apiLead.phoneVerifiedAt),
      campaignUserId: apiLead.campaignUserId,
      formData: apiLead.formData,
      marketingData: apiLead.marketingData,
      apiData: apiLead.apiData,
      jsonData: jsonData,
      apiCallsHistory: apiLead.apiCallsHistory || [],
    };
  }

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  // Holds the full detail record for a PCP lead once fetched (mock or API).
  const [selectedLeadDetail, setSelectedLeadDetail] =
    useState<PCPLeadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCreditData, setShowCreditData] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"all" | "sold" | "nurture">(
    "all",
  );
  const [subCampaignFilter, setSubCampaignFilter] = useState<string>("all");
  const [darkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<
    "core" | "milestones" | "marketing" | "campaign" | "signature" | "workflow"
  >("core");

  /**
   * Opens the modal with the core lead data immediately, then fetches the
   * full detail record if it's a PCP lead.
   *
   * For mock data this simulates a short async delay.
   * Swap the mock lookup for the real fetchPCPLeadDetail() call (see API
   * comment block above) once the endpoint is live.
   */
  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedLeadDetail(null);
    setDetailError(null);
    setActiveTab("core");
    setShowCreditData(false);

    if (lead.campaign === "pcp") {
      setDetailLoading(true);

      fetchPCPLeadDetail(lead.id)
        .then((detail) => {
          setSelectedLeadDetail(detail);
        })
        .catch((err) => {
          setDetailError(err.message);
        })
        .finally(() => {
          setDetailLoading(false);
        });
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setSelectedLeadDetail(null);
    setDetailLoading(false);
    setDetailError(null);
    setIsUpdating(false);
  };

  const CAMPAIGN_GROUPS: Record<string, string[]> = {
    fairpay: [
      "morrisons",
      "asda",
      "sainsburys",
      "coop",
      "justeat",
      "bolt",
      "next",
    ],
    pcp: ["pcp"],
    diesel: ["diesel"],
    dpf: ["dpf"],
  };

  let filteredLeads = leads;
  if (group && CAMPAIGN_GROUPS[group]) {
    filteredLeads = filteredLeads.filter((lead) =>
      CAMPAIGN_GROUPS[group].includes(lead.campaign),
    );
  }

  if (group === "fairpay" && subCampaignFilter !== "all") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.campaign === subCampaignFilter,
    );
  }

  if (statusFilter !== "all") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.status === statusFilter,
    );
  }

  if (search) {
    const term = search.toLowerCase();
    filteredLeads = filteredLeads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.phone.includes(term) ||
        lead.lead_id.toLowerCase().includes(term),
    );
  }

  const handleExportCSV = () => {
    const headers = [
      "Lead ID",
      "Campaign",
      "Status",
      "Name",
      "Email",
      "Phone",
      "Created At",
      "Sold At",
      "Step",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredLeads.map((lead) =>
        [
          lead.lead_id,
          lead.campaign,
          lead.status,
          lead.name,
          lead.email,
          lead.phone,
          lead.createdAt,
          lead.soldAt,
          lead.step,
        ]
          .map((field) => `"${String(field || "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `leads_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: "all" | "sold" | "nurture") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSubCampaignFilterChange = (campaign: string) => {
    setSubCampaignFilter(campaign);
    setCurrentPage(1);
  };

  const isPCPLead = (lead: Lead) => lead.campaign === "pcp";

  const bgColor = darkMode ? "#1e293b" : "#ffffff";
  const textColor = darkMode ? "#f1f5f9" : "#0f172a";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";
  const headerBg = darkMode ? "#0f172a" : "#f8fafc";

  const renderFieldGroup = (title: string, fields: Record<string, any>) => (
    <div
      style={{
        marginBottom: 24,
        padding: 20,
        backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
      }}
    >
      <h4
        style={{
          margin: "0 0 16px 0",
          fontSize: 14,
          fontWeight: 700,
          textTransform: "uppercase",
          color: darkMode ? "#94a3b8" : "#64748b",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {Object.entries(fields).map(([key, value]) => (
          <div
            key={key}
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              {key.includes(" ") ? key : key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span
              style={{
                fontSize: 14,
                color: textColor,
                fontWeight: 500,
              }}
            >
              {value || "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Determine which tabs to show — PCP leads get extra tabs
  const getModalTabs = (lead: Lead) => {
    const baseTabs = [
      { id: "core", label: "Core" },
      { id: "marketing", label: "Marketing" },
      { id: "campaign", label: "Campaign Data" },
    ];
    if (isPCPLead(lead)) {
      return [
        { id: "core", label: "Core" },
        { id: "milestones", label: "Milestones" },
        { id: "marketing", label: "Marketing" },
        { id: "campaign", label: "Claim Data" },
        { id: "signature", label: "Signature/LOA" },
        { id: "workflow", label: "Workflow" },
      ];
    }
    return baseTabs;
  };

  const soldCount = filteredLeads.filter((l) => l.status === "sold").length;
  const nurtureCount = filteredLeads.filter(
    (l) => l.status === "nurture",
  ).length;

  return (
    <ProtectedRoute>
      <div>
        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 28,
          }}
        >
          {[
            {
              label: "Total Leads",
              value: filteredLeads.length,
              color: textColor,
            },
            { label: "Sold Leads", value: soldCount, color: "#22c55e" },
            { label: "Nurture Leads", value: nurtureCount, color: "#94a3b8" },
          ].map((card) => (
            <div
              key={card.label}
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
                {card.label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: card.color }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Search + Status Filter */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Search by name, email, phone, or ID..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
                fontSize: 15,
                backgroundColor: bgColor,
                color: textColor,
                outline: "none",
                transition: "all 0.15s ease",
                boxShadow: darkMode
                  ? "0 2px 4px rgba(0,0,0,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
                e.currentTarget.style.boxShadow = darkMode
                  ? "0 2px 4px rgba(0,0,0,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.05)";
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              backgroundColor: headerBg,
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
            }}
          >
            {[
              { key: "all", label: "All" },
              { key: "sold", label: "Sold" },
              { key: "nurture", label: "Nurture" },
            ].map((status) => (
              <button
                key={status.key}
                onClick={() => handleStatusFilterChange(status.key as any)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    statusFilter === status.key
                      ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                      : "transparent",
                  color: statusFilter === status.key ? "#ffffff" : textColor,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                {status.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
              backgroundColor: bgColor,
              color: textColor,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = darkMode
                ? "#334155"
                : "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = bgColor;
            }}
          >
            <span>📥</span> Export CSV
          </button>
        </div>

        {/* Sub-campaign filter for Fair Pay */}
        {group === "fairpay" && (
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              backgroundColor: headerBg,
              borderRadius: 12,
              border: `1px solid ${borderColor}`,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "all", label: "All" },
              ...CAMPAIGN_GROUPS.fairpay.map((c) => ({ key: c, label: c })),
            ].map((campaign) => (
              <button
                key={campaign.key}
                onClick={() => handleSubCampaignFilterChange(campaign.key)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    subCampaignFilter === campaign.key
                      ? "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)"
                      : "transparent",
                  color:
                    subCampaignFilter === campaign.key ? "#ffffff" : textColor,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                  textTransform: "capitalize",
                }}
              >
                {campaign.label}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div
          style={{
            backgroundColor: bgColor,
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            overflow: "hidden",
            boxShadow: darkMode
              ? "0 4px 6px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: headerBg }}>
                  {[
                    "Campaign",
                    "Status",
                    "Name",
                    "Lead ID",
                    "Email",
                    "Phone",
                    "Created",
                    "Sold",
                    "Step",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: "16px 20px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: darkMode ? "#94a3b8" : "#64748b",
                        letterSpacing: "0.5px",
                        borderBottom: `2px solid ${borderColor}`,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    style={{
                      backgroundColor:
                        idx % 2 === 0
                          ? bgColor
                          : darkMode
                            ? "#1e293b"
                            : "#f8fafc",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = darkMode
                        ? "#334155"
                        : "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        idx % 2 === 0
                          ? bgColor
                          : darkMode
                            ? "#1e293b"
                            : "#f8fafc";
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      <CampaignBadge campaign={lead.campaign} />
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      <StatusBadge status={lead.status} />
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontWeight: 600,
                        color: textColor,
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.name}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.lead_id}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        color: darkMode ? "#94a3b8" : "#64748b",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.email}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.phone}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.createdAt}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.soldAt ?? "-"}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      {lead.step ?? "-"}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {[
                          {
                            label: "View Details",
                            action: () => handleViewDetails(lead),
                          },
                          {
                            label: "Get Nurture Link",
                            action: () => handleViewDetails(lead),
                          },
                          {
                            label: "Unsubscribe",
                            action: () => handleViewDetails(lead),
                          },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            onClick={btn.action}
                            style={{
                              padding: "8px 16px",
                              borderRadius: 8,
                              background:
                                "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                              color: "#ffffff",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 600,
                              transition: "all 0.15s ease",
                              boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 8px rgba(99, 102, 241, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 2px 4px rgba(99, 102, 241, 0.3)";
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedLeads.length === 0 && (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: pcpError ? "red" : "inherit",
                }}
              >
                {pcpLoading
                  ? "Loading PCP leads…"
                  : pcpError
                    ? `Error: ${pcpError}`
                    : "No leads found"}
              </div>

              <div style={{ fontSize: 14 }}>
                Try adjusting your search or filter criteria
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredLeads.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderTop: `1px solid ${borderColor}`,
                backgroundColor: headerBg,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontSize: 14,
                    color: darkMode ? "#94a3b8" : "#64748b",
                  }}
                >
                  Rows per page:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    fontSize: 14,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span
                  style={{
                    fontSize: 14,
                    color: darkMode ? "#94a3b8" : "#64748b",
                  }}
                >
                  {startIndex + 1}–{Math.min(endIndex, filteredLeads.length)} of{" "}
                  {filteredLeads.length}
                </span>

                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "««", page: 1, disabled: currentPage === 1 },
                    {
                      label: "«",
                      page: currentPage - 1,
                      disabled: currentPage === 1,
                    },
                    {
                      label: "»",
                      page: currentPage + 1,
                      disabled: currentPage === totalPages,
                    },
                    {
                      label: "»»",
                      page: totalPages,
                      disabled: currentPage === totalPages,
                    },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() =>
                        !btn.disabled &&
                        setCurrentPage(
                          Math.max(1, Math.min(totalPages, btn.page)),
                        )
                      }
                      disabled={btn.disabled}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: btn.disabled ? headerBg : bgColor,
                        color: btn.disabled
                          ? darkMode
                            ? "#64748b"
                            : "#94a3b8"
                          : textColor,
                        cursor: btn.disabled ? "not-allowed" : "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => handleCloseModal()}
          >
            <div
              style={{
                background: bgColor,
                padding: 0,
                borderRadius: 20,
                width: "90%",
                maxWidth: 900,
                maxHeight: "85vh",
                overflowY: "auto",
                boxShadow: darkMode
                  ? "0 20px 60px rgba(0,0,0,0.5)"
                  : "0 20px 60px rgba(0,0,0,0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "28px 32px",
                  borderBottom: `1px solid ${borderColor}`,
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  borderRadius: "20px 20px 0 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 24,
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      {selectedLead.name}
                    </h2>
                    {/* Show IDs for PCP leads once detail is loaded */}
                    {isPCPLead(selectedLead) && selectedLeadDetail && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "monospace",
                        }}
                      >
                        {selectedLeadDetail.lead_id} ·{" "}
                        {selectedLeadDetail.token_id ?? "—"}
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <CampaignBadge campaign={selectedLead.campaign} />
                      <StatusBadge status={selectedLead.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleCloseModal()}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(255,255,255,0.2)",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.2)";
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Tabs */}
              <div>
                <div
                  style={{
                    display: "flex",
                    padding: "0 32px",
                    borderBottom: `1px solid ${borderColor}`,
                    gap: 24,
                    overflowX: "auto",
                  }}
                >
                  {getModalTabs(selectedLead).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        padding: "16px 0",
                        background: "none",
                        border: "none",
                        borderBottom:
                          activeTab === tab.id
                            ? "2px solid #6366f1"
                            : "2px solid transparent",
                        color:
                          activeTab === tab.id
                            ? "#6366f1"
                            : darkMode
                              ? "#94a3b8"
                              : "#64748b",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div style={{ padding: 32 }}>
                  {/* ── Loading / Error states for PCP detail fetch ── */}
                  {isPCPLead(selectedLead) && detailLoading && (
                    <div
                      style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        color: darkMode ? "#94a3b8" : "#64748b",
                      }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>
                        Loading full record…
                      </div>
                    </div>
                  )}
                  {isPCPLead(selectedLead) && detailError && (
                    <div
                      style={{
                        padding: 20,
                        borderRadius: 12,
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        fontSize: 14,
                      }}
                    >
                      ⚠️ {detailError}
                    </div>
                  )}

                  {/* ── Core Information ── */}
                  {activeTab === "core" &&
                    !detailLoading &&
                    renderFieldGroup("Core", {
                      ...(isPCPLead(selectedLead) && selectedLeadDetail
                        ? {
                            ID: selectedLeadDetail.id,
                            Salutation: selectedLeadDetail.salutation,
                            "First Name": selectedLeadDetail.firstName,
                            "Middle Name(s)": selectedLeadDetail.middleName,
                            "Last Name": selectedLeadDetail.lastName,
                            Email: selectedLeadDetail.email,
                            "Date of Birth": selectedLeadDetail.dateOfBirth,
                            "Phone Number": selectedLeadDetail.phone,
                            "Intellio ID": selectedLeadDetail.intellio_id,
                            "Token ID": selectedLeadDetail.token_id,
                            "Lead Address": selectedLeadDetail.lead_address,
                            "Lead Campaign":
                              selectedLeadDetail.lead_campaign.toUpperCase(),
                            "Lead Status": selectedLeadDetail.lead_status,
                            "Lead Source": selectedLeadDetail.lead_source,
                            "Sold Timestamp":
                              selectedLeadDetail.lead_sold_timestamp_txt,
                            "Created At": selectedLeadDetail.lead_created_at,
                            "Updated At": selectedLeadDetail.lead_updated_at,
                          }
                        : {
                            Created: selectedLead.createdAt,
                            "Sold At": selectedLead.soldAt,
                            Email: selectedLead.email,
                            Phone: selectedLead.phone,
                            "Date of Birth": selectedLead.dob,
                            Address: selectedLead.address,
                            Step: selectedLead.step,
                          }),
                    })}

                  {/* ── Milestones ── */}
                  {activeTab === "milestones" &&
                    isPCPLead(selectedLead) &&
                    !detailLoading &&
                    selectedLeadDetail && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {[
                          "User Submits Details",
                          "Valid8 API (Address)",
                          "Signature",
                          "Generate Letters",
                          "Send Complaints",
                          "Claim Acknowledgement",
                          "Offer Received",
                          "Offer Accepted",
                        ].map((milestone, idx) => {
                          const isCompleted =
                            (selectedLeadDetail.completed_steps ?? 0) >=
                            idx + 1;
                          return (
                            <div
                              key={milestone}
                              style={{
                                padding: "16px 20px",
                                backgroundColor: isCompleted
                                  ? darkMode
                                    ? "rgba(22, 163, 74, 0.2)"
                                    : "#dcfce7"
                                  : darkMode
                                    ? "rgba(220, 38, 38, 0.2)"
                                    : "#fee2e2",
                                borderRadius: 12,
                                border: `1px solid ${
                                  isCompleted
                                    ? darkMode
                                      ? "rgba(22, 163, 74, 0.5)"
                                      : "#86efac"
                                    : darkMode
                                      ? "rgba(220, 38, 38, 0.5)"
                                      : "#fca5a5"
                                }`,
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                color: textColor,
                                fontWeight: 600,
                              }}
                            >
                              <span style={{ fontSize: 20 }}>
                                {isCompleted ? "✅" : "❌"}
                              </span>
                              <span>
                                {idx + 1}. {milestone}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* ── Marketing (PCP: from meta + marketingData) ── */}
                  {activeTab === "marketing" &&
                    !detailLoading &&
                    (isPCPLead(selectedLead) && selectedLeadDetail ? (
                      <>
                        {renderFieldGroup("Marketing & Meta", {
                          "Meta ID": selectedLeadDetail.lead_meta_id,
                          "IP Address": selectedLeadDetail.lead_meta_ip_address,
                          "Browser Spec":
                            selectedLeadDetail.lead_meta_browser_spec,
                          Referer: selectedLeadDetail.lead_meta_referer,
                          "Phone Verified At":
                            selectedLeadDetail.phoneVerifiedAt,
                          "Campaign User ID": selectedLeadDetail.campaignUserId,
                          "Marketing Opt-in": String(
                            (selectedLeadDetail.marketingData as any)?.optIn ??
                              "—",
                          ),
                          "Privacy Policy": String(
                            (selectedLeadDetail.marketingData as any)
                              ?.privacyPolicy ?? "—",
                          ),
                        })}
                        {renderFieldGroup("UTM Tracking", {
                          "UTM Source":
                            (selectedLeadDetail.marketingData as any)
                              ?.utmSource ?? "—",
                          "UTM Campaign":
                            (selectedLeadDetail.marketingData as any)
                              ?.utmCampaign ?? "—",
                          "UTM Medium":
                            (selectedLeadDetail.marketingData as any)
                              ?.utmMedium ?? "—",
                          "UTM Content":
                            (selectedLeadDetail.marketingData as any)
                              ?.utmContent ?? "—",
                          "UTM Term":
                            (selectedLeadDetail.marketingData as any)
                              ?.utmTerm ?? "—",
                          "UTM Device":
                            (selectedLeadDetail.marketingData as any)
                              ?.utmDevice ?? "—",
                        })}
                      </>
                    ) : (
                      renderFieldGroup("Marketing", {
                        "Marketing Opt-in": selectedLead.marketing,
                        "Privacy Policy": selectedLead.privacyPolicy,
                      })
                    ))}

                  {/* ── Claim Data (PCP: credit check + claims list) / Campaign Data (others) ── */}
                  {activeTab === "campaign" &&
                    !detailLoading &&
                    (isPCPLead(selectedLead) ? (
                      selectedLeadDetail ? (
                        <>
                          {/* Credit Check — always shown first */}
                          <div
                            style={{
                              marginBottom: 24,
                              padding: 20,
                              backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                              borderRadius: 12,
                              border: `1px solid ${borderColor}`,
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 16px 0",
                                fontSize: 14,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: darkMode ? "#94a3b8" : "#64748b",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Credit Check
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: darkMode ? "#94a3b8" : "#64748b",
                                  }}
                                >
                                  Last Credit Check
                                </span>
                                <span
                                  style={{
                                    fontSize: 14,
                                    color: textColor,
                                    fontWeight: 500,
                                  }}
                                >
                                  {selectedLeadDetail.last_credit_check ?? "—"}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: darkMode ? "#94a3b8" : "#64748b",
                                  }}
                                >
                                  Credit Data
                                </span>
                                {selectedLeadDetail.credit_check_data ? (
                                  <div>
                                    <div
                                      style={{
                                        maxHeight: showCreditData
                                          ? "none"
                                          : "100px",
                                        overflow: "hidden",
                                        backgroundColor: darkMode
                                          ? "#0f172a"
                                          : "#ffffff",
                                        padding: 12,
                                        borderRadius: 8,
                                        border: `1px solid ${borderColor}`,
                                        fontFamily: "monospace",
                                        fontSize: 12,
                                        whiteSpace: "pre-wrap",
                                        color: textColor,
                                        position: "relative",
                                      }}
                                    >
                                      {JSON.stringify(
                                        selectedLeadDetail.credit_check_data,
                                        null,
                                        2,
                                      )}
                                      {!showCreditData && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: "40px",
                                            background: `linear-gradient(to bottom, transparent, ${darkMode ? "#0f172a" : "#ffffff"})`,
                                          }}
                                        />
                                      )}
                                    </div>
                                    <button
                                      onClick={() =>
                                        setShowCreditData(!showCreditData)
                                      }
                                      style={{
                                        marginTop: 8,
                                        background: "none",
                                        border: "none",
                                        color: "#6366f1",
                                        cursor: "pointer",
                                        padding: 0,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      {showCreditData
                                        ? "View Less"
                                        : "View More"}
                                      <span style={{ fontSize: 10 }}>
                                        {showCreditData ? "▲" : "▼"}
                                      </span>
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: 14,
                                      color: textColor,
                                      fontWeight: 500,
                                    }}
                                  >
                                    —
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Claims list */}
                          <div style={{ marginBottom: 24 }}>
                            <h4
                              style={{
                                margin: "0 0 16px 0",
                                fontSize: 14,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: darkMode ? "#94a3b8" : "#64748b",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Claims ({selectedLeadDetail.claims.length})
                            </h4>

                            {selectedLeadDetail.claims.length === 0 ? (
                              <div
                                style={{
                                  padding: 20,
                                  backgroundColor: darkMode
                                    ? "#1e293b"
                                    : "#f8fafc",
                                  borderRadius: 12,
                                  border: `1px solid ${borderColor}`,
                                  color: darkMode ? "#94a3b8" : "#64748b",
                                  fontSize: 14,
                                }}
                              >
                                No claims on file.
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 12,
                                }}
                              >
                                {[...selectedLeadDetail.claims]
                                  .sort((a, b) => {
                                    const aValid = a.status === "valid";
                                    const bValid = b.status === "valid";
                                    if (aValid && !bValid) return -1;
                                    if (!aValid && bValid) return 1;
                                    return 0;
                                  })
                                  .map((claim, idx) => {
                                    const isValid = claim.status === "valid";
                                    const isInvalid =
                                      claim.status === "invalid";
                                    const bg = isValid
                                      ? darkMode
                                        ? "rgba(22, 163, 74, 0.2)"
                                        : "#dcfce7"
                                      : isInvalid
                                        ? darkMode
                                          ? "rgba(220, 38, 38, 0.2)"
                                          : "#fee2e2"
                                        : darkMode
                                          ? "#1e293b"
                                          : "#f8fafc";
                                    const border = isValid
                                      ? darkMode
                                        ? "rgba(22, 163, 74, 0.5)"
                                        : "#86efac"
                                      : isInvalid
                                        ? darkMode
                                          ? "rgba(220, 38, 38, 0.5)"
                                          : "#fca5a5"
                                        : borderColor;

                                    return (
                                      <div
                                        key={claim.id}
                                        style={{
                                          padding: 20,
                                          backgroundColor: bg,
                                          borderRadius: 12,
                                          border: `1px solid ${border}`,
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: darkMode
                                              ? "#94a3b8"
                                              : "#64748b",
                                            marginBottom: 12,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                          }}
                                        >
                                          <span>
                                            Claim {idx + 1} — {claim.id}
                                          </span>
                                          {isValid && (
                                            <span style={{ fontSize: 16 }}>
                                              ✅ Valid
                                            </span>
                                          )}
                                          {isInvalid && (
                                            <span style={{ fontSize: 16 }}>
                                              ❌ Invalid
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: 12,
                                          }}
                                        >
                                          {[
                                            {
                                              label: "Lender",
                                              value: claim.lender,
                                            },
                                            {
                                              label: "Agreement Date",
                                              value: claim.agreement_date,
                                            },
                                            {
                                              label: "Agreement Number",
                                              value:
                                                claim.agreement_number ?? "—",
                                            },
                                            {
                                              label: "Vehicle Registration",
                                              value:
                                                claim.vehicle_registration ??
                                                "—",
                                            },
                                            {
                                              label: "ID Submitted",
                                              value: claim.id_submitted,
                                            },
                                            {
                                              label: "Signed LOA",
                                              value: claim.signed_loa,
                                            },
                                          ].map(({ label, value }) => (
                                            <div
                                              key={label}
                                              style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 4,
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontSize: 12,
                                                  fontWeight: 600,
                                                  color: darkMode
                                                    ? "#94a3b8"
                                                    : "#64748b",
                                                }}
                                              >
                                                {label}
                                              </span>
                                              <span
                                                style={{
                                                  fontSize: 14,
                                                  color: textColor,
                                                  fontWeight: 500,
                                                }}
                                              >
                                                {value}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        !detailError && (
                          <div
                            style={{
                              padding: 20,
                              color: darkMode ? "#94a3b8" : "#64748b",
                            }}
                          >
                            Awaiting detail load…
                          </div>
                        )
                      )
                    ) : (
                      renderFieldGroup(
                        "Campaign Specific Data",
                        Object.fromEntries(
                          Object.entries(selectedLead).filter(
                            ([key]) =>
                              ![
                                "id",
                                "lead_id",
                                "name",
                                "campaign",
                                "status",
                                "createdAt",
                                "soldAt",
                                "email",
                                "phone",
                                "dob",
                                "address",
                                "marketing",
                                "privacyPolicy",
                                "step",
                              ].includes(key),
                          ),
                        ),
                      )
                    ))}

                  {/* ── Signature (PCP only, from jsonData) ── */}
                  {activeTab === "signature" &&
                    isPCPLead(selectedLead) &&
                    !detailLoading &&
                    (selectedLeadDetail ? (
                      <div>
                        {renderFieldGroup("KYC", {
                          "KYC Decision":
                            selectedLeadDetail.kyc_decision ?? "—",
                        })}
                        {renderFieldGroup("Signature Audit Trail", {
                          "Signature ID":
                            (selectedLeadDetail.jsonData as any)?.signatureId ??
                            "—",
                          "Signature Timestamp":
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureTimestamp ?? "—",
                          "Signature IP Address":
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureIpAddress ?? "—",
                          "User Agent":
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureUserAgent ?? "—",
                          "Device Type":
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureDeviceType ?? "—",
                          "Operating System":
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureOperatingSystem ?? "—",
                          Browser:
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureBrowser ?? "—",
                          "Document Hash":
                            (selectedLeadDetail.jsonData as any)
                              ?.signatureDocumentHash ?? "—",
                        })}
                        {(selectedLeadDetail.jsonData as any)
                          ?.signatureImagePng ? (
                          <div
                            style={{
                              padding: 20,
                              backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                              borderRadius: 12,
                              border: `1px solid ${borderColor}`,
                            }}
                          >
                            <h4
                              style={{
                                margin: "0 0 16px 0",
                                fontSize: 14,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: darkMode ? "#94a3b8" : "#64748b",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Signature
                            </h4>
                            <img
                              src={
                                (selectedLeadDetail.jsonData as any)
                                  .signatureImagePng
                              }
                              alt="Signature"
                              style={{
                                maxWidth: "100%",
                                borderRadius: 8,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: "#ffffff",
                                padding: 8,
                              }}
                            />
                            <button
                              onClick={() => {
                                window.location.href =
                                  "mailto:thomas@maddisonclarke.co.uk?body=PCP%20test";
                              }}
                              style={{
                                padding: "10px 16px",
                                borderRadius: 8,
                                background:
                                  "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                color: "#ffffff",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 14,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                boxShadow: "0 2px 4px rgba(99, 102, 241, 0.3)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 8px rgba(99, 102, 241, 0.4)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 4px rgba(99, 102, 241, 0.3)";
                              }}
                            >
                              Verify Signature ✅
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: 20,
                              backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                              borderRadius: 12,
                              border: `1px solid ${borderColor}`,
                              color: darkMode ? "#94a3b8" : "#64748b",
                              fontSize: 14,
                            }}
                          >
                            No signature image on file.
                          </div>
                        )}

                        <div style={{ marginTop: 32 }}>
                          <h4
                            style={{
                              margin: "0 0 16px 0",
                              fontSize: 14,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: darkMode ? "#94a3b8" : "#64748b",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Letter of Authority (LOA)
                          </h4>
                          {selectedLeadDetail.loaFileLink ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                              }}
                            >
                              {/*                             <div
                              style={{
                                height: "600px",
                                backgroundColor: darkMode
                                  ? "#1e293b"
                                  : "#f8fafc",
                                borderRadius: 12,
                                border: `1px solid ${borderColor}`,
                                overflow: "hidden",
                              }}
                            >
                              <iframe
                                src={selectedLeadDetail.loaFileLink}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  border: "none",
                                }}
                                title="LOA PDF"
                              />
                            </div> */}
                              <a
                                href={selectedLeadDetail.loaFileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  alignSelf: "flex-start",
                                  padding: "10px 16px",
                                  borderRadius: 8,
                                  background:
                                    "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                  color: "#ffffff",
                                  textDecoration: "none",
                                  fontSize: 14,
                                  fontWeight: 600,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  boxShadow:
                                    "0 2px 4px rgba(99, 102, 241, 0.3)",
                                }}
                              >
                                <span>📄</span> Open PDF in New Tab
                              </a>
                            </div>
                          ) : (
                            <div
                              style={{
                                padding: 20,
                                backgroundColor: darkMode
                                  ? "#1e293b"
                                  : "#f8fafc",
                                borderRadius: 12,
                                border: `1px solid ${borderColor}`,
                                color: darkMode ? "#94a3b8" : "#64748b",
                                fontSize: 14,
                              }}
                            >
                              No LOA document on file.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      !detailError && (
                        <div
                          style={{
                            padding: 20,
                            color: darkMode ? "#94a3b8" : "#64748b",
                          }}
                        >
                          Awaiting detail load…
                        </div>
                      )
                    ))}

                  {/* ── Workflow (PCP only) ── */}
                  {activeTab === "workflow" &&
                    isPCPLead(selectedLead) &&
                    !detailLoading &&
                    selectedLeadDetail && (
                      <div
                        style={{
                          padding: 20,
                          backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
                          borderRadius: 12,
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <h4
                          style={{
                            margin: "0 0 16px 0",
                            fontSize: 14,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: darkMode ? "#94a3b8" : "#64748b",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Workflow History
                        </h4>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            marginBottom: 32,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div style={{ width: 24, textAlign: "center" }}>
                              📝
                            </div>
                            <div style={{ fontSize: 14, color: textColor }}>
                              Lead submitted at{" "}
                              <strong>
                                {selectedLeadDetail.createdAt || "Unknown"}
                              </strong>
                            </div>
                          </div>

                          {selectedLeadDetail.last_credit_check && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div style={{ width: 24, textAlign: "center" }}>
                                💳
                              </div>
                              <div style={{ fontSize: 14, color: textColor }}>
                                Credit check completed at{" "}
                                <strong>
                                  {selectedLeadDetail.last_credit_check}
                                </strong>
                              </div>
                            </div>
                          )}

                          {(selectedLeadDetail.jsonData as any)
                            ?.signatureTimestamp && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div style={{ width: 24, textAlign: "center" }}>
                                ✍️
                              </div>
                              <div style={{ fontSize: 14, color: textColor }}>
                                Signature received at{" "}
                                <strong>
                                  {
                                    (selectedLeadDetail.jsonData as any)
                                      .signatureTimestamp
                                  }
                                </strong>
                              </div>
                            </div>
                          )}
                        </div>

                        <h4
                          style={{
                            margin: "0 0 16px 0",
                            fontSize: 14,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: darkMode ? "#94a3b8" : "#64748b",
                            letterSpacing: "0.5px",
                            borderTop: `1px solid ${borderColor}`,
                            paddingTop: 24,
                          }}
                        >
                          Workflow Actions
                        </h4>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          {(() => {
                            const isActive =
                              selectedLeadDetail.lead_status ===
                              "check_signature";
                            return (
                              <button
                                disabled={!isActive}
                                onClick={() => {
                                  window.location.href =
                                    "mailto:thomas@maddisonclarke.co.uk?body=PCP%20No%20Signature%20Follow%20Up";
                                }}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: 8,
                                  background: isActive
                                    ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                                    : darkMode
                                      ? "#334155"
                                      : "#e2e8f0",
                                  color: isActive
                                    ? "#ffffff"
                                    : darkMode
                                      ? "#94a3b8"
                                      : "#94a3b8",
                                  border: "none",
                                  cursor: isActive ? "pointer" : "not-allowed",
                                  fontSize: 14,
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  boxShadow: isActive
                                    ? "0 2px 4px rgba(99, 102, 241, 0.3)"
                                    : "none",
                                  opacity: isActive ? 1 : 0.7,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <span>📧</span> Send 'No Signature' Email
                              </button>
                            );
                          })()}

                          {(() => {
                            const hasSignature = !!(
                              selectedLeadDetail.jsonData as any
                            )?.signatureTimestamp;
                            const isActive =
                              selectedLeadDetail.lead_status ===
                                "check_signature" && hasSignature;
                            const buttonText = isUpdating
                              ? "Updating..."
                              : "Mark Signature As Verified";

                            return (
                              <button
                                disabled={!isActive || isUpdating}
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      "Are you sure you want to verify this signature?",
                                    )
                                  )
                                    return;

                                  setIsUpdating(true);
                                  try {
                                    const res = await fetch(
                                      "/api/pcp-leads/update-status",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          leadId: selectedLeadDetail.id,
                                          status: "Signature Verified",
                                        }),
                                      },
                                    );

                                    if (!res.ok)
                                      throw new Error(
                                        "Failed to update status",
                                      );

                                    // Refresh the detail view to show new status
                                    handleViewDetails(selectedLead);
                                    alert("Signature verified successfully!");
                                  } catch (err) {
                                    alert(
                                      "Error updating status. Please try again.",
                                    );
                                    console.error(err);
                                  } finally {
                                    setIsUpdating(false);
                                  }
                                }}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: 8,
                                  background: isActive
                                    ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                                    : darkMode
                                      ? "#334155"
                                      : "#e2e8f0",
                                  color: isActive
                                    ? "#ffffff"
                                    : darkMode
                                      ? "#94a3b8"
                                      : "#94a3b8",
                                  border: "none",
                                  cursor:
                                    isActive && !isUpdating
                                      ? "pointer"
                                      : "not-allowed",
                                  fontSize: 14,
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  boxShadow: isActive
                                    ? "0 2px 4px rgba(34, 197, 94, 0.3)"
                                    : "none",
                                  opacity: isActive && !isUpdating ? 1 : 0.7,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <span>✅</span> {buttonText}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
