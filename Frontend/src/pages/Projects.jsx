import { useState, useEffect } from 'react'
import axios from 'axios'

function Projects() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios.get('http://localhost:3000/projects').then(res => setProjects(res.data))
  }, [])

  return (
    <div style={{ padding: '40px' }}>
      <h2>Projects</h2>
      {projects.length === 0 && <p>No projects yet.</p>}
      {projects.map(project => (
        <div key={project.id} style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '12px', borderRadius: '8px' }}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub →</a>
          )}
        </div>
      ))}
    </div>
  )
}

export default Projects