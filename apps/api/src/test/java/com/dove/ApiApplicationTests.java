package com.dove;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class ApiApplicationTests {

  @MockitoBean private DataSource dataSource;

  @Autowired private ApplicationContext applicationContext;

  @Test
  void contextLoads() {
    assertThat(applicationContext).isNotNull();
  }
}
