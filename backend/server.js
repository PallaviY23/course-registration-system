const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Dummy data to simulate your MySQL DB for now
const courses = [
  { id: 'CE371', name: 'DESIGN OF REINFORCED CONCRETE STRUCTURES', instructor: 'VINAY KUMAR GUPTA', credits: 9, status: 'Form Submitted', type: 'DE' },
  { id: 'CE683', name: 'HUMANS, ENVIRONMENT AND SUSTAINABLE DEV', instructor: 'MANOJ TIWARI', credits: 9, status: 'Form Submitted', type: 'DE' },
  { id: 'CS610', name: 'PROGRAMMING FOR PERFORMANCE', instructor: 'SWARNENDU BISWAS', credits: 9, status: 'Form Submitted', type: 'DE' }
];

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));