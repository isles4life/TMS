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
/// Repository implementation for Proof of Delivery operations
/// </summary>
public class ProofOfDeliveryRepository : IProofOfDeliveryRepository
{
    private readonly TMSDbContext _context;

    public ProofOfDeliveryRepository(TMSDbContext context)
    {
        _context = context;
    }

    public async Task<ProofOfDelivery?> GetByIdAsync(string id)
    {
        return await _context.ProofsOfDelivery
            .Include(p => p.Photos)
            .FirstOrDefaultAsync(p => p.Id.ToString() == id);
    }

    public async Task<ProofOfDelivery?> GetByLoadIdAsync(string loadId)
    {
        return await _context.ProofsOfDelivery
            .Include(p => p.Photos)
            .FirstOrDefaultAsync(p => p.LoadId == loadId);
    }

    public async Task<ProofOfDelivery?> GetByTripIdAsync(string tripId)
    {
        return await _context.ProofsOfDelivery
            .Include(p => p.Photos)
            .FirstOrDefaultAsync(p => p.TripId == tripId);
    }

    public async Task<List<ProofOfDelivery>> GetByDriverIdAsync(string driverId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var query = _context.ProofsOfDelivery
            .Where(p => p.DriverId == driverId)
            .Include(p => p.Photos)
            .AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(p => p.DeliveryDateTime >= fromDate);

        if (toDate.HasValue)
            query = query.Where(p => p.DeliveryDateTime <= toDate);

        return await query.OrderByDescending(p => p.DeliveryDateTime).ToListAsync();
    }

    public async Task<List<ProofOfDelivery>> GetByStatusAsync(int status)
    {
        return await _context.ProofsOfDelivery
            .Where(p => (int)p.Status == status)
            .Include(p => p.Photos)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<ProofOfDelivery>> GetPendingAsync()
    {
        return await _context.ProofsOfDelivery
            .Where(p => p.Status == PODStatus.Draft || p.Status == PODStatus.Pending)
            .Include(p => p.Photos)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<ProofOfDelivery> CreateAsync(ProofOfDelivery pod)
    {
        _context.ProofsOfDelivery.Add(pod);
        await _context.SaveChangesAsync();
        return pod;
    }

    public async Task<ProofOfDelivery> UpdateAsync(ProofOfDelivery pod)
    {
        _context.ProofsOfDelivery.Update(pod);
        await _context.SaveChangesAsync();
        return pod;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var pod = await GetByIdAsync(id);
        if (pod == null)
            return false;

        _context.ProofsOfDelivery.Remove(pod);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsByLoadIdAsync(string loadId)
    {
        return await _context.ProofsOfDelivery.AnyAsync(p => p.LoadId == loadId);
    }
}
