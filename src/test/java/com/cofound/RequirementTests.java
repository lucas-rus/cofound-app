package com.cofound;

import com.cofound.controller.ProjectController;
import com.cofound.dto.ProjectDto;
import com.cofound.dto.ProjectSummaryDto;
import com.cofound.model.Project;
import com.cofound.model.User;
import com.cofound.repository.ProjectRepository;
import com.cofound.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RequirementTests {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Principal principal;

    @InjectMocks
    private ProjectController projectController;

    // --- Constructor Tests ---

    @Test
    public void testUserConstructor() {
        User user = new User();
        assertNotNull(user);
        user.setUsername("testuser");
        assertEquals("testuser", user.getUsername());
    }

    @Test
    public void testProjectConstructor() {
        Project project = new Project();
        assertNotNull(project);
        project.setTitle("Test Project");
        assertEquals("Test Project", project.getTitle());
    }

    // --- Functional Tests ---

    @Test
    public void testCreateProject() {
        // Setup
        String username = "testuser";
        User user = new User();
        user.setUsername(username);

        ProjectDto dto = new ProjectDto();
        dto.setTitle("New Project");
        dto.setDescription("Description");

        when(principal.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(projectRepository.save(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        // Execute
        ResponseEntity<Project> response = projectController.createProject(dto, principal);

        // Verify
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("New Project", response.getBody().getTitle());
        assertEquals(user, response.getBody().getOwner());
    }

    @Test
    public void testGetAvailableProjects() {
        when(projectRepository.findAll()).thenReturn(java.util.Collections.emptyList());
        ResponseEntity<List<ProjectSummaryDto>> response = projectController.getAvailableProjects();
        assertEquals(0, response.getBody().size());
    }
}
