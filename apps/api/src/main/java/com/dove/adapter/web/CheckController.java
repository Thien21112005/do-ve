package com.dove.adapter.web;

import com.dove.adapter.web.dto.BatchCheckRequest;
import com.dove.adapter.web.dto.BatchCheckResponse;
import com.dove.adapter.web.dto.CheckTicketRequest;
import com.dove.adapter.web.dto.CheckTicketResponse;
import com.dove.application.CheckTicketUseCase;
import com.dove.domain.CheckOutcome;
import com.dove.domain.TicketNumber;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST controller for checking lottery tickets. */
@RestController
@RequestMapping("/api/v1/check")
@Tag(name = "Check", description = "Dò vé số kiến thiết miền Nam (hỗ trợ dò 1 vé và dò theo lô)")
public class CheckController {

  private final CheckTicketUseCase checkTicketUseCase;

  public CheckController(CheckTicketUseCase checkTicketUseCase) {
    this.checkTicketUseCase =
        Objects.requireNonNull(checkTicketUseCase, "checkTicketUseCase must not be null");
  }

  @PostMapping
  @Operation(
      summary = "Dò 1 vé số",
      description =
          "Dò vé 6 chữ số theo đài và ngày mở thưởng. Trả về kết quả trúng thưởng chi tiết theo từng hạng giải và tổng tiền thưởng.")
  public ResponseEntity<CheckTicketResponse> checkTicket(
      @Valid @RequestBody CheckTicketRequest request) {
    TicketNumber ticketNumber = TicketNumber.parse(request.ticket());
    CheckOutcome outcome =
        checkTicketUseCase.check(ticketNumber, request.stationCode(), request.drawDate());
    return ResponseEntity.ok(CheckTicketResponse.from(outcome));
  }

  @PostMapping("/batch")
  @Operation(
      summary = "Dò theo lô (tối đa 20 vé)",
      description =
          "Dò danh sách tối đa 20 vé số trong cùng 1 kỳ quay. Trả về kết quả từng vé và tổng tiền trúng thưởng gộp.")
  public ResponseEntity<BatchCheckResponse> checkBatch(
      @Valid @RequestBody BatchCheckRequest request) {
    List<TicketNumber> tickets = request.tickets().stream().map(TicketNumber::parse).toList();
    List<CheckOutcome> outcomes =
        checkTicketUseCase.checkBatch(tickets, request.stationCode(), request.drawDate());
    List<CheckTicketResponse> results = outcomes.stream().map(CheckTicketResponse::from).toList();
    return ResponseEntity.ok(
        BatchCheckResponse.of(request.stationCode(), request.drawDate(), results));
  }
}
