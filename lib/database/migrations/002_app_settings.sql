-- Create app_settings table for managing application configuration
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    allow_purpose_creation_in_banner BOOLEAN DEFAULT true,
    require_purpose_approval BOOLEAN DEFAULT false,
    default_purpose_validity INTEGER DEFAULT 12, -- months
    enable_advanced_purpose_fields BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON app_settings(updated_at DESC);

-- Insert default settings
INSERT INTO app_settings (
    allow_purpose_creation_in_banner,
    require_purpose_approval,
    default_purpose_validity,
    enable_advanced_purpose_fields
) VALUES (
    true,
    false,
    12,
    true
) ON CONFLICT DO NOTHING;