package controller

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// GetAuthProviders returns available authentication providers
func GetAuthProviders(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"google": os.Getenv("GOOGLE_CLIENT_ID") != "",
			"github": os.Getenv("GITHUB_CLIENT_ID") != "",
			"email":  true,
			"phone":  os.Getenv("TWILIO_ACCOUNT_SID") != "",
		},
	})
}

// GoogleOAuth handles Google OAuth authentication
func GoogleOAuth(c *gin.Context) {
	// Implement Google OAuth logic here
	// This would redirect to Google's OAuth endpoint
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Google OAuth endpoint",
	})
}

// GetAuthStatus returns the current authentication status
func GetAuthStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"supabase_enabled": os.Getenv("USE_SUPABASE_AUTH") == "true",
			"hybrid_mode":      os.Getenv("HYBRID_MODE") == "true",
		},
	})
}