package com.bucks2bar.api;

import com.bucks2bar.model.Candidate;
import com.bucks2bar.repository.CandidateRepository;
import javax.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {
  private final CandidateRepository candidateRepository;

  public CandidateController(CandidateRepository candidateRepository) {
    this.candidateRepository = candidateRepository;
  }

  @PutMapping("/{id}/outcome")
  @Transactional
  public Candidate updateOutcome(
      @PathVariable String id,
      @RequestBody CandidateOutcomeRequest request) {
    Candidate candidate = candidateRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

    candidate.setUniversity(request.getUniversity());
    candidate.setComment(request.getComment());
    candidate.setBenchStatus(request.getBenchStatus());
    candidate.setBenchStartDate(request.getBenchStartDate());
    candidate.setBenchEndDate(request.getBenchEndDate());
    candidate.setDeploymentDate(request.getDeploymentDate());
    candidate.setProjectStartDate(request.getProjectStartDate());
    candidate.setProjectCode(request.getProjectCode());
    candidate.setProjectName(request.getProjectName());
    return candidate;
  }
}
