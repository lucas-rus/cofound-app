package com.cofound.dto;

import com.cofound.model.Project;
import com.cofound.model.User;
import java.util.ArrayList;
import java.util.List;

public class ProjectSummaryDto {
    public Long id;
    public String title;
    public String description;
    public String status;
    public Integer teamSizeNeeded;
    public List<String> requiredSkills;
    public OwnerDto owner;
    public int membersCount;
    public String lastMessageAt;
    public long messageCount;
    public long pendingApplicationsCount; // NEW

    public ProjectSummaryDto(Project project) {
        this(project, null, 0, 0);
    }

    public ProjectSummaryDto(Project project, String lastMessageAt, long messageCount, long pendingApplicationsCount) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
        this.status = project.getStatus();
        this.teamSizeNeeded = project.getTeamSizeNeeded();
        this.requiredSkills = project.getRequiredSkills() != null
                ? new ArrayList<>(project.getRequiredSkills())
                : List.of();
        this.owner = new OwnerDto(project.getOwner());
        this.membersCount = (project.getMembers() != null ? project.getMembers().size() : 0) + 1;
        this.lastMessageAt = lastMessageAt;
        this.messageCount = messageCount;
        this.pendingApplicationsCount = pendingApplicationsCount;
    }

    public static class OwnerDto {
        public Long id;
        public String username;
        public OwnerDto(User owner) {
            this.id = owner.getId();
            this.username = owner.getUsername();
        }
    }
}