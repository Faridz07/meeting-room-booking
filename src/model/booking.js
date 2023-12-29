const pool = require('../config/db');
const timeslot = require('../constant/timeslot');
const { formatTime } = require('../utils/date');
const { 
    getRoomById
} = require('./room'); 

const getAllBookings = async () => {
    const { rows } = await pool.query('SELECT * FROM bookings');
    return rows;
};

const getBookingById = async (bookingId) => {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    return rows[0];
};

const isBookingOverlap = async (roomId, startTime, endTime, excludeBookingId = null) => {
    let query = 'SELECT 1 FROM bookings WHERE room_id = $1 AND start_time < $3 AND end_time > $2';
    let params = [roomId, startTime, endTime];

    if (excludeBookingId) {
        query += ' AND id != $4';
        params.push(excludeBookingId);
    }

    const { rows } = await pool.query(query, params);
    return rows.length > 0;
};

const createBooking = async (room_id, start_time, end_time, purpose) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const room = await getRoomById(room_id);
        if (!room) {
            throw new Error('Room not found');
        }

        const requestedSlot = `${formatTime(start_time)}-${formatTime(end_time)}`;
        if (!timeslot.includes(requestedSlot)) {
            throw new Error('Invalid time slot for booking');
        }

        if (await isBookingOverlap(room_id, start_time, end_time)) {
            throw new Error('Room is already booked during the specified time');
        }

        const insertResult = await client.query(
            'INSERT INTO bookings (room_id, start_time, end_time, purpose) VALUES ($1, $2, $3, $4) RETURNING *',
            [room_id, start_time, end_time, purpose]
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

const updateBooking = async (id, room_id, start_time, end_time, purpose) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const booking = await getBookingById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        const room = await getRoomById(room_id);
        if (!room) {
            throw new Error('Room not found');
        }

        const requestedSlot = `${formatTime(start_time)}-${formatTime(end_time)}`;
        if (!timeslot.includes(requestedSlot)) {
            throw new Error('Invalid time slot for booking');
        }

        if (await isBookingOverlap(room_id, start_time, end_time, id)) {
            throw new Error('Room is already booked during the specified time');
        }

        const { rows } = await client.query(
            'UPDATE bookings SET room_id = $2, start_time = $3, end_time = $4, purpose = $5 WHERE id = $1 RETURNING *',
            [id, room_id, start_time, end_time, purpose]
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

const deleteBooking = async (id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const booking = await getBookingById(id);
        if (!booking) {
            throw new Error('Booking not found');
        }

        const deleteResult = await client.query(
            'DELETE FROM bookings WHERE id = $1 RETURNING *',
            [id]
        );

        await client.query('COMMIT');
        return deleteResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const checkRoomAvailabilityForDay = async (roomId, date) => {
    const availability = {};

    for (const slot of timeslot) {
        const [startTime, endTime] = slot.split("-");
        const startDateTime = `${date}T${startTime}:00`;
        const endDateTime = `${date}T${endTime}:00`;

        const room = await getRoomById(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        const { rows } = await pool.query(
            'SELECT 1 FROM bookings WHERE room_id = $1 AND NOT (end_time <= $2 OR start_time >= $3)',
            [roomId, startDateTime, endDateTime]
        );

        availability[slot] = rows.length === 0 ? "Available" : "Booked";
    }

    return availability;
};

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    checkRoomAvailabilityForDay
};
