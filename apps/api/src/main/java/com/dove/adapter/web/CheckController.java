package com.dove.adapter.web;

import com.dove.adapter.persistence.StationEntity;
import com.dove.adapter.persistence.StationRepository;
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
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
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
  private final StationRepository stationRepository;

  @Autowired
  public CheckController(
      CheckTicketUseCase checkTicketUseCase, Optional<StationRepository> stationRepository) {
    this.checkTicketUseCase =
        Objects.requireNonNull(checkTicketUseCase, "checkTicketUseCase must not be null");
    this.stationRepository = stationRepository.orElse(null);
  }

  public CheckController(CheckTicketUseCase checkTicketUseCase) {
    this(checkTicketUseCase, Optional.empty());
  }

  private String resolveStationName(String stationCode) {
    if (stationRepository != null && stationCode != null) {
      return stationRepository
          .findByCode(stationCode)
          .map(StationEntity::getName)
          .orElse(stationCode);
    }
    return stationCode;
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
    String stationName = resolveStationName(request.stationCode());
    return ResponseEntity.ok(CheckTicketResponse.from(outcome, stationName));
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
    String stationName = resolveStationName(request.stationCode());
    List<CheckTicketResponse> results =
        outcomes.stream().map(o -> CheckTicketResponse.from(o, stationName)).toList();
    return ResponseEntity.ok(
        BatchCheckResponse.of(request.stationCode(), stationName, request.drawDate(), results));
  }
}
