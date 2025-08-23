-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    
    -- Auth providers
    provider TEXT, -- 'google', 'github', 'email', 'phone'
    provider_id TEXT,
    
    -- OTP support
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Legacy mapping
    legacy_user_id INT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OTP sessions table
CREATE TABLE IF NOT EXISTS otp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    phone TEXT,
    otp_code VARCHAR(6),
    expires_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_otp_sessions_email (email),
    INDEX idx_otp_sessions_phone (phone),
    INDEX idx_otp_sessions_expires (expires_at),
    INDEX idx_otp_sessions_used (used)
);

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_status (
    id SERIAL PRIMARY KEY,
    mysql_user_id INT UNIQUE,
    supabase_user_id UUID,
    migration_date TIMESTAMP DEFAULT NOW(),
    auth_method VARCHAR(20), -- 'oauth', 'otp', 'password'
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Indexes for tracking
    INDEX idx_migration_mysql (mysql_user_id),
    INDEX idx_migration_supabase (supabase_user_id),
    INDEX idx_migration_status (status)
);

-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_settings_user (user_id)
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_expires (expires_at)
);

-- Create user login attempts table for security
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT, -- email or phone
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_attempts_identifier (identifier),
    INDEX idx_attempts_ip (ip_address),
    INDEX idx_attempts_created (created_at)
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_legacy ON user_profiles(legacy_user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, display_name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to clean expired OTP sessions
CREATE OR REPLACE FUNCTION clean_expired_otp_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job for cleaning expired sessions
SELECT cron.schedule('clean-expired-otp', '0 */6 * * *', 'SELECT clean_expired_otp_sessions();');

-- Create function to migrate user from MySQL
CREATE OR REPLACE FUNCTION migrate_user_from_mysql(
    p_mysql_user_id INT,
    p_email TEXT,
    p_username TEXT,
    p_display_name TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if already migrated
    IF EXISTS (SELECT 1 FROM migration_status WHERE mysql_user_id = p_mysql_user_id) THEN
        RETURN (SELECT supabase_user_id FROM migration_status WHERE mysql_user_id = p_mysql_user_id);
    END IF;

    -- Create user in auth.users
    INSERT INTO auth.users (email, raw_user_meta_data, created_at, updated_at)
    VALUES (p_email, jsonb_build_object('username', p_username, 'display_name', p_display_name), NOW(), NOW())
    RETURNING id INTO v_user_id;

    -- Update user profile
    UPDATE user_profiles 
    SET legacy_user_id = p_mysql_user_id, username = p_username, display_name = p_display_name
    WHERE id = v_user_id;

    -- Record migration
    INSERT INTO migration_status (mysql_user_id, supabase_user_id, status)
    VALUES (p_mysql_user_id, v_user_id, 'completed');

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;