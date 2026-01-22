package com.cofound.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProjectDto {
    @NotBlank(message = "Title is required")
    @Size(max = 50, message = "Title cannot exceed 50 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @Min(value = 1, message = "Team size must be at least 1")
    private Integer teamSizeNeeded; // optional; default 0 if null
    
    private java.util.List<String> requiredSkills; // optional; default empty if null

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTeamSizeNeeded() {
        return teamSizeNeeded;
    }

    public void setTeamSizeNeeded(Integer teamSizeNeeded) {
        this.teamSizeNeeded = teamSizeNeeded;
    }

    public java.util.List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(java.util.List<String> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
}
