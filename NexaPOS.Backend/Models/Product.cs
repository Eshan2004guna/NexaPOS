namespace NexaPOS.Backend.Models;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string SKU { get; set; } = string.Empty;

    public string Barcode { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal CostPrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int Stock { get; set; }

    public int ReorderLevel { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}