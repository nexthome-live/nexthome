package com.nexthome.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexthome.app.dto.VacancyRequest;
import com.nexthome.app.repository.VacancyRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SearchControllerTest {

    private static final double BENGALURU_LAT = 12.9716;
    private static final double BENGALURU_LON = 77.5946;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VacancyRepository vacancyRepository;

    @AfterEach
    void cleanup() {
        vacancyRepository.deleteAll();
    }

    @Test
    void nearbyReturnsMatchingVacancies() throws Exception {
        createVacancyWithCoords(BENGALURU_LAT, BENGALURU_LON);

        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", String.valueOf(BENGALURU_LAT))
                        .param("longitude", String.valueOf(BENGALURU_LON))
                        .param("radiusKm", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Nearby test room"))
                .andExpect(jsonPath("$[0].distanceKm").isNumber());
    }

    @Test
    void nearbyReturnsEmptyListWhenNoVacanciesWithinRadius() throws Exception {
        createVacancyWithCoords(BENGALURU_LAT, BENGALURU_LON);

        // Search at a location far away (Gulf of Guinea)
        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", "0.0")
                        .param("longitude", "0.0")
                        .param("radiusKm", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void nearbyUsesDefaultRadiusWhenNotProvided() throws Exception {
        createVacancyWithCoords(BENGALURU_LAT, BENGALURU_LON);

        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", String.valueOf(BENGALURU_LAT))
                        .param("longitude", String.valueOf(BENGALURU_LON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void nearbyRejectsTooLargeLatitude() throws Exception {
        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", "91.0")
                        .param("longitude", "0.0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nearbyRejectsTooSmallLatitude() throws Exception {
        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", "-91.0")
                        .param("longitude", "0.0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nearbyRejectsTooLargeLongitude() throws Exception {
        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", "0.0")
                        .param("longitude", "181.0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nearbyRejectsNegativeRadius() throws Exception {
        mockMvc.perform(get("/api/search/nearby")
                        .param("latitude", String.valueOf(BENGALURU_LAT))
                        .param("longitude", String.valueOf(BENGALURU_LON))
                        .param("radiusKm", "-1"))
                .andExpect(status().isBadRequest());
    }

    private void createVacancyWithCoords(double latitude, double longitude) throws Exception {
        VacancyRequest request = new VacancyRequest(
                "Nearby test room",
                "Room near the search point",
                "SHARED",
                new BigDecimal("7000"),
                "Bengaluru",
                "MG Road, Bengaluru",
                latitude,
                longitude,
                "tester",
                null
        );
        mockMvc.perform(post("/api/vacancies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
