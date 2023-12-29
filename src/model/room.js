const pool = require('../config/db');
const { getBuildingById } = require('./building');

const getAllRooms = async () => {
    const { rows } = await pool.query('SELECT * FROM rooms');
    return rows;
};

const getRoomById = async (id) => {
    const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    return rows[0];
};

const isRoomNameUniqueInBuilding = async (building_id, roomName) => {
    const { rows } = await pool.query(
        'SELECT 1 FROM rooms WHERE building_id = $1 AND name = $2',
        [building_id, roomName]
    );
    return rows.length === 0;
};

const createRoom = async (building_id, name, capacity) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const building = await getBuildingById(building_id);
        if (!building) {
            throw new Error('Building not found');
        }

        const isUnique = await isRoomNameUniqueInBuilding(building_id, name);
        if (!isUnique) {
            throw new Error('Room name must be unique within the building');
        }

        const insertResult = await client.query(
            'INSERT INTO rooms (building_id, name, capacity) VALUES ($1, $2, $3) RETURNING *',
            [building_id, name, capacity]
        );

        await client.query('COMMIT');
        return insertResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateRoom = async (id, building_id, name, capacity) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const buildingExists = await getBuildingById(building_id);
        if (!buildingExists) {
            throw new Error('Building not found');
        }

        const roomExists = await getRoomById(id);
        if (!roomExists) {
            throw new Error('Room not found');
        }

        const isUnique = await isRoomNameUniqueInBuilding(building_id, name);
        if (!isUnique && name !== roomExists.name) {
            throw new Error('Room name must be unique within the building');
        }

        const { rows } = await client.query(
            'UPDATE rooms SET building_id = $2, name = $3, capacity = $4 WHERE id = $1 RETURNING *',
            [id, building_id, name, capacity]
        );

        await client.query('COMMIT');
        return rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const deleteRoom = async (id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const room = await getRoomById(id);
        if (!room) {
            throw new Error('Room not found');
        }

        const buildingExists = await getBuildingById(room.building_id);
        if (!buildingExists) {
            throw new Error('Building not found');
        }

        const { rows } = await client.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);

        await client.query('COMMIT');
        return rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};
