import { useState, useEffect } from 'react'
import axios from 'axios'
import TeamSection from '../components/TeamSection'
import TEAM_MEMBERS from '../components/Data'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

function Members() {
  const [members, setMembers] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3000/users').then(res => setMembers(res.data))
  }, [])

  return (
    <>
      <Navbar/>
        <div style={{ padding: '40px', color: 'white' }}>
          <h2>Club Members</h2>
          <TeamSection members={TEAM_MEMBERS}/>
        </div>
      <Footer/>
    </>
  )
}

export default Members