import type { ExtractionResultSchema } from "../../schemas/extraction.js";

type ActionIntent =
  | "notify_ops"
  | "confirm_eta_vendor"
  | "update_customer_eta"
  | "review_allocation"
  | "coordinate_customs"
  | "check_port_congestion"
  | "prepare_weather_reroute"
  | "resolve_equipment_capacity"
  | "align_procurement_recovery"
  | "update_dock_labor_schedule"
  | "watch_shipment_exception"
  | "leadership_escalation"
  | "request_vendor_confirmation";

const ACTION_COPY: Record<ActionIntent, string> = {
  notify_ops: "Notify downstream operations.",
  confirm_eta_vendor: "Confirm revised ETA with vendor.",
  update_customer_eta: "Update customer-facing ETA commitments.",
  review_allocation: "Review affected allocation plans.",
  coordinate_customs: "Coordinate with customs broker.",
  check_port_congestion: "Check carrier update on port and terminal congestion.",
  prepare_weather_reroute: "Prepare backup routing for weather disruption.",
  resolve_equipment_capacity: "Adjust pickup and equipment scheduling.",
  align_procurement_recovery: "Align procurement and vendor recovery plan.",
  update_dock_labor_schedule: "Update dock and labor schedule.",
  watch_shipment_exception: "Set exception watch for the shipment reference.",
  leadership_escalation: "Escalate lane impact summary to operations leadership.",
  request_vendor_confirmation: "Request written vendor confirmation and contingency options."
};

const ACTION_PRIORITY: Record<ActionIntent, number> = {
  confirm_eta_vendor: 100,
  update_dock_labor_schedule: 95,
  notify_ops: 90,
  coordinate_customs: 88,
  update_customer_eta: 84,
  review_allocation: 82,
  align_procurement_recovery: 80,
  check_port_congestion: 78,
  resolve_equipment_capacity: 76,
  prepare_weather_reroute: 74,
  watch_shipment_exception: 70,
  request_vendor_confirmation: 68,
  leadership_escalation: 66
};

export function deriveRecommendedActions(
  result: Omit<ExtractionResultSchema, "recommendedActions">
): string[] {
  if (result.logisticsRelevant === false) {
    return ["No logistics follow-up is required for this message."];
  }

  const intents = new Set<ActionIntent>();
  const issue = result.issueType.toLowerCase();
  const cause = result.cause?.toLowerCase() ?? "";

  intents.add("notify_ops");

  if (result.shipmentReference) {
    intents.add("watch_shipment_exception");
  }

  if (result.delayDays !== null && result.delayDays >= 2) {
    intents.add("confirm_eta_vendor");
    intents.add("update_customer_eta");
    intents.add("update_dock_labor_schedule");
  } else if (result.delayDays === 1 || result.updatedEta) {
    intents.add("confirm_eta_vendor");
    intents.add("update_dock_labor_schedule");
  }

  if (result.updatedEta && result.delayDays === null) {
    intents.add("confirm_eta_vendor");
  }

  if (issue.includes("delay") || issue.includes("congestion") || issue.includes("weather")) {
    intents.add("review_allocation");
  }

  if (issue.includes("shortage") || cause.includes("shortage")) {
    intents.add("align_procurement_recovery");
    intents.add("review_allocation");
  }

  if (cause.includes("customs") || issue.includes("customs")) {
    intents.add("coordinate_customs");
  }

  if (cause.includes("port congestion") || cause.includes("terminal")) {
    intents.add("check_port_congestion");
  }

  if (cause.includes("weather")) {
    intents.add("prepare_weather_reroute");
  }

  if (cause.includes("equipment") || cause.includes("drayage") || cause.includes("chassis")) {
    intents.add("resolve_equipment_capacity");
  }

  if (result.impactedLocation) {
    intents.add("review_allocation");
  }

  if (result.severity === "high") {
    intents.add("leadership_escalation");
  }

  if (result.cause) {
    intents.add("request_vendor_confirmation");
  }

  // Semantic dedupe: keep one timing-focused action if overlaps stack up.
  if (
    intents.has("confirm_eta_vendor") &&
    intents.has("update_customer_eta") &&
    intents.has("update_dock_labor_schedule")
  ) {
    intents.delete("update_customer_eta");
  }

  if (intents.size === 0) {
    return ["Review operational impact and decide next steps."];
  }
  if (intents.size === 1 && intents.has("notify_ops")) {
    intents.add("request_vendor_confirmation");
  }

  const ranked = [...intents].sort(
    (a, b) => (ACTION_PRIORITY[b] ?? 0) - (ACTION_PRIORITY[a] ?? 0)
  );
  const capped = ranked.slice(0, 4);
  const actions = capped.map((intent) => ACTION_COPY[intent]);
  return actions.length > 0 ? actions : ["Review operational impact and decide next steps."];
}
