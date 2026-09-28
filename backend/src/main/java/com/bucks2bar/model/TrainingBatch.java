package com.bucks2bar.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "training_batches")
public class TrainingBatch {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  private String cohort;
  private LocalDate startDate;
  private LocalDate endDate;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "mentor_id")
  private Mentor mentor;

  @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<Candidate> candidates = new ArrayList<>();

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getCohort() { return cohort; }
  public void setCohort(String cohort) { this.cohort = cohort; }
  public LocalDate getStartDate() { return startDate; }
  public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
  public LocalDate getEndDate() { return endDate; }
  public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
  public Mentor getMentor() { return mentor; }
  public void setMentor(Mentor mentor) { this.mentor = mentor; }
  public List<Candidate> getCandidates() { return candidates; }
  public void setCandidates(List<Candidate> candidates) { this.candidates = candidates; }
}
