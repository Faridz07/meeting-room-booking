const express = require('express');
const router = express.Router();
const { validateUUID } = require('../utils/uuid');
const {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    checkRoomAvailability
} = require('../model/booking');

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await getAllBookings();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a booking by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const booking = await getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new booking
router.post('/', async (req, res) => {
    try {
        const { room_id, start_time, end_time, purpose } = req.body;
        const newBooking = await createBooking(room_id, start_time, end_time, purpose);
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a booking
router.put('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const { room_id, start_time, end_time, purpose } = req.body;
        const updatedBooking = await updateBooking(req.params.id, room_id, start_time, end_time, purpose);
        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateUUID(id)) {
        return res.status(400).json({ message: 'Invalid UUID format' });
    }

    try {
        const deletedBooking = await deleteBooking(req.params.id);
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking deleted successfully', deletedBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
