const express = require('express');
const { validateUUID } = require('../utils/uuid');
const router = express.Router();
const { 
    getAllRooms, 
    getRoomById, 
    createRoom, 
    updateRoom, 
    deleteRoom 
} = require('../model/room');

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await getAllRooms();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a room by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const room = await getRoomById(id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new room
router.post('/', async (req, res) => {
    const { building_id, name, capacity } = req.body;

    if (!validateUUID(building_id)) {
        return res.status(400).json({ message: 'Invalid building UUID format' });
    }

    try {
        const newRoom = await createRoom(building_id, name, capacity);
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a room
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { building_id, name, capacity } = req.body;

    if (!validateUUID(id) || !validateUUID(building_id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const updatedRoom = await updateRoom(id, building_id, name, capacity);
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(updatedRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a room
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const deletedRoom = await deleteRoom(id);
        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully', deletedRoom });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
