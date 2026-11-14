# ==============================================================================
# Multi-Stage Dockerfile for DoVe Backend API (Spring Boot 4 / Java 21)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build JAR using Maven Wrapper
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper configuration and dependencies descriptor
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Convert line endings if built on Windows and ensure executable permission
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Resolve dependencies cache
RUN ./mvnw dependency:go-offline -B

# Copy application source code
COPY src/ src/

# Package executable JAR (skip tests during container build as tests run in CI)
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal hardened production runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Create non-root system group and user
RUN addgroup -S dove && adduser -S dove -G dove

WORKDIR /app

# Copy executable jar from builder stage with proper ownership
COPY --from=builder --chown=dove:dove /build/target/*.jar app.jar

# Run as non-root user
USER dove:dove

EXPOSE 8080

# Built-in healthcheck probing Actuator endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Container-friendly JVM memory configuration
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
