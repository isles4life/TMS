using TMS.Domain.Entities.Loads;

namespace TMS.Application.Repositories;

/// <summary>
/// Repository interface for Proof of Delivery operations
/// </summary>
public interface IProofOfDeliveryRepository
{
    Task<ProofOfDelivery?> GetByIdAsync(string id);
    Task<ProofOfDelivery?> GetByLoadIdAsync(string loadId);
    Task<ProofOfDelivery?> GetByTripIdAsync(string tripId);
    Task<List<ProofOfDelivery>> GetByDriverIdAsync(string driverId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<List<ProofOfDelivery>> GetByStatusAsync(int status);
    
    /// <summary>
    /// Get PODs that need attention (missing signature, photos, etc.)
    /// </summary>
    Task<List<ProofOfDelivery>> GetPendingAsync();

    Task<ProofOfDelivery> CreateAsync(ProofOfDelivery pod);
    Task<ProofOfDelivery> UpdateAsync(ProofOfDelivery pod);
    Task<bool> DeleteAsync(string id);

    /// <summary>
    /// Check if a load has an existing POD
    /// </summary>
    Task<bool> ExistsByLoadIdAsync(string loadId);
}

/// <summary>
/// Repository interface for POD photos
/// </summary>
public interface IPODPhotoRepository
{
    Task<PODPhoto?> GetByIdAsync(string id);
    Task<List<PODPhoto>> GetByProofOfDeliveryIdAsync(string podId);
    Task<List<PODPhoto>> GetByTypeAsync(string podId, int photoType);
    
    Task<PODPhoto> CreateAsync(PODPhoto photo);
    Task<bool> DeleteAsync(string id);
    Task<bool> DeleteAllByProofOfDeliveryIdAsync(string podId);

    /// <summary>
    /// Get total file size of all photos in a POD (for quota management)
    /// </summary>
    Task<long> GetTotalFileSizeAsync(string podId);
}
