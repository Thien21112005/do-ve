package com.dove.adapter.scheduler;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulerConfiguration {

  @Bean
  @ConditionalOnMissingBean(Clock.class)
  public Clock clock(@Value("${dove.scheduler.zone:Asia/Ho_Chi_Minh}") String zoneId) {
    return Clock.system(ZoneId.of(zoneId));
  }
}
