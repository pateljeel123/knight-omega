package router

import (
	"one-api/controller"
	"one-api/middleware"

	"github.com/gin-gonic/gin"
)

// RegisterSupabaseAuthRoutes adds the new Supabase authentication endpoints
func RegisterSupabaseAuthRoutes(router *gin.Engine) {
	// Auth routes
	authRouter := router.Group("/api/auth")
	{
		authRouter.GET("/providers", controller.GetAuthProviders)
		authRouter.GET("/status", controller.GetAuthStatus)
		
		// OAuth endpoints
		authRouter.GET("/oauth/google", middleware.CriticalRateLimit(), controller.GoogleOAuth)
		authRouter.GET("/oauth/github", middleware.CriticalRateLimit(), controller.GitHubOAuth)
	}
}

// EnhancedSetApiRouter adds the new auth endpoints to the existing router
func EnhancedSetApiRouter(router *gin.Engine) {
	// Call the original SetApiRouter
	SetApiRouter(router)
	
	// Add the new auth endpoints
	RegisterSupabaseAuthRoutes(router)
}