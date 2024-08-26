using System;

namespace Auth.api.Config.JwtConfig;

public interface IJwtConfig
{
    string GenerateAccesssToken(string userId, string email);
    string GenerateRefreshToken(string userId);
}
