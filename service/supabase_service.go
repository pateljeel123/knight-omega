package service

import (
	"fmt"
	"os"

	supa "github.com/supabase-community/supabase-go"
)

type SupabaseService struct {
	client *supa.Client
	enabled bool
}

func NewSupabaseService() (*SupabaseService, error) {
	// Check if Supabase is enabled
	useSupabase := os.Getenv("USE_SUPABASE_AUTH") == "true"
	if !useSupabase {
		return &SupabaseService{enabled: false}, nil
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	if supabaseUrl == "" || supabaseKey == "" {
		return &SupabaseService{enabled: false}, nil
	}

	client, err := supa.NewClient(supabaseUrl, supabaseKey, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create Supabase client: %w", err)
	}

	return &SupabaseService{
		client:  client,
		enabled: true,
	}, nil
}

func (s *SupabaseService) IsEnabled() bool {
	return s.enabled
}

func (s *SupabaseService) GetClient() *supa.Client {
	if !s.enabled {
		return nil
	}
	return s.client
}

// GetAuthProviders returns available auth providers
func (s *SupabaseService) GetAuthProviders() map[string]bool {
	if !s.enabled {
		return map[string]bool{
			"mysql": true,
		}
	}

	return map[string]bool{
		"google": os.Getenv("GOOGLE_CLIENT_ID") != "",
		"github": os.Getenv("GITHUB_CLIENT_ID") != "",
		"email":  true,
		"magic":  true,
	}
}

// GetSupabaseConfig returns the Supabase configuration
func (s *SupabaseService) GetSupabaseConfig() map[string]string {
	return map[string]string{
		"url":   os.Getenv("SUPABASE_URL"),
		"key":   os.Getenv("SUPABASE_KEY"),
		"callback": "https://zqshwxfjhqclymksonry.supabase.co/auth/v1/callback",
	}
}