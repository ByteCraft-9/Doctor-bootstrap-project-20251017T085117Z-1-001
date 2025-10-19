-- Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    location VARCHAR(255),
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) CHECK (rating IN (3.0, 3.5, 4.0, 4.5, 5.0)),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    visible BOOLEAN DEFAULT false
);

-- Create Availability Table
CREATE TABLE IF NOT EXISTS availability (
    id SERIAL PRIMARY KEY,
    is_available BOOLEAN DEFAULT true,
    note TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
