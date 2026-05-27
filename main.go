package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"tripsbook/database"

	"database/sql"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

type Server struct {
	db *database.DB
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
	Meta    interface{} `json:"meta"`
}

type Meta struct {
	Timestamp string `json:"timestamp"`
	Location  string `json:"location,omitempty"`
}

type PaginationMeta struct {
	Timestamp string `json:"timestamp"`
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	Total     int    `json:"total"`
	Pages     int    `json:"pages"`
	HasNext   bool   `json:"has_next"`
	HasPrev   bool   `json:"has_prev"`
}

func main() {
	// Initialize database
	config := database.NewConfig()
	db, err := database.NewConnection(config)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Run migrations and seed data
	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	if err := db.SeedData(); err != nil {
		log.Fatal("Failed to seed data:", err)
	}

	server := &Server{db: db}

	// Setup router
	router := mux.NewRouter()

	// API Routes
	api := router.PathPrefix("/api/v1/public").Subrouter()

	// Categories
	api.HandleFunc("/categories", server.getCategories).Methods("GET")
	api.HandleFunc("/categories/trending", server.getTrendingCategories).Methods("GET")

	// Services
	api.HandleFunc("/services/category/{category}", server.getServicesByCategory).Methods("GET")
	api.HandleFunc("/services/nearby", server.getNearbyServices).Methods("GET")
	api.HandleFunc("/services/nearby/filters", server.getDistanceFilters).Methods("GET")
	api.HandleFunc("/services/trending", server.getTrendingServices).Methods("GET")
	api.HandleFunc("/services/map", server.getMapServices).Methods("GET")
	api.HandleFunc("/services/{id}", server.getServiceDetails).Methods("GET")

	// Explore
	api.HandleFunc("/explore/featured", server.getFeaturedServices).Methods("GET")
	api.HandleFunc("/explore/destinations", server.getPopularDestinations).Methods("GET")

	// Search
	api.HandleFunc("/search", server.search).Methods("GET")
	api.HandleFunc("/search/suggestions", server.getSearchSuggestions).Methods("GET")

	// Location
	api.HandleFunc("/location/current", server.getCurrentLocation).Methods("GET")
	api.HandleFunc("/locations/popular", server.getPopularLocations).Methods("GET")

	// Analytics
	api.HandleFunc("/analytics/track", server.trackAnalytics).Methods("POST")

	// Customer bookings (authenticated)
	customer := router.PathPrefix("/api/v1/customer").Subrouter()
	customer.HandleFunc("/bookings/service", server.createServiceBooking).Methods("POST")
	customer.HandleFunc("/bookings", server.getCustomerBookings).Methods("GET")

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(router)

	// Start server
	log.Println("🚀 TripsBook API Server starting on port 8080")
	log.Println("📱 Mobile-First Service Discovery Platform")
	log.Println("🔗 API Base URL: http://localhost:8080/api/v1/public")

	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func (s *Server) sendResponse(w http.ResponseWriter, data interface{}, message string, location ...string) {
	meta := Meta{
		Timestamp: time.Now().Format(time.RFC3339),
	}

	if len(location) > 0 {
		meta.Location = location[0]
	}

	response := Response{
		Success: true,
		Data:    data,
		Message: message,
		Meta:    meta,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) sendPaginatedResponse(w http.ResponseWriter, data interface{}, message string, page, limit, total int, location ...string) {
	pages := (total + limit - 1) / limit
	response := Response{
		Success: true,
		Data:    data,
		Message: message,
		Meta: PaginationMeta{
			Timestamp: time.Now().Format(time.RFC3339),
			Page:      page,
			Limit:     limit,
			Total:     total,
			Pages:     pages,
			HasNext:   page < pages,
			HasPrev:   page > 1,
		},
	}

	if len(location) > 0 {
		if paginationMeta, ok := response.Meta.(PaginationMeta); ok {
			// Create a new PaginationMeta with the location
			response.Meta = PaginationMeta{
				Timestamp: paginationMeta.Timestamp,
				Page:      paginationMeta.Page,
				Limit:     paginationMeta.Limit,
				Total:     paginationMeta.Total,
				Pages:     paginationMeta.Pages,
				HasNext:   paginationMeta.HasNext,
				HasPrev:   paginationMeta.HasPrev,
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Categories endpoints
func (s *Server) getCategories(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id, name, icon, color, count 
		FROM categories 
		ORDER BY id
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []map[string]interface{}
	for rows.Next() {
		var id, name, icon, color string
		var count int
		if err := rows.Scan(&id, &name, &icon, &color, &count); err != nil {
			continue
		}

		categories = append(categories, map[string]interface{}{
			"id":    id,
			"name":  name,
			"icon":  icon,
			"color": color,
			"count": count,
		})
	}

	s.sendResponse(w, categories, "Categories retrieved successfully", "Lagos, Nigeria")
}

func (s *Server) getTrendingCategories(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")
	if period == "" {
		period = "week"
	}

	query := `
		SELECT name, change, color, icon 
		FROM trending_categories 
		WHERE period = $1 
		ORDER BY name
	`

	rows, err := s.db.Query(query, period)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var categories []map[string]interface{}
	for rows.Next() {
		var name, change, color, icon string
		if err := rows.Scan(&name, &change, &color, &icon); err != nil {
			continue
		}

		categories = append(categories, map[string]interface{}{
			"name":   name,
			"change": change,
			"color":  color,
			"icon":   icon,
		})
	}

	s.sendResponse(w, categories, "Trending categories retrieved successfully")
}

// Services endpoints
func (s *Server) getServicesByCategory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	category := vars["category"]
	location := r.URL.Query().Get("location")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page == 0 {
		page = 1
	}
	if limit == 0 {
		limit = 20
	}

	offset := (page - 1) * limit

	query := `
		SELECT s.id, s.name, s.type, s.description, s.image, s.rating, s.price,
		       sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude,
		       sc.phone, sc.email, sc.website,
		       array_agg(sf.feature) as features
		FROM services s
		LEFT JOIN service_locations sl ON s.id = sl.service_id
		LEFT JOIN service_contacts sc ON s.id = sc.service_id
		LEFT JOIN service_features sf ON s.id = sf.service_id
		LEFT JOIN categories c ON s.category_id = c.id
		WHERE c.id = $1
		GROUP BY s.id, sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude, sc.phone, sc.email, sc.website
		ORDER BY s.rating DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := s.db.Query(query, category, limit, offset)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []map[string]interface{}
	for rows.Next() {
		var id, name, serviceType, description, image, price, address, city, state, country, phone, email, website string
		var rating float64
		var lat, lng float64
		var features []string

		if err := rows.Scan(&id, &name, &serviceType, &description, &image, &rating, &price,
			&address, &city, &state, &country, &lat, &lng, &phone, &email, &website, &features); err != nil {
			continue
		}

		services = append(services, map[string]interface{}{
			"id":          id,
			"name":        name,
			"type":        serviceType,
			"description": description,
			"image":       image,
			"rating":      rating,
			"price":       price,
			"location": map[string]interface{}{
				"address":     address,
				"city":        city,
				"state":       state,
				"country":     country,
				"coordinates": map[string]float64{"lat": lat, "lng": lng},
			},
			"contact": map[string]interface{}{
				"phone":   phone,
				"email":   email,
				"website": website,
			},
			"features": features,
		})
	}

	// Get total count
	var total int
	countQuery := `
		SELECT COUNT(*) 
		FROM services s 
		LEFT JOIN categories c ON s.category_id = c.id 
		WHERE c.id = $1
	`
	s.db.QueryRow(countQuery, category).Scan(&total)

	s.sendPaginatedResponse(w, services, "Services retrieved successfully", page, limit, total, location)
}

func (s *Server) getNearbyServices(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 64)
	lng, _ := strconv.ParseFloat(r.URL.Query().Get("lng"), 64)
	radius, _ := strconv.ParseFloat(r.URL.Query().Get("radius"), 64)
	category := r.URL.Query().Get("category")

	if lat == 0 || lng == 0 {
		http.Error(w, "Latitude and longitude are required", http.StatusBadRequest)
		return
	}

	query := `
		SELECT s.id, s.name, s.type, s.description, s.image, s.rating, s.price,
		       sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude,
		       sc.phone, sc.email, sc.website,
		       array_agg(sf.feature) as features,
		       CASE 
		         WHEN sl.latitude IS NOT NULL AND sl.longitude IS NOT NULL THEN
		           6371 * acos(cos(radians($1)) * cos(radians(sl.latitude)) * 
		           cos(radians(sl.longitude) - radians($2)) + 
		           sin(radians($1)) * sin(radians(sl.latitude)))
		         ELSE 0
		       END as distance
		FROM services s
		LEFT JOIN service_locations sl ON s.id = sl.service_id
		LEFT JOIN service_contacts sc ON s.id = sc.service_id
		LEFT JOIN service_features sf ON s.id = sf.service_id
		LEFT JOIN categories c ON s.category_id = c.id
		HAVING distance <= $3 OR distance = 0
	`

	if category != "" && category != "all" {
		query += " AND c.id = $4"
	}

	query += " ORDER BY distance ASC, s.rating DESC LIMIT 50"

	var rows *sql.Rows
	var err error

	if category != "" && category != "all" {
		rows, err = s.db.Query(query, lat, lng, radius, category)
	} else {
		rows, err = s.db.Query(query, lat, lng, radius)
	}

	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []map[string]interface{}
	for rows.Next() {
		var id, name, serviceType, description, image, price, address, city, state, country, phone, email, website string
		var rating, distance float64
		var features []string

		if err := rows.Scan(&id, &name, &serviceType, &description, &image, &rating, &price,
			&address, &city, &state, &country, &phone, &email, &website, &features, &distance); err != nil {
			continue
		}

		distanceStr := fmt.Sprintf("%.1fkm", distance)
		if distance == 0 {
			distanceStr = "Available"
		}

		services = append(services, map[string]interface{}{
			"id":            id,
			"name":          name,
			"type":          serviceType,
			"description":   description,
			"image":         image,
			"rating":        rating,
			"price":         price,
			"distance":      distanceStr,
			"open_now":      true,
			"available_now": true,
			"location": map[string]interface{}{
				"address":     address,
				"city":        city,
				"state":       state,
				"country":     country,
				"coordinates": map[string]float64{"lat": lat, "lng": lng},
			},
			"contact": map[string]interface{}{
				"phone":   phone,
				"email":   email,
				"website": website,
			},
			"features": features,
		})
	}

	s.sendResponse(w, services, "Nearby services retrieved successfully", "Lagos, Nigeria")
}

func (s *Server) getDistanceFilters(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT label, value, count 
		FROM distance_filters 
		ORDER BY value
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var filters []map[string]interface{}
	for rows.Next() {
		var label string
		var value, count int
		if err := rows.Scan(&label, &value, &count); err != nil {
			continue
		}

		filters = append(filters, map[string]interface{}{
			"label": label,
			"value": value,
			"count": count,
		})
	}

	s.sendResponse(w, filters, "Distance filters retrieved successfully")
}

func (s *Server) getTrendingServices(w http.ResponseWriter, r *http.Request) {
	period := r.URL.Query().Get("period")
	location := r.URL.Query().Get("location")

	if period == "" {
		period = "week"
	}
	if location == "" {
		location = "Lagos"
	}

	query := `
		SELECT s.id, s.name, s.type, s.description, s.image, s.rating, s.price,
		       s.weekly_change, s.trending_badge,
		       sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude,
		       sc.phone, sc.email, sc.website,
		       array_agg(sf.feature) as features
		FROM services s
		LEFT JOIN service_locations sl ON s.id = sl.service_id
		LEFT JOIN service_contacts sc ON s.id = sc.service_id
		LEFT JOIN service_features sf ON s.id = sf.service_id
		WHERE s.trending = true
		GROUP BY s.id, sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude, 
		         sc.phone, sc.email, sc.website, s.weekly_change, s.trending_badge
		ORDER BY s.weekly_change DESC
		LIMIT 20
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []map[string]interface{}
	for rows.Next() {
		var id, name, serviceType, description, image, price, address, city, state, country, phone, email, website string
		var rating, weeklyChange float64
		var trendingBadge string
		var features []string

		if err := rows.Scan(&id, &name, &serviceType, &description, &image, &rating, &price,
			&address, &city, &state, &country, &phone, &email, &website, &features, &weeklyChange, &trendingBadge); err != nil {
			continue
		}

		distance := city
		if city == "Lagos" {
			distance = "Lagos"
		} else if city == "Abuja" {
			distance = "Abuja"
		}

		services = append(services, map[string]interface{}{
			"id":             id,
			"name":           name,
			"type":           serviceType,
			"description":    description,
			"image":          image,
			"rating":         rating,
			"price":          price,
			"distance":       distance,
			"trending":       true,
			"weekly_change":  weeklyChange,
			"trending_badge": trendingBadge,
			"location": map[string]interface{}{
				"address":     address,
				"city":        city,
				"state":       state,
				"country":     country,
				"coordinates": map[string]float64{"lat": 6.4474, "lng": 3.3903},
			},
			"contact": map[string]interface{}{
				"phone":   phone,
				"email":   email,
				"website": website,
			},
			"features": features,
		})
	}

	s.sendResponse(w, services, "Trending services retrieved successfully", location)
}

func (s *Server) getMapServices(w http.ResponseWriter, r *http.Request) {
	// Get map bounds from query parameters
	southLat, _ := strconv.ParseFloat(r.URL.Query().Get("south_lat"), 64)
	southLng, _ := strconv.ParseFloat(r.URL.Query().Get("south_lng"), 64)
	northLat, _ := strconv.ParseFloat(r.URL.Query().Get("north_lat"), 64)
	northLng, _ := strconv.ParseFloat(r.URL.Query().Get("north_lng"), 64)
	category := r.URL.Query().Get("category")

	// Validate bounds
	if southLat == 0 || southLng == 0 || northLat == 0 || northLng == 0 {
		http.Error(w, "Map bounds (south_lat, south_lng, north_lat, north_lng) are required", http.StatusBadRequest)
		return
	}

	query := `
		SELECT s.id, s.name, s.type, s.description, s.image, s.rating, s.price,
		       sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude,
		       sc.phone, sc.email, sc.website,
		       array_agg(sf.feature) as features
		FROM services s
		LEFT JOIN service_locations sl ON s.id = sl.service_id
		LEFT JOIN service_contacts sc ON s.id = sc.service_id
		LEFT JOIN service_features sf ON s.id = sf.service_id
		LEFT JOIN categories c ON s.category_id = c.id
		WHERE sl.latitude IS NOT NULL 
		AND sl.longitude IS NOT NULL
		AND sl.latitude >= $1 AND sl.latitude <= $2
		AND sl.longitude >= $3 AND sl.longitude <= $4
	`

	var args []interface{}
	args = append(args, southLat, northLat, southLng, northLng)

	if category != "" && category != "all" {
		query += " AND c.id = $5"
		args = append(args, category)
	}

	query += " GROUP BY s.id, sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude, sc.phone, sc.email, sc.website ORDER BY s.rating DESC LIMIT 100"

	rows, err := s.db.Query(query, args...)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []map[string]interface{}
	for rows.Next() {
		var id, name, serviceType, description, image, price, address, city, state, country, phone, email, website string
		var rating float64
		var lat, lng float64
		var features []string

		if err := rows.Scan(&id, &name, &serviceType, &description, &image, &rating, &price,
			&address, &city, &state, &country, &lat, &lng, &phone, &email, &website, &features); err != nil {
			continue
		}

		services = append(services, map[string]interface{}{
			"id":          id,
			"name":        name,
			"type":        serviceType,
			"description": description,
			"image":       image,
			"rating":      rating,
			"price":       price,
			"location": map[string]interface{}{
				"address":     address,
				"city":        city,
				"state":       state,
				"country":     country,
				"coordinates": map[string]float64{"lat": lat, "lng": lng},
			},
			"contact": map[string]interface{}{
				"phone":   phone,
				"email":   email,
				"website": website,
			},
			"features": features,
		})
	}

	s.sendResponse(w, services, "Map services retrieved successfully")
}

func (s *Server) getServiceDetails(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	serviceId := vars["id"]

	if serviceId == "" {
		http.Error(w, "Service ID is required", http.StatusBadRequest)
		return
	}

	query := `
		SELECT s.id, s.name, s.type, s.description, s.image, s.rating, s.price, s.featured, s.trending,
		       s.weekly_change, s.trending_badge, s.created_at, s.updated_at,
		       sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude,
		       sc.phone, sc.email, sc.website,
		       array_agg(sf.feature) as features,
		       c.name as category_name, c.icon as category_icon, c.color as category_color
		FROM services s
		LEFT JOIN service_locations sl ON s.id = sl.service_id
		LEFT JOIN service_contacts sc ON s.id = sc.service_id
		LEFT JOIN service_features sf ON s.id = sf.service_id
		LEFT JOIN categories c ON s.category_id = c.id
		WHERE s.id = $1
		GROUP BY s.id, sl.address, sl.city, sl.state, sl.country, sl.latitude, sl.longitude, 
		         sc.phone, sc.email, sc.website, c.name, c.icon, c.color
	`

	var id, name, serviceType, description, image, price, address, city, state, country, phone, email, website string
	var rating, weeklyChange float64
	var featured, trending bool
	var trendingBadge, categoryName, categoryIcon, categoryColor string
	var createdAt, updatedAt time.Time
	var features []string
	var lat, lng float64

	err := s.db.QueryRow(query, serviceId).Scan(&id, &name, &serviceType, &description, &image, &rating, &price,
		&featured, &trending, &weeklyChange, &trendingBadge, &createdAt, &updatedAt,
		&address, &city, &state, &country, &lat, &lng, &phone, &email, &website, &features,
		&categoryName, &categoryIcon, &categoryColor)

	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Service not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	// Get operating hours
	operatingHoursQuery := `
		SELECT day_of_week, open_time, close_time, is_closed
		FROM operating_hours
		WHERE service_id = $1
		ORDER BY CASE day_of_week
			WHEN 'Monday' THEN 1
			WHEN 'Tuesday' THEN 2
			WHEN 'Wednesday' THEN 3
			WHEN 'Thursday' THEN 4
			WHEN 'Friday' THEN 5
			WHEN 'Saturday' THEN 6
			WHEN 'Sunday' THEN 7
		END
	`

	rows, err := s.db.Query(operatingHoursQuery, serviceId)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var operatingHours []map[string]interface{}
	for rows.Next() {
		var dayOfWeek string
		var openTime, closeTime *time.Time
		var isClosed bool

		if err := rows.Scan(&dayOfWeek, &openTime, &closeTime, &isClosed); err != nil {
			continue
		}

		hours := map[string]interface{}{
			"day":       dayOfWeek,
			"is_closed": isClosed,
		}

		if openTime != nil {
			hours["open_time"] = openTime.Format("15:04")
		}
		if closeTime != nil {
			hours["close_time"] = closeTime.Format("15:04")
		}

		operatingHours = append(operatingHours, hours)
	}

	service := map[string]interface{}{
		"id":             id,
		"name":           name,
		"type":           serviceType,
		"description":    description,
		"image":          image,
		"rating":         rating,
		"price":          price,
		"featured":       featured,
		"trending":       trending,
		"weekly_change":  weeklyChange,
		"trending_badge": trendingBadge,
		"created_at":     createdAt.Format(time.RFC3339),
		"updated_at":     updatedAt.Format(time.RFC3339),
		"category": map[string]interface{}{
			"name":  categoryName,
			"icon":  categoryIcon,
			"color": categoryColor,
		},
		"location": map[string]interface{}{
			"address":     address,
			"city":        city,
			"state":       state,
			"country":     country,
			"coordinates": map[string]float64{"lat": lat, "lng": lng},
		},
		"contact": map[string]interface{}{
			"phone":   phone,
			"email":   email,
			"website": website,
		},
		"features":        features,
		"operating_hours": operatingHours,
	}

	s.sendResponse(w, service, "Service details retrieved successfully")
}

// Explore endpoints
func (s *Server) getFeaturedServices(w http.ResponseWriter, r *http.Request) {
	location := r.URL.Query().Get("location")
	if location == "" {
		location = "Lagos"
	}

	query := `
		SELECT c.name, c.icon, c.color, COUNT(s.id) as count
		FROM categories c
		LEFT JOIN services s ON c.id = s.category_id AND s.featured = true
		GROUP BY c.id, c.name, c.icon, c.color
		ORDER BY c.id
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []map[string]interface{}
	for rows.Next() {
		var name, icon, color string
		var count int
		if err := rows.Scan(&name, &icon, &color, &count); err != nil {
			continue
		}

		description := fmt.Sprintf("%d nearby", count)
		if count == 0 {
			description = "Available"
		}

		services = append(services, map[string]interface{}{
			"title":       name,
			"description": description,
			"icon":        icon,
			"color":       color,
			"count":       &count,
			"image":       "https://picsum.photos/seed/placeholder/80/80.jpg",
		})
	}

	s.sendResponse(w, services, "Featured services retrieved successfully", location)
}

func (s *Server) getPopularDestinations(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT name, country, rating, distance, service_count
		FROM popular_destinations
		ORDER BY service_count DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var destinations []map[string]interface{}
	for rows.Next() {
		var name, country, distance string
		var rating, serviceCount int
		if err := rows.Scan(&name, &country, &rating, &distance, &serviceCount); err != nil {
			continue
		}

		destinations = append(destinations, map[string]interface{}{
			"name":          name,
			"country":       country,
			"rating":        rating,
			"distance":      distance,
			"image":         "https://picsum.photos/seed/placeholder/160/96.jpg",
			"service_count": serviceCount,
		})
	}

	s.sendResponse(w, destinations, "Popular destinations retrieved successfully")
}

// Search endpoints
func (s *Server) search(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	location := r.URL.Query().Get("location")
	category := r.URL.Query().Get("category")

	if query == "" {
		http.Error(w, "Search query is required", http.StatusBadRequest)
		return
	}

	if location == "" {
		location = "Lagos"
	}

	// Log search for analytics
	s.logSearch(query, location, category)

	searchQuery := `
		SELECT s.id, s.name, s.type, s.rating, s.price, sl.city,
		       ts_rank_cd(s.name, $1) as match_score
		FROM services s
		LEFT JOIN service_locations sl ON s.id = sl.service_id
		LEFT JOIN categories c ON s.category_id = c.id
		WHERE s.name % $1
	`

	if category != "" && category != "all" {
		searchQuery += " AND c.id = $2"
	}

	searchQuery += " ORDER BY match_score DESC, s.rating DESC LIMIT 20"

	var rows *sql.Rows
	var err error

	if category != "" && category != "all" {
		rows, err = s.db.Query(searchQuery, query, category)
	} else {
		rows, err = s.db.Query(searchQuery, query)
	}

	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []map[string]interface{}
	for rows.Next() {
		var id, name, serviceType, city string
		var rating float64
		var price, matchScore int

		if err := rows.Scan(&id, &name, &serviceType, &rating, &price, &city, &matchScore); err != nil {
			continue
		}

		services = append(services, map[string]interface{}{
			"id":          id,
			"name":        name,
			"type":        serviceType,
			"rating":      rating,
			"price":       price,
			"distance":    city,
			"image":       "https://picsum.photos/seed/placeholder/60/60.jpg",
			"match_score": matchScore,
		})
	}

	result := map[string]interface{}{
		"services":    services,
		"suggestions": []string{},
		"categories": []map[string]interface{}{
			{"name": category, "count": len(services)},
		},
	}

	s.sendResponse(w, result, "Search completed successfully", location)
}

func (s *Server) getSearchSuggestions(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	location := r.URL.Query().Get("location")

	if query == "" {
		http.Error(w, "Search query is required", http.StatusBadRequest)
		return
	}

	if location == "" {
		location = "Lagos"
	}

	// Simple suggestions based on service names
	suggestionsQuery := `
		SELECT DISTINCT name, type
		FROM services
		WHERE name ILIKE $1 || '%'
		ORDER BY name
		LIMIT 10
	`

	rows, err := s.db.Query(suggestionsQuery, query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var suggestions []map[string]interface{}
	for rows.Next() {
		var name, serviceType string
		if err := rows.Scan(&name, &serviceType); err != nil {
			continue
		}

		suggestions = append(suggestions, map[string]interface{}{
			"text":     name,
			"type":     "service",
			"category": serviceType,
		})
	}

	s.sendResponse(w, suggestions, "Search suggestions retrieved successfully", location)
}

// Location endpoints
func (s *Server) getCurrentLocation(w http.ResponseWriter, r *http.Request) {
	location := map[string]interface{}{
		"city":    "Lagos",
		"state":   "Lagos State",
		"country": "Nigeria",
		"coordinates": map[string]float64{
			"lat": 6.4474,
			"lng": 3.3903,
		},
		"timezone": "Africa/Lagos",
	}

	s.sendResponse(w, location, "Current location retrieved successfully")
}

// Service booking endpoints
func (s *Server) createServiceBooking(w http.ResponseWriter, r *http.Request) {
	var bookingData struct {
		ServiceID       string `json:"service_id"`
		CustomerID      string `json:"customer_id"`
		CheckInDate     string `json:"check_in_date"`
		CheckOutDate    string `json:"check_out_date"`
		GuestCount      int    `json:"guest_count"`
		SpecialRequests string `json:"special_requests"`
	}

	if err := json.NewDecoder(r.Body).Decode(&bookingData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Insert booking into database
	query := `
		INSERT INTO bookings (service_id, customer_id, check_in_date, check_out_date, guest_count, special_requests, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
		RETURNING id
	`

	var bookingID string
	err := s.db.QueryRow(query, bookingData.ServiceID, bookingData.CustomerID, bookingData.CheckInDate, bookingData.CheckOutDate, bookingData.GuestCount, bookingData.SpecialRequests).Scan(&bookingID)
	if err != nil {
		http.Error(w, "Failed to create booking", http.StatusInternalServerError)
		return
	}

	result := map[string]interface{}{
		"booking_id": bookingID,
		"status":     "pending",
	}

	s.sendResponse(w, result, "Booking created successfully")
}

func (s *Server) getCustomerBookings(w http.ResponseWriter, r *http.Request) {
	customerID := r.URL.Query().Get("customer_id")
	status := r.URL.Query().Get("status")

	if customerID == "" {
		http.Error(w, "Customer ID is required", http.StatusBadRequest)
		return
	}

	query := `
		SELECT id, service_id, customer_id, check_in_date, check_out_date, guest_count, special_requests, status, created_at
		FROM bookings
		WHERE customer_id = $1
	`

	args := []interface{}{customerID}
	argIndex := 2

	if status != "" {
		query += " AND status = $" + strconv.Itoa(argIndex)
		args = append(args, status)
		argIndex++
	}

	query += " ORDER BY created_at DESC"

	rows, err := s.db.Query(query, args...)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var bookings []map[string]interface{}
	for rows.Next() {
		var id, serviceID, customerID, checkInDate, checkOutDate, specialRequests, status, createdAt string
		var guestCount int

		if err := rows.Scan(&id, &serviceID, &customerID, &checkInDate, &checkOutDate, &guestCount, &specialRequests, &status, &createdAt); err != nil {
			continue
		}

		bookings = append(bookings, map[string]interface{}{
			"id":               id,
			"service_id":       serviceID,
			"customer_id":      customerID,
			"check_in_date":    checkInDate,
			"check_out_date":   checkOutDate,
			"guest_count":      guestCount,
			"special_requests": specialRequests,
			"status":           status,
			"created_at":       createdAt,
		})
	}

	s.sendResponse(w, bookings, "Bookings retrieved successfully")
}

func (s *Server) getPopularLocations(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT city, state, country, service_count
		FROM (
			SELECT DISTINCT sl.city, sl.state, sl.country, COUNT(s.id) as service_count
			FROM services s
			JOIN service_locations sl ON s.id = sl.service_id
			GROUP BY sl.city, sl.state, sl.country
		) as locations
		ORDER BY service_count DESC
		LIMIT 10
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var locations []map[string]interface{}
	for rows.Next() {
		var city, state, country string
		var serviceCount int
		if err := rows.Scan(&city, &state, &country, &serviceCount); err != nil {
			continue
		}

		locations = append(locations, map[string]interface{}{
			"city":          city,
			"state":         state,
			"country":       country,
			"service_count": serviceCount,
			"image":         "https://picsum.photos/seed/placeholder/200/120.jpg",
		})
	}

	s.sendResponse(w, locations, "Popular locations retrieved successfully")
}

// Analytics endpoint
func (s *Server) trackAnalytics(w http.ResponseWriter, r *http.Request) {
	var analytics struct {
		Event           string                 `json:"event"`
		Data            map[string]interface{} `json:"data"`
		UserFingerprint string                 `json:"user_fingerprint"`
		Timestamp       string                 `json:"timestamp"`
	}

	if err := json.NewDecoder(r.Body).Decode(&analytics); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Log analytics event (in production, you'd store this in database)
	log.Printf("Analytics Event: %s - %s", analytics.Event, analytics.UserFingerprint)

	// Store in database
	insertQuery := `
		INSERT INTO analytics_events (event, data, user_fingerprint, created_at)
		VALUES ($1, $2, $3, $4)
	`

	dataJSON, _ := json.Marshal(analytics.Data)
	_, err := s.db.Exec(insertQuery, analytics.Event, dataJSON, analytics.UserFingerprint, analytics.Timestamp)
	if err != nil {
		log.Printf("Failed to store analytics event: %v", err)
	}

	s.sendResponse(w, nil, "Analytics event tracked successfully")
}

// Helper function to log searches
func (s *Server) logSearch(query, location, category string) {
	insertQuery := `
		INSERT INTO search_logs (query, location, category, results_count, created_at)
		VALUES ($1, $2, $3, 0, CURRENT_TIMESTAMP)
	`

	_, err := s.db.Exec(insertQuery, query, location, category)
	if err != nil {
		log.Printf("Failed to log search: %v", err)
	}
}
