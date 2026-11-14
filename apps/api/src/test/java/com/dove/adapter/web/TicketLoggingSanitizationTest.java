package com.dove.adapter.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.dove.adapter.web.dto.BatchCheckRequest;
import com.dove.adapter.web.dto.CheckTicketRequest;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("T05.17 - NFR-06 Privacy: Ticket Numbers Logging Sanitization Specification")
class TicketLoggingSanitizationTest {

  @Test
  @DisplayName("CheckTicketRequest.toString() che giấu số vé bằng ****** để ngăn log lộ số vé")
  void checkTicketRequest_toString_masksTicket() {
    String sensitiveTicket = "654321";
    CheckTicketRequest request =
        new CheckTicketRequest(sensitiveTicket, "tp-hcm", LocalDate.of(2026, 11, 9));

    String stringRep = request.toString();

    assertThat(stringRep).doesNotContain(sensitiveTicket);
    assertThat(stringRep).contains("ticket=******");
    assertThat(stringRep).contains("stationCode=tp-hcm");
  }

  @Test
  @DisplayName("BatchCheckRequest.toString() chỉ hiển thị số lượng vé, không in danh sách số vé")
  void batchCheckRequest_toString_masksAllTickets() {
    String ticket1 = "111111";
    String ticket2 = "222222";
    BatchCheckRequest request =
        new BatchCheckRequest(List.of(ticket1, ticket2), "tp-hcm", LocalDate.of(2026, 11, 9));

    String stringRep = request.toString();

    assertThat(stringRep).doesNotContain(ticket1);
    assertThat(stringRep).doesNotContain(ticket2);
    assertThat(stringRep).contains("ticketCount=2");
    assertThat(stringRep).contains("stationCode=tp-hcm");
  }
}
