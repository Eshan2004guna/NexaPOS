using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NexaPOS.Backend.Data;
using NexaPOS.Backend.DTOs;
using NexaPOS.Backend.Models;

namespace NexaPOS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _context.Products
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Barcode = p.Barcode,
                Category = p.Category,
                CostPrice = p.CostPrice,
                SellingPrice = p.SellingPrice,
                Stock = p.Stock,
                ReorderLevel = p.ReorderLevel,
                IsActive = p.IsActive
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Where(p => p.Id == id)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                SKU = p.SKU,
                Barcode = p.Barcode,
                Category = p.Category,
                CostPrice = p.CostPrice,
                SellingPrice = p.SellingPrice,
                Stock = p.Stock,
                ReorderLevel = p.ReorderLevel,
                IsActive = p.IsActive
            })
            .FirstOrDefaultAsync();

        if (product == null)
        {
            return NotFound(new
            {
                message = "Product not found."
            });
        }

        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(
        CreateProductDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new
            {
                message = "Product name is required."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.SKU))
        {
            return BadRequest(new
            {
                message = "SKU is required."
            });
        }

        var skuExists = await _context.Products
            .AnyAsync(p => p.SKU == dto.SKU);

        if (skuExists)
        {
            return Conflict(new
            {
                message = "A product with this SKU already exists."
            });
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            SKU = dto.SKU.Trim(),
            Barcode = dto.Barcode?.Trim() ?? string.Empty,
            Category = dto.Category?.Trim() ?? string.Empty,
            CostPrice = dto.CostPrice,
            SellingPrice = dto.SellingPrice,
            Stock = dto.Stock,
            ReorderLevel = dto.ReorderLevel,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var result = new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            SKU = product.SKU,
            Barcode = product.Barcode,
            Category = product.Category,
            CostPrice = product.CostPrice,
            SellingPrice = product.SellingPrice,
            Stock = product.Stock,
            ReorderLevel = product.ReorderLevel,
            IsActive = product.IsActive
        };

        return CreatedAtAction(
            nameof(GetProduct),
            new { id = product.Id },
            result);
    }

    // PUT: api/products/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(
        int id,
        CreateProductDto dto)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new
            {
                message = "Product not found."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new
            {
                message = "Product name is required."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.SKU))
        {
            return BadRequest(new
            {
                message = "SKU is required."
            });
        }

        var skuExists = await _context.Products
            .AnyAsync(p => p.SKU == dto.SKU && p.Id != id);

        if (skuExists)
        {
            return Conflict(new
            {
                message = "A product with this SKU already exists."
            });
        }

        product.Name = dto.Name.Trim();
        product.SKU = dto.SKU.Trim();
        product.Barcode = dto.Barcode?.Trim() ?? string.Empty;
        product.Category = dto.Category?.Trim() ?? string.Empty;
        product.CostPrice = dto.CostPrice;
        product.SellingPrice = dto.SellingPrice;
        product.Stock = dto.Stock;
        product.ReorderLevel = dto.ReorderLevel;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/products/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new
            {
                message = "Product not found."
            });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}