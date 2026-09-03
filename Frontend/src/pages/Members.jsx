import { useState, useEffect } from 'react'
import axios from 'axios'
import TeamSection from '../components/TeamSection'
import TEAM_MEMBERS from '../components/Data'

function Members() {
  const [members, setMembers] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3000/users').then(res => setMembers(res.data))
  }, [])

  return (
    <div style={{ padding: '40px', color: 'white' }}>
      <h2>Club Members</h2>
      <TeamSection members={TEAM_MEMBERS}/>
      
    </div>
  )
}

export default Members