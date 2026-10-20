import { t } from "@/i18n";

// Order statuses are stored in English in the database (orders_status_check).
// The UI always shows the label from here, in the visitor's language.
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  processing: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const getOrderStatusLabel = (status: string | null | undefined) =>
  (status && ORDER_STATUS_LABELS[status]) || t("Ожидает");
