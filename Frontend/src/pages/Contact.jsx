import { useState } from 'react'
import axios from 'axios'
import ContactSection from '../components/ContactSection'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post('http://localhost:3000/contact', form)
    setSuccess(true)
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <>
      <ContactSection/>
    </>
  )
}

export default Contact