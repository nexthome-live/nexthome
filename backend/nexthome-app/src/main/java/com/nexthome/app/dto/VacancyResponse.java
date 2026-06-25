package com.nexthome.app.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record VacancyResponse(
        Long id,
        String title,
        String description,
        String roomType,
        BigDecimal rent,
        String city,
        String address,
        Double latitude,
        Double longitude,
        String createdBy,
        String contactEmail,
        Instant createdAt,
        Double distanceKm
) {
}
