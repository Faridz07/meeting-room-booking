const express = require('express');
const router = express.Router();
const { validateUUID } = require('../utils/uuid');
const { 
    getAllBuildings, 
    getBuildingById, 
    createBuilding, 
    updateBuilding, 
    deleteBuilding 
} = require('../model/building');

// GET all buildings
router.get('/', async (req, res) => {
    try {
        const buildings = await getAllBuildings();
        res.json(buildings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single building by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const building = await getBuildingById(id);
        if (!building) {
            return res.status(404).json({ message: 'Building not found' });
        }
        res.json(building);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new building
router.post('/', async (req, res) => {
    try {
        const { name, location } = req.body;
        const newBuilding = await createBuilding(name, location);
        res.status(201).json(newBuilding);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a building
router.put('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const { name, location } = req.body;
        const updatedBuilding = await updateBuilding(req.params.id, name, location);
        if (!updatedBuilding) {
            return res.status(404).json({ message: 'Building not found' });
        }
        res.json(updatedBuilding);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a building
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const deletedBuilding = await deleteBuilding(req.params.id);
        if (!deletedBuilding) {
            return res.status(404).json({ message: 'Building not found' });
        }
        res.json({ message: 'Building successfully deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
