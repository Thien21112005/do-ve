package com.dove.adapter.scheduler;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulerConfiguration {

  @Bean
  @ConditionalOnMissingBean(Clock.class)
  public Clock clock() {
    return Clock.system(ZoneId.of("Asia/Ho_Chi_Minh"));
  }
}
