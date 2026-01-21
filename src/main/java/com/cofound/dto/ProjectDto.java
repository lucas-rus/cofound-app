package com.cofound.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectDto {
    @NotBlank(message = "Title is required")
    @Size(max = 50, message = "Title cannot exceed 50 characters")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @Min(value = 1, message = "Team size must be at least 1")
    private Integer teamSizeNeeded; // optional; default 0 if null
    
    private java.util.List<String> requiredSkills; // optional; default empty if null
}