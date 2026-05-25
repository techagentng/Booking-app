package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

// Config holds database configuration
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// NewConfig creates a new database configuration
func NewConfig() *Config {
	return &Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "password"),
		DBName:   getEnv("DB_NAME", "tripsbook"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}
}

// NewConnection creates a new database connection
func NewConnection(config *Config) (*DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		config.Host,
		config.Port,
		config.User,
		config.Password,
		config.DBName,
		config.SSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established")
	return &DB{db}, nil
}

// Migrate runs database migrations
func (db *DB) Migrate() error {
	log.Println("🔄 Running database migrations...")

	// Read schema file
	schema, err := os.ReadFile("database/schema.sql")
	if err != nil {
		return fmt.Errorf("failed to read schema file: %w", err)
	}

	// Execute schema
	if _, err := db.Exec(string(schema)); err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	log.Println("✅ Database migrations completed")
	return nil
}

// SeedData inserts sample data into the database
func (db *DB) SeedData() error {
	log.Println("🌱 Seeding database with sample data...")

	// Read sample data file
	data, err := os.ReadFile("database/sample_data.sql")
	if err != nil {
		return fmt.Errorf("failed to read sample data file: %w", err)
	}

	// Execute sample data
	if _, err := db.Exec(string(data)); err != nil {
		return fmt.Errorf("failed to seed data: %w", err)
	}

	log.Println("✅ Database seeding completed")
	return nil
}

// getEnv gets environment variable with default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Close closes the database connection
func (db *DB) Close() error {
	if db.DB != nil {
		return db.DB.Close()
	}
	return nil
}

// Health checks database connection
func (db *DB) Health() error {
	if err := db.Ping(); err != nil {
		return fmt.Errorf("database health check failed: %w", err)
	}
	return nil
}
