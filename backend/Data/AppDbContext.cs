using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>()
            .HasIndex(x => x.Name)
            .IsUnique();

        modelBuilder.Entity<Project>()
            .HasMany(x => x.Tasks)
            .WithOne(x => x.Project)
            .HasForeignKey(x => x.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProjectTask>()
            .HasMany(x => x.Comments)
            .WithOne(x => x.Task)
            .HasForeignKey(x => x.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is Project project && entry.State == EntityState.Added)
            {
                project.CreatedAt = now;
            }

            if (entry.Entity is ProjectTask task)
            {
                if (entry.State == EntityState.Added)
                {
                    task.CreatedAt = now;
                    task.UpdatedAt = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    task.UpdatedAt = now;
                }
            }

            if (entry.Entity is Comment comment && entry.State == EntityState.Added)
            {
                comment.CreatedAt = now;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
