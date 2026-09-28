package com.bucks2bar.seed;

import com.bucks2bar.model.Candidate;
import com.bucks2bar.model.Mentor;
import com.bucks2bar.model.TrainingBatch;
import com.bucks2bar.repository.CandidateRepository;
import com.bucks2bar.repository.MentorRepository;
import com.bucks2bar.repository.TrainingBatchRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements ApplicationRunner {
  private final CandidateRepository candidateRepository;
  private final MentorRepository mentorRepository;
  private final TrainingBatchRepository batchRepository;
  private final ObjectMapper objectMapper;

  public DatabaseSeeder(
      CandidateRepository candidateRepository,
      MentorRepository mentorRepository,
      TrainingBatchRepository batchRepository,
      ObjectMapper objectMapper) {
    this.candidateRepository = candidateRepository;
    this.mentorRepository = mentorRepository;
    this.batchRepository = batchRepository;
    this.objectMapper = objectMapper;
  }

  @Override
  public void run(ApplicationArguments args) throws IOException {
    if (candidateRepository.count() > 0) {
      return;
    }

    ClassPathResource seedFile = new ClassPathResource("seed/candidates.json");
    List<Map<String, Object>> rows;
    try (InputStream input = seedFile.getInputStream()) {
      rows = objectMapper.readValue(input, new TypeReference<List<Map<String, Object>>>() {});
    }

    Map<String, Mentor> mentors = new HashMap<>();
    Map<String, TrainingBatch> batches = new HashMap<>();
    for (Map<String, Object> row : rows) {
      String mentorName = text(row, "mentorName");
      Mentor mentor = mentors.get(mentorName);
      if (mentor == null) {
        mentor = mentorRepository.save(newMentor(mentorName));
        mentors.put(mentorName, mentor);
      }

      String batchName = text(row, "batchName");
      TrainingBatch batch = batches.get(batchName);
      if (batch == null) {
        batch = new TrainingBatch();
        batch.setName(batchName);
        batch.setCohort(text(row, "cohort"));
        batch.setMentor(mentor);
        batch = batchRepository.save(batch);
        batches.put(batchName, batch);
      }

      Candidate candidate = new Candidate();
      candidate.setId(text(row, "id"));
      candidate.setName(text(row, "name"));
      candidate.setUniversity(text(row, "university"));
      candidate.setM11Score(number(row, "m11Score"));
      candidate.setL1Score(number(row, "l1Score"));
      candidate.setFinalScore(number(row, "finalScore"));
      candidate.setProgressRating(text(row, "progressRating"));
      candidate.setComment(text(row, "comment"));
      candidate.setFinalOutcome(text(row, "finalOutcome"));
      candidate.setBatch(batch);
      candidateRepository.save(candidate);
    }
  }

  private Mentor newMentor(String name) {
    Mentor mentor = new Mentor();
    mentor.setName(name);
    return mentor;
  }

  private String text(Map<String, Object> row, String key) {
    Object value = row.get(key);
    return value == null ? null : value.toString();
  }

  private Double number(Map<String, Object> row, String key) {
    Object value = row.get(key);
    return value instanceof Number ? ((Number) value).doubleValue() : null;
  }
}
