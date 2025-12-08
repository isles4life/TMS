using System;
using System.Collections.Generic;
using System.Linq;

namespace TMS.Domain.Common;

/// <summary>
/// Standard API response envelope
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = [];

    public static ApiResponse<T> CreateSuccess(T data) => new() { Success = true, Data = data };
    public static ApiResponse<T> CreateFailure(params string[] errors) => new() { Success = false, Errors = errors.ToList() };
}

/// <summary>
/// Standard API response without data (for void operations)
/// </summary>
public class ApiResponse
{
    public bool Success { get; set; }
    public List<string> Errors { get; set; } = [];

    public static ApiResponse CreateSuccess() => new() { Success = true };
    public static ApiResponse CreateFailure(params string[] errors) => new() { Success = false, Errors = errors.ToList() };
}
