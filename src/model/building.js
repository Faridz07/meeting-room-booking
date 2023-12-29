const pool = require('../config/db');

const getAllBuildings = async () => {
    const { rows } = await pool.query('SELECT * FROM buildings');
    return rows;
};

const getBuildingById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM buildings WHERE id = $1', [id]);
    return rows[0];
};

const checkBuildingExists = async (name) => {
    const { rows } = await pool.query('SELECT 1 FROM buildings WHERE name = $1', [name]);
    return rows.length > 0;
};

const createBuilding = async (name, location) => {
    const buildingExists = await checkBuildingExists(name);
    if (buildingExists) {
        throw new Error('Building already exists');
    }

    const { rows } = await pool.query(
        'INSERT INTO buildings (name, location) VALUES ($1, $2) RETURNING *',
        [name, location]
    );
    
    return rows[0];
};

const updateBuilding = async (id, name, location) => {
    const building = await getBuildingById(id);
    if (!building) {
        throw new Error('Building not found');
    }

    const buildingExists = await checkBuildingExists(name);
    if (buildingExists) {
        throw new Error('Building already exists');
    }

    const { rows } = await pool.query(
        'UPDATE buildings SET name = $2, location = $3 WHERE id = $1 RETURNING *',
        [id, name, location]
    );

    return rows[0];
};

const deleteBuilding = async (id) => {
    const building = await getBuildingById(id);
    if (!building) {
        throw new Error('Building not found');
    }

    const { rows } = await pool.query('DELETE FROM buildings WHERE id = $1 RETURNING *', [id]);
    return rows[0];
};

module.exports = {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding
};
