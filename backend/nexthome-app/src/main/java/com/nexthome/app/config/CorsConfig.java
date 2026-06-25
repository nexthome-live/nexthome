package com.nexthome.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:*}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${cors.allowed-headers:Content-Type,Accept,Authorization,X-Management-Token}")
    private String allowedHeaders;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // No cookies/credentials: keep allow-origin as a literal header (not "*").
        config.setAllowCredentials(false);

        String trimmedOrigins = allowedOrigins.trim();
        if (trimmedOrigins.isEmpty() || "*".equals(trimmedOrigins)) {
            // Wildcard: must use allowedOriginPatterns (not allowedOrigins) since
            // setAllowCredentials would otherwise force a literal origin.
            config.setAllowedOriginPatterns(List.of("*"));
        } else {
            config.setAllowedOrigins(Arrays.stream(trimmedOrigins.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).toList());
        }

        config.setAllowedMethods(Arrays.stream(allowedMethods.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList());

        // Use allowedHeaders as explicit list. If you want to allow any header in dev,
        // set CORS_ALLOWED_HEADERS=* (or omit the entry from the comma list).
        config.setAllowedHeaders(Arrays.stream(allowedHeaders.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList());

        // Expose the management-token header so frontend JS can read it on responses
        // (in addition to the body, which is the normal path).
        config.setExposedHeaders(List.of("X-Management-Token"));

        // Cache preflight results for an hour to avoid round-trips on every request.
        config.setMaxAge(maxAge);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
