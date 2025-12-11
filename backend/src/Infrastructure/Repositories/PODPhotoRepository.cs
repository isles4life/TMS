using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TMS.Domain.Repositories;
using TMS.Domain.Entities.Loads;
using TMS.Infrastructure.Persistence;

namespace TMS.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for POD photos
/// </summary>
public class PODPhotoRepository : IPODPhotoRepository
{
    private readonly TMSDbContext _context;

    public PODPhotoRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<PODPhoto?> GetByIdAsync(Guid id)
    {
        return await _context.PODPhotos
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<PODPhoto>> GetByProofOfDeliveryIdAsync(Guid podId)
    {
        return await _context.PODPhotos
            .Where(p => p.ProofOfDeliveryId == podId)
            .OrderByDescending(p => p.CapturedDateTime)
            .ToListAsync();
    }

    public async Task<List<PODPhoto>> GetByTypeAsync(Guid podId, int photoType)
    {
        return await _context.PODPhotos
            .Where(p => p.ProofOfDeliveryId == podId && (int)p.PhotoType == photoType)
            .OrderByDescending(p => p.CapturedDateTime)
            .ToListAsync();
    }

    public async Task<PODPhoto> CreateAsync(PODPhoto photo)
    {
        _context.PODPhotos.Add(photo);
        await _context.SaveChangesAsync();
        return photo;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var photo = await GetByIdAsync(id);
        if (photo == null) return false;

        _context.PODPhotos.Remove(photo);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAllByProofOfDeliveryIdAsync(Guid podId)
    {
        var photos = await GetByProofOfDeliveryIdAsync(podId);
        if (photos.Count == 0) return false;

        _context.PODPhotos.RemoveRange(photos);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<long> GetTotalFileSizeAsync(Guid podId)
    {
        return await _context.PODPhotos
            .Where(p => p.ProofOfDeliveryId == podId)
            .SumAsync(p => p.FileSizeBytes);
    }
}
