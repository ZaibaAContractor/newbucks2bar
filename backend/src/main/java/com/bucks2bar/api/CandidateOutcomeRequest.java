package com.bucks2bar.api;

import java.time.LocalDate;

public class CandidateOutcomeRequest {
  private String university;
  private String comment;
  private String benchStatus;
  private LocalDate benchStartDate;
  private LocalDate benchEndDate;
  private LocalDate deploymentDate;
  private LocalDate projectStartDate;
  private String projectCode;
  private String projectName;

  public String getUniversity() { return university; }
  public void setUniversity(String university) { this.university = university; }
  public String getComment() { return comment; }
  public void setComment(String comment) { this.comment = comment; }
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
}
