package com.bucks2bar.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "candidates")
public class Candidate {
  @Id
  private String id;

  @Column(nullable = false)
  private String name;

  private String university;
  private Double m11Score;
  private Double l1Score;
  private Double finalScore;
  private String progressRating;
  @Column(length = 2000)
  private String comment;
  private String finalOutcome;
  private String benchStatus;
  private LocalDate benchStartDate;
  private LocalDate benchEndDate;
  private LocalDate deploymentDate;
  private LocalDate projectStartDate;
  private String projectCode;
  private String projectName;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "batch_id")
  private TrainingBatch batch;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getUniversity() { return university; }
  public void setUniversity(String university) { this.university = university; }
  public Double getM11Score() { return m11Score; }
  public void setM11Score(Double m11Score) { this.m11Score = m11Score; }
  public Double getL1Score() { return l1Score; }
  public void setL1Score(Double l1Score) { this.l1Score = l1Score; }
  public Double getFinalScore() { return finalScore; }
  public void setFinalScore(Double finalScore) { this.finalScore = finalScore; }
  public String getProgressRating() { return progressRating; }
  public void setProgressRating(String progressRating) { this.progressRating = progressRating; }
  public String getComment() { return comment; }
  public void setComment(String comment) { this.comment = comment; }
  public String getFinalOutcome() { return finalOutcome; }
  public void setFinalOutcome(String finalOutcome) { this.finalOutcome = finalOutcome; }
  public String getBenchStatus() { return benchStatus; }
  public void setBenchStatus(String benchStatus) { this.benchStatus = benchStatus; }
  public LocalDate getBenchStartDate() { return benchStartDate; }
  public void setBenchStartDate(LocalDate benchStartDate) { this.benchStartDate = benchStartDate; }
  public LocalDate getBenchEndDate() { return benchEndDate; }
  public void setBenchEndDate(LocalDate benchEndDate) { this.benchEndDate = benchEndDate; }
  public LocalDate getDeploymentDate() { return deploymentDate; }
  public void setDeploymentDate(LocalDate deploymentDate) { this.deploymentDate = deploymentDate; }
  public LocalDate getProjectStartDate() { return projectStartDate; }
  public void setProjectStartDate(LocalDate projectStartDate) { this.projectStartDate = projectStartDate; }
  public String getProjectCode() { return projectCode; }
  public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
  public String getProjectName() { return projectName; }
  public void setProjectName(String projectName) { this.projectName = projectName; }
  public TrainingBatch getBatch() { return batch; }
  public void setBatch(TrainingBatch batch) { this.batch = batch; }
}
