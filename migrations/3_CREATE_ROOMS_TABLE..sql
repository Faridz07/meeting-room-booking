CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID REFERENCES buildings(id),
    name VARCHAR(255) NOT NULL,
    capacity INTEGER
);
