namespace NexaPOS.Backend.DTOs;

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;

    public string SKU { get; set; } = string.Empty;

    public string Barcode { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public decimal CostPrice { get; set; }

    public decimal SellingPrice { get; set; }

    public int Stock { get; set; }

    public int ReorderLevel { get; set; }
}