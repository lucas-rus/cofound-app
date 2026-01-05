package com.cofound.dto;

import lombok.Data;

@Data
public class ProjectDto {
    private String title;
    private String description;
    private Integer teamSizeNeeded; // optional; default 0 if null
    private java.util.List<String> requiredSkills; // optional; default empty if null
}