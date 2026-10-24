import type {
  CustomerRefundRequest,
  RefundOrderView,
  RefundStage,
} from "@/@types/Refund.type";
import { formatPrice } from "@/utils/formatPrice";
import { formatDateTime } from "@/utils/formatTime";
import { REFUND_REASON_LABEL } from "@/utils/refund-selection";
import RefundEvidence from "./RefundEvidence";

const STAGE_LABEL: Record<RefundStage, string> = {
  awaiting_review: "Chờ duyệt",
  awaiting_return: "Chờ nhận hàng trả",
  awaiting_payout: "Đã duyệt, chờ hoàn tiền",
  payout_in_progress: "Đang hoàn tiền",
  refunded: "Đã hoàn tiền",
  rejected: "Đã từ chối",
};

const STAGE_HINT: Partial<Record<RefundStage, string>> = {
  awaiting_return:
    "Vui lòng gửi hàng trả theo hướng dẫn của cửa hàng bên dưới. Tiền chỉ được hoàn sau khi cửa hàng nhận và kiểm tra hàng.",
  awaiting_payout:
    "Yêu cầu đã được duyệt. Cửa hàng chưa hoàn tiền — bạn sẽ thấy xác nhận tại đây khi khoản hoàn được ghi nhận.",
  payout_in_progress:
    "Cửa hàng đang thực hiện hoàn tiền. Bạn sẽ thấy xác nhận tại đây khi hoàn tất.",
};

/** Chỉ các mốc dành cho khách; mốc điều phối nội bộ (nhận/nhả xử lý hoàn tiền, kiểm hàng từng phần) không hiển thị */
const EVENT_LABEL: Record<string, string> = {
  submitted: "Đã gửi yêu cầu",
  decided: "Cửa hàng đã duyệt yêu cầu",
  rejected: "Cửa hàng đã từ chối yêu cầu",
  return_received: "Cửa hàng đã nhận đủ hàng trả",
  payout_recorded: "Đã ghi nhận hoàn tiền",
};

const RETURN_LABEL = { return: "Gửi trả hàng", no_return: "Không gửi trả" };

interface RefundHistoryProps {
  view: RefundOrderView;
  sessionToken?: string;
}

function RequestCard({
  request,
  view,
  sessionToken,
  index,
}: {
  request: CustomerRefundRequest;
  view: RefundOrderView;
  sessionToken?: string;
  index: number;
}) {
  const decided = request.stage !== "awaiting_review";
  const events = request.history.filter(
    (entry) => entry.event in EVENT_LABEL || entry.customerMessage
  );
  return (
    <li
      aria-label={`Yêu cầu hoàn tiền ${index}`}
      className="rounded-lg border border-white-300 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold">Yêu cầu {index}</h3>
        <span className="rounded-full bg-white-100 px-3 py-1 text-xs font-semibold text-dark-500">
          {STAGE_LABEL[request.stage]}
        </span>
      </div>
      <p className="mt-1 text-xs text-dark-400">
        Gửi lúc {formatDateTime(request.submittedAt)}
      </p>
      {STAGE_HINT[request.stage] && (
        <p className="mt-2 text-sm text-dark-500">
          {STAGE_HINT[request.stage]}
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {request.items.map((item) => {
          const allocation = view.allocations.find(
            (entry) => entry.allocationId === item.allocationId
          );
          const name = allocation?.productName ?? "Sản phẩm";
          return (
            <li
              key={item.allocationId}
              className="border-t border-white-200 pt-3 first:border-t-0 first:pt-0"
            >
              <p className="text-sm font-semibold">
                {name}
                {allocation?.variantLabel && ` · ${allocation.variantLabel}`}
              </p>
              <p className="mt-0.5 text-sm text-dark-500">
                {REFUND_REASON_LABEL[item.reason]} · yêu cầu {item.quantity} ·{" "}
                {RETURN_LABEL[item.requestedReturn]}
              </p>
              <p className="mt-0.5 text-sm text-dark-400">
                &ldquo;{item.explanation}&rdquo;
              </p>
              {decided && request.stage !== "rejected" && (
                <p className="mt-0.5 text-sm text-dark-500">
                  Được duyệt {item.approvedQuantity}/{item.quantity}
                  {item.approvedQuantity > 0 &&
                    ` · ${formatPrice(item.approvedAmount)}`}
                  {item.returnRequired &&
                    item.approvedQuantity > 0 &&
                    ` · đã nhận trả ${item.receivedQuantity}/${item.approvedQuantity}`}
                </p>
              )}
              {item.evidenceIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.evidenceIds.map((evidenceId, evidenceIndex) => (
                    <RefundEvidence
                      key={evidenceId}
                      orderNumber={view.orderNumber}
                      evidenceId={evidenceId}
                      label={`Ảnh bằng chứng ${evidenceIndex + 1} cho ${name}`}
                      sessionToken={sessionToken}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {request.shipping.approvedAmount > 0 && (
        <p className="mt-3 text-sm text-dark-500">
          Phí vận chuyển được duyệt hoàn:{" "}
          {formatPrice(request.shipping.approvedAmount)}
        </p>
      )}
      {request.payout && (
        <p className="mt-3 text-sm font-semibold text-dark-700">
          Đã hoàn {formatPrice(request.payout.amount)} lúc{" "}
          {formatDateTime(request.payout.paidAt)}
        </p>
      )}

      {events.length > 0 && (
        <ol className="mt-3 space-y-2 border-t border-white-200 pt-3">
          {events.map((entry) => (
            <li key={`${entry.event}-${entry.at}`} className="text-sm">
              <span className="text-dark-400">{formatDateTime(entry.at)}</span>{" "}
              <span className="font-medium">
                {EVENT_LABEL[entry.event] ?? "Thông báo từ cửa hàng"}
              </span>
              {entry.customerMessage && (
                <p className="mt-0.5 whitespace-pre-line text-dark-500">
                  {entry.customerMessage}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

/** Lịch sử luôn hiện sau khi hết hạn gửi — khách còn theo dõi trả hàng/hoàn tiền của yêu cầu cũ */
export default function RefundHistory({
  view,
  sessionToken,
}: RefundHistoryProps) {
  if (!view.requests.length) return null;
  return (
    <div>
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-dark-300">
        Yêu cầu đã gửi
      </h3>
      <ul className="space-y-3">
        {view.requests.map((request, index) => (
          <RequestCard
            key={request.requestId}
            request={request}
            view={view}
            sessionToken={sessionToken}
            index={index + 1}
          />
        ))}
      </ul>
    </div>
  );
}
