package com.cofound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectUpdatePostDto {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @NotBlank(message = "Update content cannot be empty")
    @Size(max = 3000, message = "Update content cannot exceed 3000 characters")
    private String content;

    private String imageUrl; // NEW FIELD for updating/removing image
}
