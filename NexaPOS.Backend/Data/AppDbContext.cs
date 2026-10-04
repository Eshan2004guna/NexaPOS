using Microsoft.EntityFrameworkCore;
using NexaPOS.Backend.Models;

namespace NexaPOS.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);

            entity.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(p => p.SKU)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(p => p.Barcode)
                .HasMaxLength(100);

            entity.Property(p => p.Category)
                .HasMaxLength(100);

            entity.Property(p => p.CostPrice)
                .HasColumnType("decimal(18,2)");

            entity.Property(p => p.SellingPrice)
                .HasColumnType("decimal(18,2)");

            entity.HasIndex(p => p.SKU)
                .IsUnique();
        });
    }
}