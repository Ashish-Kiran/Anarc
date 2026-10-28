const express = require('express')
const router = express.Router()
const prisma = require('../prismaClient')
const { authenticate, requireAdmin } = require("../middlewares/auth.middleware.js");

// ─── Create Event (admin only) ─────────────────────────────────────────────
router.post('/events', authenticate, async (req, res) => {
  try {
    const { name, title, description, date, venue, authorId, items } = req.body

    const event = await prisma.event.create({
      data: {
        name,
        title,
        description,
        venue: venue || null,
        date: date ? new Date(date) : null,
        authorId,
        items: {
          create: items?.map(item => ({
            title: item.title,
            photo: item.photo,
            explanation: item.explanation
          })) || []
        }
      },
      include: { items: true }
    })

    res.status(201).json(event)
  } catch (err) {
    console.error('Create event error:', err)
    res.status(500).json({ error: 'Failed to create event' })
  }
})

// ─── Get All Events ────────────────────────────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { items: true, author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(events)
  } catch (err) {
    console.error('Get events error:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// ─── Get Single Event ──────────────────────────────────────────────────────
router.get('/events/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { items: true, author: { select: { name: true } } }
    })
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json(event)
  } catch (err) {
    console.error('Get event error:', err)
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

// ─── Update Event (admin only) ─────────────────────────────────────────────
router.put('/events/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, title, description, date, venue, items } = req.body
    const eventId = parseInt(req.params.id)

    const existing = await prisma.event.findUnique({ where: { id: eventId } })
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    await prisma.eventItem.deleteMany({ where: { eventId } })

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        name,
        title,
        description,
        venue: venue || null,
        date: date ? new Date(date) : null,
        items: {
          create: items?.map(item => ({
            title: item.title,
            photo: item.photo,
            explanation: item.explanation
          })) || []
        }
      },
      include: { items: true }
    })

    res.json(event)
  } catch (err) {
    console.error('Update event error:', err)
    res.status(500).json({ error: 'Failed to update event' })
  }
})

// ─── Delete Event (admin only) ─────────────────────────────────────────────
router.delete('/events/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id)

    const existing = await prisma.event.findUnique({ where: { id: eventId } })
    if (!existing) return res.status(404).json({ error: 'Event not found' })

    await prisma.eventItem.deleteMany({ where: { eventId } })
    await prisma.event.delete({ where: { id: eventId } })

    res.json({ message: 'Event deleted successfully' })
  } catch (err) {
    console.error('Delete event error:', err)
    res.status(500).json({ error: 'Failed to delete event' })
  }
})

// ─── Get My Events (member) ────────────────────────────────────────────────
router.get("/my-events", authenticate, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })
    res.json(events)
  } catch (err) {
    console.error('Get my events error:', err)
    res.status(500).json({ error: "Failed to fetch your events" })
  }
})

// ─── Toggle isActive (admin only) ─────────────────────────────────────────
router.patch("/events/:id/toggle", authenticate, requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
    })
    if (!existing) return res.status(404).json({ error: "Event not found" })

    const event = await prisma.event.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: !existing.isActive },
    })

    res.json({ message: `Event ${event.isActive ? "activated" : "deactivated"}`, event })
  } catch (err) {
    console.error('Toggle event error:', err)
    res.status(500).json({ error: "Failed to toggle event status" })
  }
})

module.exports = router