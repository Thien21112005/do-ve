package com.dove;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** Hexagonal rule (ADR-002): domain and application never depend on adapters (T13.10). */
@DisplayName("T13.10 - Hexagonal dependency direction")
class ArchitectureBoundaryTest {

  private static final Path SRC = Path.of("src", "main", "java", "com", "dove");

  private static List<String> offendingImports(String layer, String... forbiddenPrefixes)
      throws IOException {
    try (Stream<Path> files = Files.walk(SRC.resolve(layer))) {
      return files
          .filter(p -> p.toString().endsWith(".java"))
          .flatMap(
              p -> {
                try {
                  return Files.readAllLines(p).stream()
                      .filter(l -> l.startsWith("import "))
                      .filter(l -> Stream.of(forbiddenPrefixes).anyMatch(l::contains))
                      .map(l -> SRC.relativize(p) + ": " + l);
                } catch (IOException e) {
                  throw new IllegalStateException(e);
                }
              })
          .toList();
    }
  }

  @Test
  @DisplayName("application/ does not import com.dove.adapter")
  void applicationDoesNotImportAdapters() throws IOException {
    assertThat(offendingImports("application", "com.dove.adapter")).isEmpty();
  }

  @Test
  @DisplayName("domain/ imports neither adapters, application, Spring nor JPA")
  void domainIsPure() throws IOException {
    assertThat(
            offendingImports(
                "domain",
                "com.dove.adapter",
                "com.dove.application",
                "org.springframework",
                "jakarta.persistence"))
        .isEmpty();
  }
}
