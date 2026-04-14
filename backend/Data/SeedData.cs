using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        if (await context.Projects.AnyAsync())
        {
            return;
        }

        var project = new Project
        {
            Name = "Sample Project",
            Description = "Seeded project for getting started quickly."
        };
        context.Projects.Add(project);
        await context.SaveChangesAsync();

        var task1 = new ProjectTask
        {
            ProjectId = project.Id,
            Title = "Set up backend",
            Description = "Create controllers and services.",
            Priority = TaskPriority.High,
            Status = Models.TaskStatus.InProgress,
            DueDate = DateTime.UtcNow.Date.AddDays(2)
        };
        var task2 = new ProjectTask
        {
            ProjectId = project.Id,
            Title = "Create dashboard UI",
            Priority = TaskPriority.Medium,
            Status = Models.TaskStatus.Todo,
            DueDate = DateTime.UtcNow.Date.AddDays(7)
        };

        context.Tasks.AddRange(task1, task2);
        await context.SaveChangesAsync();

        context.Comments.Add(new Comment
        {
            TaskId = task1.Id,
            Author = "System",
            Body = "Initial seeded comment."
        });
        await context.SaveChangesAsync();
    }
}
