using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TMS.Application.DTOs;
using TMS.Domain.Repositories;
using TMS.Domain.Entities.Loads;
using TMS.Domain.Common;

namespace TMS.Application.Services;

/// <summary>
/// Service for managing Proof of Delivery operations
/// </summary>
public class ProofOfDeliveryService : IProofOfDeliveryService
{
    private readonly IProofOfDeliveryRepository _podRepository;
    private readonly IPODPhotoRepository _photoRepository;
    private const long MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB per photo
    private const long MAX_TOTAL_PHOTOS_SIZE = 100 * 1024 * 1024; // 100MB total per POD

    public ProofOfDeliveryService(
        IProofOfDeliveryRepository podRepository,
        IPODPhotoRepository photoRepository)
    {
        _podRepository = podRepository;
        _photoRepository = photoRepository;
    }

    public async Task<ApiResponse<ProofOfDeliveryDto>> CreateProofOfDeliveryAsync(CreateProofOfDeliveryDto dto)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(dto.LoadId))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("LoadId is required");

            // Check if POD already exists for this load
            if (await _podRepository.ExistsByLoadIdAsync(dto.LoadId))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("A proof of delivery already exists for this load");

            var pod = new ProofOfDelivery
            {
                Id = Guid.NewGuid(),
                TripId = dto.TripId,
                LoadId = dto.LoadId,
                DriverId = dto.DriverId,
                Status = PODStatus.Draft,
                DeliveryDateTime = dto.DeliveryDateTime,
                DeliveryLocation = dto.DeliveryLocation,
                DeliveryLatitude = dto.DeliveryLatitude,
                DeliveryLongitude = dto.DeliveryLongitude,
                EstimatedDeliveryDateTime = dto.EstimatedDeliveryDateTime,
                ExceptionNotes = dto.ExceptionNotes,
                CreatedAt = DateTime.UtcNow
            };

            // Calculate if delivery is on-time
            if (dto.EstimatedDeliveryDateTime.HasValue)
            {
                pod.IsOnTime = dto.DeliveryDateTime <= dto.EstimatedDeliveryDateTime;
            }

            var createdPod = await _podRepository.CreateAsync(pod);
            var podDto = MapToDto(createdPod);

            return ApiResponse<ProofOfDeliveryDto>.CreateSuccess(podDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Error creating proof of delivery: {ex.Message}");
        }
    }

    public async Task<ApiResponse<ProofOfDeliveryDto>> SignProofOfDeliveryAsync(SignProofOfDeliveryDto dto)
    {
        try
        {
            var pod = await _podRepository.GetByIdAsync(dto.ProofOfDeliveryId);
            if (pod == null)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Proof of delivery not found");

            if (string.IsNullOrWhiteSpace(dto.SignatureData))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Signature data is required");

            if (string.IsNullOrWhiteSpace(dto.RecipientName))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Recipient name is required");

            pod.RecipientName = dto.RecipientName;
            pod.SignatureData = dto.SignatureData;
            pod.DeliveryNotes = dto.DeliveryNotes;
            pod.DeliveryLatitude = dto.DeliveryLatitude ?? pod.DeliveryLatitude;
            pod.DeliveryLongitude = dto.DeliveryLongitude ?? pod.DeliveryLongitude;
            pod.Status = PODStatus.Signed;
            pod.UpdatedAt = DateTime.UtcNow;

            var updatedPod = await _podRepository.UpdateAsync(pod);
            var podDto = MapToDto(updatedPod);

            return ApiResponse<ProofOfDeliveryDto>.CreateSuccess(podDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Error signing proof of delivery: {ex.Message}");
        }
    }

    public async Task<ApiResponse<ProofOfDeliveryDto>> AddPhotoAsync(AddPODPhotoDto dto)
    {
        try
        {
            var pod = await _podRepository.GetByIdAsync(dto.ProofOfDeliveryId);
            if (pod == null)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Proof of delivery not found");

            if (string.IsNullOrWhiteSpace(dto.PhotoData))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Photo data is required");

            // Convert string ID to Guid
            if (!Guid.TryParse(dto.ProofOfDeliveryId, out var podGuid))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Invalid proof of delivery ID format");

            // Validate photo size
            var photoBytes = Convert.FromBase64String(dto.PhotoData);
            if (photoBytes.Length > MAX_PHOTO_SIZE)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Photo size exceeds maximum of 10MB");

            // Check total size
            var totalSize = await _photoRepository.GetTotalFileSizeAsync(podGuid);
            if (totalSize + photoBytes.Length > MAX_TOTAL_PHOTOS_SIZE)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Total photo size would exceed 100MB limit");

            // Create photo record (in real implementation, would save file to storage)
            var photo = new PODPhoto
            {
                Id = Guid.NewGuid(),
                ProofOfDeliveryId = podGuid,
                PhotoType = (PODPhotoType)dto.PhotoType,
                PhotoUrl = $"pod/{podGuid}/photos/{Guid.NewGuid()}.jpg",
                FileSizeBytes = photoBytes.Length,
                Description = dto.Description,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                CapturedDateTime = DateTime.UtcNow
            };

            await _photoRepository.CreateAsync(photo);
            pod.UpdatedAt = DateTime.UtcNow;
            await _podRepository.UpdateAsync(pod);

            var podDto = MapToDto(pod);
            return ApiResponse<ProofOfDeliveryDto>.CreateSuccess(podDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Error adding photo: {ex.Message}");
        }
    }

    public async Task<ApiResponse<ProofOfDeliveryDto>> CompleteProofOfDeliveryAsync(CompleteProofOfDeliveryDto dto)
    {
        try
        {
            var pod = await _podRepository.GetByIdAsync(dto.ProofOfDeliveryId);
            if (pod == null)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Proof of delivery not found");

            // Validate required fields for completion
            if (string.IsNullOrWhiteSpace(pod.RecipientName))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Recipient signature is required before completion");

            if (string.IsNullOrWhiteSpace(pod.SignatureData))
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Signature is required before completion");

            pod.Status = PODStatus.Completed;
            pod.CompletedDateTime = DateTime.UtcNow;
            if (!string.IsNullOrWhiteSpace(dto.AdditionalNotes))
                pod.ExceptionNotes = dto.AdditionalNotes;
            pod.UpdatedAt = DateTime.UtcNow;

            var updatedPod = await _podRepository.UpdateAsync(pod);
            var podDto = MapToDto(updatedPod);

            return ApiResponse<ProofOfDeliveryDto>.CreateSuccess(podDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Error completing proof of delivery: {ex.Message}");
        }
    }

    public async Task<ApiResponse<ProofOfDeliveryDto>> GetProofOfDeliveryAsync(string id)
    {
        try
        {
            var pod = await _podRepository.GetByIdAsync(id);
            if (pod == null)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Proof of delivery not found");

            var podDto = MapToDto(pod);
            return ApiResponse<ProofOfDeliveryDto>.CreateSuccess(podDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Error retrieving proof of delivery: {ex.Message}");
        }
    }

    public async Task<ApiResponse<ProofOfDeliveryDto>> GetByLoadIdAsync(string loadId)
    {
        try
        {
            var pod = await _podRepository.GetByLoadIdAsync(loadId);
            if (pod == null)
                return ApiResponse<ProofOfDeliveryDto>.CreateFailure("Proof of delivery not found for this load");

            var podDto = MapToDto(pod);
            return ApiResponse<ProofOfDeliveryDto>.CreateSuccess(podDto);
        }
        catch (Exception ex)
        {
            return ApiResponse<ProofOfDeliveryDto>.CreateFailure($"Error retrieving proof of delivery: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<ProofOfDeliveryListDto>>> GetByDriverIdAsync(string driverId, DateTime? fromDate, DateTime? toDate)
    {
        try
        {
            var pods = await _podRepository.GetByDriverIdAsync(driverId, fromDate, toDate);
            var podDtos = pods.Select(p => new ProofOfDeliveryListDto
            {
                Id = p.Id.ToString(),
                TripId = p.TripId,
                LoadId = p.LoadId,
                DriverId = p.DriverId,
                Status = (int)p.Status,
                RecipientName = p.RecipientName,
                DeliveryDateTime = p.DeliveryDateTime,
                DeliveryLocation = p.DeliveryLocation,
                HasSignature = !string.IsNullOrWhiteSpace(p.SignatureData),
                PhotoCount = p.Photos.Count,
                IsOnTime = p.IsOnTime
            }).ToList();

            return ApiResponse<List<ProofOfDeliveryListDto>>.CreateSuccess(podDtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ProofOfDeliveryListDto>>.CreateFailure($"Error retrieving driver PODs: {ex.Message}");
        }
    }

    public async Task<ApiResponse<List<ProofOfDeliveryListDto>>> GetPendingAsync()
    {
        try
        {
            var pods = await _podRepository.GetPendingAsync();
            var podDtos = pods.Select(MapToListDto).ToList();
            return ApiResponse<List<ProofOfDeliveryListDto>>.CreateSuccess(podDtos);
        }
        catch (Exception ex)
        {
            return ApiResponse<List<ProofOfDeliveryListDto>>.CreateFailure($"Error retrieving pending PODs: {ex.Message}");
        }
    }

    private ProofOfDeliveryDto MapToDto(ProofOfDelivery pod)
    {
        return new ProofOfDeliveryDto
        {
            Id = pod.Id.ToString(),
            TripId = pod.TripId,
            LoadId = pod.LoadId,
            DriverId = pod.DriverId,
            Status = (int)pod.Status,
            RecipientName = pod.RecipientName,
            DeliveryNotes = pod.DeliveryNotes,
            DeliveryDateTime = pod.DeliveryDateTime,
            DeliveryLocation = pod.DeliveryLocation,
            DeliveryLatitude = pod.DeliveryLatitude,
            DeliveryLongitude = pod.DeliveryLongitude,
            HasSignature = !string.IsNullOrWhiteSpace(pod.SignatureData),
            Photos = pod.Photos.Select(p => new PODPhotoDto
            {
                Id = p.Id.ToString(),
                PhotoType = (int)p.PhotoType,
                PhotoUrl = p.PhotoUrl,
                FileSizeBytes = p.FileSizeBytes,
                Description = p.Description,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                CapturedDateTime = p.CapturedDateTime
            }).ToList(),
            CompletedDateTime = pod.CompletedDateTime,
            EstimatedDeliveryDateTime = pod.EstimatedDeliveryDateTime,
            IsOnTime = pod.IsOnTime,
            ExceptionNotes = pod.ExceptionNotes,
            CreatedAt = pod.CreatedAt,
            UpdatedAt = pod.UpdatedAt
        };
    }

    private ProofOfDeliveryListDto MapToListDto(ProofOfDelivery pod)
    {
        return new ProofOfDeliveryListDto
        {
            Id = pod.Id.ToString(),
            TripId = pod.TripId,
            LoadId = pod.LoadId,
            DriverId = pod.DriverId,
            Status = (int)pod.Status,
            RecipientName = pod.RecipientName,
            DeliveryDateTime = pod.DeliveryDateTime,
            DeliveryLocation = pod.DeliveryLocation,
            HasSignature = !string.IsNullOrWhiteSpace(pod.SignatureData),
            PhotoCount = pod.Photos.Count,
            IsOnTime = pod.IsOnTime
        };
    }
}

public interface IProofOfDeliveryService
{
    Task<ApiResponse<ProofOfDeliveryDto>> CreateProofOfDeliveryAsync(CreateProofOfDeliveryDto dto);
    Task<ApiResponse<ProofOfDeliveryDto>> SignProofOfDeliveryAsync(SignProofOfDeliveryDto dto);
    Task<ApiResponse<ProofOfDeliveryDto>> AddPhotoAsync(AddPODPhotoDto dto);
    Task<ApiResponse<ProofOfDeliveryDto>> CompleteProofOfDeliveryAsync(CompleteProofOfDeliveryDto dto);
    Task<ApiResponse<ProofOfDeliveryDto>> GetProofOfDeliveryAsync(string id);
    Task<ApiResponse<ProofOfDeliveryDto>> GetByLoadIdAsync(string loadId);
    Task<ApiResponse<List<ProofOfDeliveryListDto>>> GetByDriverIdAsync(string driverId, DateTime? fromDate = null, DateTime? toDate = null);
    Task<ApiResponse<List<ProofOfDeliveryListDto>>> GetPendingAsync();
}
