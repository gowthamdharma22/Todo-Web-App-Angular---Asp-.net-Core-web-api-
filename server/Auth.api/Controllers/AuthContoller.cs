using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Auth.api.Dtos;
using Auth.api.Repository;
using Auth.api.Config.JwtConfig;

namespace Auth.api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController(IUserRepository userRepository, IConfiguration configuration, IJwtConfig jwtConfig) : ControllerBase
    {
        private readonly IUserRepository _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        private readonly IConfiguration _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

        private readonly IJwtConfig _jwtConfig = jwtConfig;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userRepository.Login(loginDto)!;
            if (user != null)
            {
                string accessToken = _jwtConfig.GenerateAccesssToken(user.Id, user.Email);
                string refreshToken = _jwtConfig.GenerateRefreshToken(user.Id);

                HttpContext.Response.Cookies.Append("access_token", accessToken, new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure = false,
                    Expires = DateTimeOffset.UtcNow.AddHours(1)
                });

                HttpContext.Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure = false,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                return Ok(new { userData = user });
            }

            return NotFound(new { message = "User not found" });
        }

        // POST: api/Auth/Register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {

            var userExists = await _userRepository.GetUserByEmail(registerDto.email)!;
            if (userExists != null)
            {
                return Conflict(new { message = "User already exists with this email" });
            }

            var user = await _userRepository.Register(registerDto);
            return Ok(new { userData = new { username = user.UserName, email = user.Email } });
        }

        [HttpGet("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token is required" });
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(refreshToken, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                if (validatedToken is not JwtSecurityToken jwtToken ||
                    !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var userId = principal.FindFirst("UserId")?.Value;
                if (userId == null)
                {
                    return Unauthorized(new { message = "Invalid token payload" });
                }

                var user = await _userRepository.GetUserById(userId);
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                string newAccessToken = _jwtConfig.GenerateAccesssToken(user.Id, user.Email);
                string newRefreshToken = _jwtConfig.GenerateRefreshToken(user.Id);

                // Set new tokens in cookies
                HttpContext.Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure = false,
                    Expires = DateTimeOffset.UtcNow.AddHours(1)
                });

                HttpContext.Response.Cookies.Append("refresh_token", newRefreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Secure = false,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                return Ok(new { message = "Tokens refreshed" });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}
