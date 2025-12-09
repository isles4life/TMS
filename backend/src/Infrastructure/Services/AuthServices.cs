namespace TMS.Infrastructure.Services;

using System;
using System.Security.Cryptography;
using System.Text;

/// <summary>
/// Service for handling password hashing and verification
/// </summary>
public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    public bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput.Equals(hash);
    }
}

/// <summary>
/// Service for JWT token generation
/// </summary>
public interface ITokenService
{
    string GenerateToken(Guid userId, string email, string role);
}

public class TokenService : ITokenService
{
    private readonly string _secretKey;
    private readonly int _expirationMinutes;

    public TokenService(string secretKey = "your-super-secret-key-change-in-production", int expirationMinutes = 1440)
    {
        _secretKey = secretKey;
        _expirationMinutes = expirationMinutes;
    }

    public string GenerateToken(Guid userId, string email, string role)
    {
        // For now, return a placeholder token
        // In production, use System.IdentityModel.Tokens.Jwt
        return $"token_{userId}_{DateTime.UtcNow.Ticks}";
    }
}
